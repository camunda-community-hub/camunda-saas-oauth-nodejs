# Camunda SaaS OAuth for Node.js

 [![NPM](https://nodei.co/npm/camunda-saas-oauth.png)](https://npmjs.org/package/camunda-saas-oauth) 

![Community Extension](https://img.shields.io/badge/Community%20Extension-An%20open%20source%20community%20maintained%20project-FF4700)

![Lifecycle](https://img.shields.io/badge/Lifecycle-Stable-brightgreen)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A library to exchange a set of Camunda 8 SaaS API credentials for a token to make API calls to Camunda 8 SaaS. Uses [camunda-8-credentials-from-env](https://github.com/camunda-community-hub/camunda-8-credentials-from-env) to get the credentials from the environment.

Caches the token to disk, and refreshes tokens before they expire.

## Installation

Install as a dependency:

```
npm i camunda-saas-oauth
```

## Usage

For example, to get a token to interact with the Operate API: 

```typescript
import { getOperateToken } from "camunda-saas-oauth"

getOperateToken('myclient-nodejs/1.0.0').then(token => {
    // Make an API call to Operate in Camunda SaaS with the token
})
```

`getOperateToken` grabs the client credentials from the environment. No need to pass anything except a custom user agent string.

## Configuration

Set the API client credentials in the environment, using [the environment variables from the web console](https://docs.camunda.io/docs/components/console/manage-clusters/manage-api-clients/).

To configure a different cache directory, set the `CAMUNDA_TOKEN_CACHE_DIR` environment variable.

To turn off disk caching, set the environment variable `CAMUNDA_TOKEN_CACHE=memory-only`.

## User Agent

Example of a custom user agent string: `mycustom-client-nodejs/${pkg.version} ${CUSTOM_AGENT_STRING}`



