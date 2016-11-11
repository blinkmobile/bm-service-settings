'use strict'

const test = require('ava')
const Boom = require('boom')

const lib = require('../../lib/ensure-env-var.js')

test('Should throw Boom error if environment variables are not set', (t) => {
  t.plan(2)
  try {
    lib('TEST')
  } catch (err) {
    t.deepEqual(err, Boom.badImplementation('TEST environment variable is mandatory'))
  }
  process.env.TEST = 'test'
  t.is(lib('TEST'), 'test')
})
