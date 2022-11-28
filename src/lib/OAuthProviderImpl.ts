import * as fs from 'fs';
import got from 'got';
import { Token, OAuthProviderConfig } from '../index';
import * as os from 'os'

const homedir = os.homedir()
const BACKOFF_TOKEN_ENDPOINT_FAILURE = 1000

type TokenGrantAudiences = 'OPERATE' | 'ZEEBE' | 'OPTIMIZE' | 'TASKLIST' | 'CONSOLE'

export class OAuthProviderImpl {
    private static readonly defaultTokenCache = `${homedir}/.camunda`;
    private static readonly getTokenCacheDirFromEnv = () => process.env.CAMUNDA_TOKEN_CACHE_DIR || OAuthProviderImpl.defaultTokenCache;
    private cacheDir: string;
    private zeebeAudience: string;
    private authServerUrl: string;
    private clientId: string;
    private clientSecret: string;
    private useFileCache: boolean;
    private tokenCache: { [key: string]: Token; } = {};
    private failed = false;
    private failureCount = 0;
    private userAgentString: string;

    constructor({
        /** OAuth Endpoint URL */
        authServerUrl,
        /** OAuth Audience */
        audience, clientId, clientSecret,
        userAgentString
    }: OAuthProviderConfig) {
        this.authServerUrl = authServerUrl;
        this.zeebeAudience = audience;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.useFileCache = process.env.CAMUNDA_TOKEN_CACHE !== "memory-only";
        this.cacheDir = OAuthProviderImpl.getTokenCacheDirFromEnv();

        this.userAgentString = userAgentString; // e.g.: `zeebe-client-nodejs/${pkg.version} ${CUSTOM_AGENT_STRING}`

        if (this.useFileCache) {
            try {
                if (!fs.existsSync(this.cacheDir)) {
                    fs.mkdirSync(this.cacheDir);
                }
                fs.accessSync(this.cacheDir, fs.constants.W_OK);
            } catch (e) {
                throw new Error(
                    `FATAL: Cannot write to OAuth cache dir ${this.cacheDir}\n` +
                    'If you are running on AWS Lambda, set the HOME environment variable of your lambda function to /tmp'
                );
            }
        }
    }

    public async getToken(audience: TokenGrantAudiences): Promise<string> {
        const key = this.getCacheKey(audience)

        if (this.tokenCache[key]) {
            return this.tokenCache[key].access_token;
        }
        if (this.useFileCache) {
            const cachedToken = this.fromFileCache(this.clientId, audience);
            if (cachedToken) {
                return cachedToken.access_token;
            }
        }

        return new Promise((resolve, reject) => {
            setTimeout(
                () => {
                    this.debouncedTokenRequest(audience)
                        .then(res => {
                            this.failed = false;
                            this.failureCount = 0;
                            resolve(res);
                        })
                        .catch(e => {
                            this.failureCount++;
                            this.failed = true;
                            reject(e);
                        });
                },
                this.failed ? BACKOFF_TOKEN_ENDPOINT_FAILURE * this.failureCount : 1
            );
        });
    }

    private debouncedTokenRequest(audience: TokenGrantAudiences) {
        const form = {
            audience: this.getAudience(audience),
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
        };

        return got
            .post(this.authServerUrl, {
                form,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'user-agent': this.userAgentString,
                },
            })
            .then(res => this.safeJSONParse(res.body)
            .then(t => {
                    const token = {...t, audience}
                    if (this.useFileCache) {
                        this.toFileCache(token, audience);
                    }
                    const key = this.getCacheKey(audience)
                    this.tokenCache[key] = token;
                    this.startExpiryTimer(token);
                    return token.access_token;
                })
            );
    }

    private safeJSONParse(thing: any): Promise<Token> {
        return new Promise((resolve, reject) => {
            try {
                resolve(JSON.parse(thing));
            } catch (e) {
                reject(e);
            }
        });
    }

    private fromFileCache(clientId: string, audience: TokenGrantAudiences) {
        let token: Token;
        const tokenCachedInFile = fs.existsSync(this.getCachedTokenFileName(clientId, audience));
        if (!tokenCachedInFile) {
            return null;
        }
        try {
            token = JSON.parse(
                fs.readFileSync(this.getCachedTokenFileName(clientId, audience), 'utf8')
            );

            if (this.isExpired(token)) {
                return null;
            }
            this.startExpiryTimer(token);
            return token;
        } catch (_) {
            return null;
        }
    }

    private toFileCache(token: Token, audience: TokenGrantAudiences) {
        const d = new Date();
        const file = this.getCachedTokenFileName(this.clientId, audience);

        fs.writeFile(
            file,
            JSON.stringify({
                ...token,
                expiry: d.setSeconds(d.getSeconds() + token.expires_in),
            }),
            e => {
                if (!e) {
                    return;
                }
                // tslint:disable-next-line
                console.error('Error writing OAuth token to file' + file);
                // tslint:disable-next-line
                console.error(e);
            }
        );
    }

    private isExpired(token: Token) {
        const d = new Date();
        return token.expiry <= d.setSeconds(d.getSeconds());
    }

    private startExpiryTimer(token: Token) {
        const d = new Date();
        const current = d.setSeconds(d.getSeconds());
        const validityPeriod = token.expiry - current * 1000;
        if (validityPeriod <= 0) {
            delete this.tokenCache[this.clientId];
            return;
        }
        setTimeout(() => delete this.tokenCache[this.clientId], validityPeriod);
    }

    private getCacheKey = (audience: TokenGrantAudiences) => `${this.clientId}-${audience}`
    private getCachedTokenFileName = (clientId: string, audience: TokenGrantAudiences) => `${this.cacheDir}/oauth-token-${clientId}-${audience}.json`;
    
    private getAudience(audience: TokenGrantAudiences) {
        const audiences: {[key: string]: string} = {
            OPERATE: 'operate.camunda.io',
            ZEEBE: this.zeebeAudience,
            OPTIMIZE: 'optimize.camunda.io',
            TASKLIST: 'tasklist.camunda.io',
            CONSOLE: 'api.cloud.camunda.io'
        }
        return audiences[audience]
    }
}
