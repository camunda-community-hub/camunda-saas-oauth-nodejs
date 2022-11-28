import { OAuthProvider } from "../lib/OAuthProvider";

test('Can get an Operate token from the environment vars', async () => {
    const o = new OAuthProvider('client-nodejs testing')
    const token = await o.getToken('OPERATE')
    console.log(token)
    expect(typeof token).toBe("string")
})

xtest('Can get a console token from the environment vars', async () => {
    const o = new OAuthProvider('client-nodejs testing')
    const token = await o.getToken('CONSOLE')
    console.log(token)
    expect(typeof token).toBe("string")
})