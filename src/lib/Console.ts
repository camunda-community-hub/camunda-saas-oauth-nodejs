import { getConsoleCredentials } from "camunda-8-credentials-from-env"
import { OAuthProviderImpl } from "./OAuthProviderImpl"

let consoleOAuthProvider: OAuthProviderImpl

export function getConsoleToken(userAgentString: string) {
    if (consoleOAuthProvider === undefined) {
        const creds = getConsoleCredentials()
        consoleOAuthProvider = new OAuthProviderImpl({
            userAgentString,
            audience: 'api.cloud.camunda.io',
            clientId: creds.CAMUNDA_CONSOLE_CLIENT_ID,
            clientSecret: creds.CAMUNDA_CONSOLE_CLIENT_SECRET,
            authServerUrl: creds.CAMUNDA_OAUTH_URL
        })
    }
    return consoleOAuthProvider.getToken('CONSOLE')
}