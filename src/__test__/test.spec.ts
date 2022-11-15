import { OAuthProviderFromEnv } from "../lib/OAuthProviderFromEnv";

test('Can get a token from the environment vars', async () => {
    const o = new OAuthProviderFromEnv('client-nodejs testing')
    const token = await o.getToken()
    console.log(token)
    expect(typeof token).toBe("string")
})