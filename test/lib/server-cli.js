'use strict'

const test = require('ava')
const Boom = require('boom')
const proxyquire = require('proxyquire')

const TEST_SUBJECT = '../../lib/server-cli.js'

const PROJECT_NAME = 'valid project name'
const PROJECT = {
  service: {
    details: {
      deployS3Bucket: 'valid bucket name',
      origin: 'valid origin'
    }
  }
}

test.beforeEach((t) => {
  process.env.PROJECT_REGISTRY_ORIGIN = 'this is my project registry url'
  t.context.getTestSubject = (overrides) => {
    overrides = overrides || {}
    return proxyquire(TEST_SUBJECT, Object.assign({
      'request': {
        get: (url, cb) => cb(null, {statusCode: 200}, PROJECT)
      }
    }, overrides))
  }
})

test.afterEach((t) => {
  process.env.PROJECT_REGISTRY_ORIGIN = undefined
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
      get: (url, cb) => {
        t.is(url, `${process.env.PROJECT_REGISTRY_ORIGIN}projects?name=${PROJECT_NAME}`)
        cb(null, {statusCode: 200}, PROJECT)
      }
    }
  })

  return lib(PROJECT_NAME)
    .then((settings) => t.deepEqual(settings, {
      bucket: PROJECT.service.details.deployS3Bucket,
      serviceOrigin: PROJECT.service.details.origin
    }))
})

test('Should reject with Boom error if request.get() returns an error', (t) => {
  t.plan(1)
  const lib = t.context.getTestSubject({
    'request': {
      get: (url, cb) => cb(new Error('test error'))
    }
  })

  return lib(PROJECT_NAME)
    .catch((err) => t.deepEqual(err, Boom.wrap(new Error('test error'))))
})

test('Should reject with correct Boom error if request.get() does not return a statusCode of 200', (t) => {
  t.plan(1)
  const lib = t.context.getTestSubject({
    'request': {
      get: (url, cb) => cb(null, {statusCode: 404}, {message: 'missing'})
    }
  })

  return lib(PROJECT_NAME)
    .catch((err) => t.deepEqual(err, Boom.notFound('missing')))
})
