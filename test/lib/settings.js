'use strict'

const test = require('ava')
const Boom = require('boom')

const lib = require('../../lib/settings.js')

test('Should reject with Boom error if bmService is invalid', (t) => {
  t.plan(1)
  return lib()
    .catch((err) => t.deepEqual(err, Boom.badRequest('Invalid \'bmService\' parameter on query string')))
})

test('Should resolve to Server CLI settings for "@blinkmobile/server-cli"', (t) => {
  process.env.SERVER_CLI_BUCKET = 'this is my bucket'
  process.env.SERVER_CLI_SERVICE_ORIGIN = 'this is my deployment url'
  process.env.SERVER_CLI_REGION = 'this is my region'
  return lib('@blinkmobile/server-cli')
    .then((settings) => t.deepEqual(settings, {
      bucket: process.env.SERVER_CLI_BUCKET,
      serviceOrigin: process.env.SERVER_CLI_SERVICE_ORIGIN,
      region: process.env.SERVER_CLI_REGION
    }))
})
