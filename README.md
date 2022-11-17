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
import { OAuthProvider } from "camunda-saas-oauth"

const o = new OAuthProvider('myclient-nodejs/1.0.0')

o.getToken('OPERATE').then(token => {
    // Make an API call to Operate in Camunda SaaS with the token
})
```

`OAuthProvider` grabs the client credentials from the environment. No need to pass anything to the constructor except a custom user agent string.

For `getToken`, specify if you want a token for `ZEEBE` | `OPERATE` | `OPTIMIZE` | `TASKLIST`.

## Configuration

Set the API client credentials in the environment.

To configure a different cache directory, set the `CAMUNDA_TOKEN_CACHE_DIR` environment variable.

To turn off disk caching, set the environment variable `CAMUNDA_TOKEN_CACHE=memory-only`.

## User Agent

Example of a custom user agent string: `zeebe-client-nodejs/${pkg.version} ${CUSTOM_AGENT_STRING}`



