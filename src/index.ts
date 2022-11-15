export interface Token {
	access_token: string
	scope: string
	expires_in: number
	token_type: string
	expiry: number
}

export interface OAuthProviderConfig {
	/** OAuth Endpoint URL */
	authServerUrl: string
	/** OAuth Audience */
	audience: string
	clientId: string
	clientSecret: string
    userAgentString: string
}

export { OAuthProviderImpl } from "./lib/OAuthProviderImpl"
export { OAuthProvider } from "./lib/OAuthProvider"