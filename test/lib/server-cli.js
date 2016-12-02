'use strict'

const test = require('ava')
const Boom = require('boom')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../../lib/server-cli.js'

const PROJECT_NAME = 'valid project name'
const JSON_API_PROJECT = require('../fixtures/json-api-data.json')

test.beforeEach((t) => {
  process.env.PROJECT_REGISTRY_ORIGIN = 'this is my project registry url'
  process.env.PROJECT_REGISTRY_SECRET = 'this is my project registry secret'
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({
      'request': {
        get: (url, data, cb) => cb(null, {statusCode: 200}, JSON_API_PROJECT)
      }
    }, overrides))
  }
})

test.afterEach((t) => {
  delete process.env.PROJECT_REGISTRY_ORIGIN
  delete process.env.PROJECT_REGISTRY_SECRET
})

test('Should reject with Boom error if bmProject is invalid', (t) => {
  t.plan(1)
  const lib = t.context.getTestSubject()

  return lib()
    .catch((err) => t.deepEqual(err, Boom.badRequest('Invalid \'bmProject\' parameter on query string')))
})

test('Should pass correct arguments to request.get() and resolve to settings', (t) => {
  t.plan(2)
  const lib = t.context.getTestSubject({
    'request': {
      get: (url, data, cb) => {
        t.is(url, `${process.env.PROJECT_REGISTRY_ORIGIN}/v1/projects?filter={"attributes.name":"${PROJECT_NAME}"}&include=service`)
        cb(null, {statusCode: 200}, JSON_API_PROJECT)
      }
    }
  })

  return lib(PROJECT_NAME)
    .then((settings) => t.deepEqual(settings, {
      bucket: JSON_API_PROJECT.included[0].attributes.awsS3Bucket,
      serviceOrigin: JSON_API_PROJECT.included[0].attributes.origin
    }))
})

test('Should reject with Boom error if request.get() returns an error', (t) => {
  t.plan(1)
  const lib = t.context.getTestSubject({
    'request': {
      get: (url, data, cb) => cb(new Error('test error'))
    }
  })

  return lib(PROJECT_NAME)
    .catch((err) => t.deepEqual(err, Boom.wrap(new Error('test error'))))
})

test('Should reject with correct Boom error if request.get() does not return a statusCode of 200', (t) => {
  t.plan(1)
  const lib = t.context.getTestSubject({
    'request': {
      get: (url, data, cb) => cb(null, {statusCode: 404}, {message: 'missing'})
    }
  })

  return lib(PROJECT_NAME)
    .catch((err) => t.deepEqual(err, Boom.notFound('missing')))
})

test('Should reject with correct not found Boom error if request.get() does not return a single project', (t) => {
  t.plan(1)
  const lib = t.context.getTestSubject({
    'request': {
      get: (url, data, cb) => cb(null, {statusCode: 200}, {data: []})
    }
  })

  return lib(PROJECT_NAME)
    .catch((err) => t.deepEqual(err, Boom.notFound(`Could not find project: ${PROJECT_NAME}`)))
})
