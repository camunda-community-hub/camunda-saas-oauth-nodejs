# Camunda SaaS OAuth for Node.js

A library to exchange a set of Camunda 8 SaaS API credentials for a token to make API calls to Camunda 8 SaaS.

Caches the token to disk, and refreshes tokens before they expire.

## Installation

Install as a dependency:

```
npm i camunda-saas-oauth
```

## Usage

```typescript
import { OAuthProviderFromEnv } from "camunda-saas-oauth"

const o = new OAuthProviderFromEnv('myclient-nodejs/1.0.0')

o.getToken().then(token => {
    // Make an API to Camunda SaaS with the token
})
```

`OAuthProviderFromEnv` grabs the client credentials from the environment. No need to configure anything except a custom user agent string.

## User Agent

Example of a custom user agent string: `zeebe-client-nodejs/${pkg.version} ${CUSTOM_AGENT_STRING}`



