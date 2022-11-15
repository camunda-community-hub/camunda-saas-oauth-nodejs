export interface Token {
	access_token: string
	scope: string
	expires_in: number
	token_type: string
	expiry: number
}

export interface OAuthProviderConfig {
	/** OAuth Endpoint URL */
	url: string
	/** OAuth Audience */
	audience: string
	clientId: string
	clientSecret: string
    userAgentString: string
	/** Cache token in memory and on filesystem? */
	cacheOnDisk?: boolean
	/** Override default token cache directory */
	cacheDir?: string
}

export { OAuthProvider } from "./lib/OAuthProvider"
export { OAuthProviderFromEnv } from "./lib/OAuthProviderFromEnv"
