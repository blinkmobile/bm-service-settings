# bm-service-settings [![AppVeyor Status](https://img.shields.io/appveyor/ci/blinkmobile/bm-service-settings/master.svg)](https://ci.appveyor.com/project/blinkmobile/bm-service-settings) [![Travis CI Status](https://travis-ci.org/blinkmobile/bm-service-settings.svg?branch=master)](https://travis-ci.org/blinkmobile/bm-service-settings)

Provides settings for BlinkMobile services.

## Web Service API

### Authentication

-   set the Authorization header in your HTTP request

-   value must be "Bearer JWT", substituting "JWT" for a JSON Web Token

-   JSON Web Token must contain Auth0 user details

-   JSON Web Token signature must correlate with JWT_SECRET (see below)

### GET /v1/settings

Get settings for a BlinkMobile service

Request query string should encode the following key-value pair:

-   **bmService**: The BlinkMobile service to get settings for, possible values:

   -   _@blinkmobile/server-cli_

## Environment Variables

Environment variables are set using [dotenv](https://www.npmjs.com/package/dotenv).

### Setup

1.  Create `.env` file in the root of the project

1.  Set the environment variables below with the following syntax:

```
# This is a commented out line and will be ignored
JWT_AUDIENCE=123
JWT_ISSUER=abc
JWT_SECRET="secret"
```

### Authentication

-   **JWT_AUDIENCE**: Audience used when JWT was signed, verify 'aud'

-   **JWT_ISSUER**: Issuer used when JWT was signed, verify 'iss'

-   **JWT_SECRET**: Base64 secret used to sign JWT, verify their signatures

### Server CLI

-   **SERVER_CLI_BUCKET**: "Bucket" option used when uploading projects

-   **SERVER_CLI_REGION**: "region" option used for AWS S3 requests

-   **SERVER_CLI_SERVICE_ORIGIN**: Origin for the service to call when deploying projects

## Deployment

This project uses the BlinkMobile Server CLI tool for deployment

```
npm install -g @blinkmobile/cli @blinkmobile/identity-cli @blinkmobile/server-cli
```

1.  Login using the Identity CLI

    ```
    bm identity login
    ```

1.  Clone this repository

1.  Ensure environment variables are set in a `.env` file, see above for more details

1.  Run the following command from your terminal:

    ```
    bm server deploy path/to/project/root
    ```
