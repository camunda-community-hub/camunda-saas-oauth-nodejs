# Camunda SaaS OAuth for Node.js

 [![NPM](https://nodei.co/npm/camunda-saas-oauth.png)](https://npmjs.org/package/camunda-saas-oauth) 

![Community Extension](https://img.shields.io/badge/Community%20Extension-An%20open%20source%20community%20maintained%20project-FF4700)

![Lifecycle](https://img.shields.io/badge/Lifecycle-Stable-brightgreen)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

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



