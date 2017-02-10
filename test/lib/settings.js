/* @flow */
'use strict'

const test = require('ava')
const Boom = require('boom')
const proxyquire = require('proxyquire')

const logger = require('../fixtures/logger.js')

const TEST_SUBJECT = '../../lib/settings.js'

const SERVER_CLI_SETTINGS = {
  bucket: 'valid bucket',
  serviceOrigin: 'valid service origin'
}

const getTestSubject = (overrides) => {
  overrides = overrides || {}
  return proxyquire(TEST_SUBJECT, Object.assign({
    './server-cli.js': () => Promise.resolve(SERVER_CLI_SETTINGS)
  }, overrides))
}

test('Should reject with Boom error if bmService is invalid', (t) => {
  t.plan(1)
  const lib = getTestSubject()

  return lib(logger, {})
    .catch((err) => t.deepEqual(err, Boom.badRequest('Invalid \'bmService\' parameter on query string')))
})

test('Should resolve to Server CLI settings for "@blinkmobile/server-cli"', (t) => {
  t.plan(2)
  const lib = getTestSubject({
    './server-cli.js': (log, project) => {
      t.is(project, 'valid project name')
      return Promise.resolve(SERVER_CLI_SETTINGS)
    }
  })
  return lib(logger, {
    bmProject: 'valid project name',
    bmService: '@blinkmobile/server-cli'
  })
    .then((settings) => t.deepEqual(settings, SERVER_CLI_SETTINGS))
})
