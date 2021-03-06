/* @flow */
'use strict'

const test = require('ava')
const Boom = require('boom')
const jwt = require('jsonwebtoken')

const lib = require('../../lib/authenticate.js')

test('Should throw Boom error if environment variables are not set', (t) => {
  t.plan(1)
  try {
    lib('')
  } catch (err) {
    t.deepEqual(err, Boom.badImplementation('JWT_AUDIENCE environment variable is mandatory'))
  }
})

test('Should throw Boom error if authorization does not contain a token', (t) => {
  t.plan(1)
  process.env.JWT_AUDIENCE = 'this is my audience'
  process.env.JWT_ISSUER = 'this is my issuer'
  process.env.JWT_SECRET = 'this is my secret'
  try {
    lib('')
  } catch (err) {
    t.deepEqual(err, Boom.unauthorized('Please provide the correct authentication credentials', 'Bearer'))
  }
})

test('Should resolve with payload', (t) => {
  process.env.JWT_AUDIENCE = 'this is my audience'
  process.env.JWT_ISSUER = 'this is my issuer'
  process.env.JWT_SECRET = 'this is my secret'
  const secret = Buffer.from(process.env.JWT_SECRET, 'base64')
  const token = jwt.sign({
    aud: process.env.JWT_AUDIENCE,
    iss: process.env.JWT_ISSUER
  }, secret)

  return lib(`Bearer ${token}`)
    .then((payload) => {
      t.is(payload.aud, process.env.JWT_AUDIENCE)
      t.is(payload.iss, process.env.JWT_ISSUER)
    })
})

test('Should reject if secret is incorrect', (t) => {
  process.env.JWT_AUDIENCE = 'this is my audience'
  process.env.JWT_ISSUER = 'this is my issuer'
  process.env.JWT_SECRET = 'this is the wrong secret'
  const token = jwt.sign({
    aud: process.env.JWT_AUDIENCE,
    iss: process.env.JWT_ISSUER
  }, 'this is my secret')

  return lib(`Bearer ${token}`)
    .catch((err) => t.deepEqual(err.output.payload.attributes, {
      name: 'JsonWebTokenError',
      message: 'invalid signature',
      error: 'Please provide the correct authentication credentials'
    }))
})

test('Should reject if audience is incorrect', (t) => {
  process.env.JWT_AUDIENCE = 'this is my audience'
  process.env.JWT_ISSUER = 'this is my issuer'
  process.env.JWT_SECRET = 'this is my secret'
  const secret = Buffer.from(process.env.JWT_SECRET, 'base64')
  const token = jwt.sign({
    aud: 'incorrect audience',
    iss: process.env.JWT_ISSUER
  }, secret)

  return lib(`Bearer ${token}`)
    .catch((err) => t.deepEqual(err.output.payload.attributes, {
      name: 'JsonWebTokenError',
      message: 'jwt audience invalid. expected: this is my audience',
      error: 'Please provide the correct authentication credentials'
    }))
})

test('Should reject if issuer is incorrect', (t) => {
  process.env.JWT_AUDIENCE = 'this is my audience'
  process.env.JWT_ISSUER = 'this is my issuer'
  process.env.JWT_SECRET = 'this is my secret'
  const secret = Buffer.from(process.env.JWT_SECRET, 'base64')
  const token = jwt.sign({
    aud: process.env.JWT_AUDIENCE,
    iss: 'incorrect issuer'
  }, secret)

  return lib(`Bearer ${token}`)
    .catch((err) => t.deepEqual(err.output.payload.attributes, {
      name: 'JsonWebTokenError',
      message: 'jwt issuer invalid. expected: this is my issuer',
      error: 'Please provide the correct authentication credentials'
    }))
})
