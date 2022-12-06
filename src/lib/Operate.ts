import { getOperateCredentials } from "camunda-8-credentials-from-env"
import { OAuthProviderImpl } from "./OAuthProviderImpl"

let operateOAuthProvider: OAuthProviderImpl

export function getOperateToken(userAgentString: string) {
    if (operateOAuthProvider === undefined) {
        const creds = getOperateCredentials()
        operateOAuthProvider = new OAuthProviderImpl({
            userAgentString,
            audience: creds.ZEEBE_TOKEN_AUDIENCE,
            clientId: creds.ZEEBE_CLIENT_ID,
            clientSecret: creds.ZEEBE_CLIENT_SECRET,
            authServerUrl: creds.CAMUNDA_OAUTH_URL
        })
    }
    return operateOAuthProvider.getToken('OPERATE')
}