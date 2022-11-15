import { OAuthProvider } from "../lib/OAuthProvider";

test('Can get a token from the environment vars', async () => {
    const o = new OAuthProvider('client-nodejs testing')
    const token = await o.getToken()
    console.log(token)
    expect(typeof token).toBe("string")
})