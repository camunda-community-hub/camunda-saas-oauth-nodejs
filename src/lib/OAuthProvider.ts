import * as fs from 'fs';
import got from 'got';
import { Token, OAuthProviderConfig } from '../index';
import * as os from 'os'

const homedir = os.homedir()
const BACKOFF_TOKEN_ENDPOINT_FAILURE = 1000

export class OAuthProvider {
    private static readonly defaultTokenCache = `${homedir}/.camunda`;
    private static readonly getTokenCacheDirFromEnv = () => process.env.ZEEBE_TOKEN_CACHE_DIR || OAuthProvider.defaultTokenCache;
    public cacheDir: string;
    public audience: string;
    public url: string;
    public clientId: string;
    public clientSecret: string;
    public useFileCache: boolean;
    public tokenCache: { [key: string]: Token; } = {};
    private failed = false;
    private failureCount = 0;
    private userAgentString: string;

    constructor({
        /** OAuth Endpoint URL */
        url,
        /** OAuth Audience */
        audience, cacheDir, clientId, clientSecret,
        /** Cache token in memory and on filesystem? */
        cacheOnDisk, userAgentString
    }: OAuthProviderConfig) {
        this.url = url;
        this.audience = audience;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.useFileCache = !!cacheOnDisk;
        this.cacheDir = cacheDir || OAuthProvider.getTokenCacheDirFromEnv();

        this.userAgentString = userAgentString; // `zeebe-client-nodejs/${pkg.version} ${CUSTOM_AGENT_STRING}`

        if (this.useFileCache) {
            try {
                if (!fs.existsSync(this.cacheDir)) {
                    fs.mkdirSync(this.cacheDir);
                }
                fs.accessSync(this.cacheDir, fs.constants.W_OK);
            } catch (e) {
                throw new Error(
                    `FATAL: Cannot write to OAuth cache dir ${cacheDir}\n` +
                    'If you are running on AWS Lambda, set the HOME environment variable of your lambda function to /tmp'
                );
            }
        }
    }

    public async getToken(): Promise<string> {
        if (this.tokenCache[this.clientId]) {
            return this.tokenCache[this.clientId].access_token;
        }
        if (this.useFileCache) {
            const cachedToken = this.fromFileCache(this.clientId);
            if (cachedToken) {
                return cachedToken.access_token;
            }
        }

        return new Promise((resolve, reject) => {
            setTimeout(
                () => {
                    this.debouncedTokenRequest()
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

    private debouncedTokenRequest() {
        const form = {
            audience: this.audience,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
        };

        return got
            .post(this.url, {
                form,
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'user-agent': this.userAgentString,
                },
            })
            .then(res => this.safeJSONParse(res.body)
            .then(token => {
                    if (this.useFileCache) {
                        this.toFileCache(token);
                    }
                    this.tokenCache[this.clientId] = token;
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

    private fromFileCache(clientId: string) {
        let token: Token;
        const tokenCachedInFile = fs.existsSync(this.cachedTokenFile(clientId));
        if (!tokenCachedInFile) {
            return null;
        }
        try {
            token = JSON.parse(
                fs.readFileSync(this.cachedTokenFile(clientId), 'utf8')
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

    private toFileCache(token: Token) {
        const d = new Date();
        const file = this.cachedTokenFile(this.clientId);

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

    private cachedTokenFile = (clientId: string) => `${this.cacheDir}/oauth-token-${clientId}.json`;
}
