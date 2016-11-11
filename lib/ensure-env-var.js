/* @flow */
'use strict'

// Use boom for error handling
const Boom = require('boom')

function ensureEnvVariable (
  variable /* : string */
) /* : string */ {
  if (!process.env[variable]) {
    // Throw error if any of the required configuration are not available as environment variables
    throw Boom.badImplementation(`${variable} environment variable is mandatory`)
  }
  return process.env[variable]
}

module.exports = ensureEnvVariable
