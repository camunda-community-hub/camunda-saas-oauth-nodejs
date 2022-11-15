import { OAuthProviderImpl } from "./OAuthProviderImpl";
import { getCamundaCredentialsFromEnv } from "camunda-8-credentials-from-env"

export class OAuthProvider extends OAuthProviderImpl {
    constructor(userAgentString: string) {
        const creds = getCamundaCredentialsFromEnv()
        if (!creds.complete) {
            throw new Error('Complete credentials not found in environment')
        }
        const audience = creds.ZEEBE_ADDRESS.split(':443')[0]
        super({
            audience,
            clientId: creds.ZEEBE_CLIENT_ID,
            clientSecret: creds.ZEEBE_CLIENT_SECRET,
            authServerUrl: creds.ZEEBE_AUTHORIZATION_SERVER_URL,
            userAgentString
        })
    }
}