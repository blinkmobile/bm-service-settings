/* @flow */
'use strict'

/* ::
import type {JWTPayload} from '../types.js'
*/

// Use boom for error handling
const Boom = require('boom')
// Use jsonwebtoken for verifying access token sent in header of request
const jwt = require('jsonwebtoken')

const ensureEnvVariable = require('./ensure-env-var.js')

function authenticate (
  authorization /* : string */
) /* : Promise<JWTPayload> */ {
  const audience = ensureEnvVariable('JWT_AUDIENCE')
  const issuer = ensureEnvVariable('JWT_ISSUER')
  const jwtSecret = ensureEnvVariable('JWT_SECRET')
  // authorization should be 'Bearer thisismyaccesstoken'
  const auth = authorization.split(' ')
  const token = auth[1]
  if (!token) {
    throw Boom.unauthorized('Please provider the correct authentication credentials', 'Bearer')
  }
  const secret = new Buffer(jwtSecret, 'base64') // eslint-disable-line node/no-deprecated-api
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, {
      audience,
      issuer
    }, (error, data) => {
      if (error) {
        reject(Boom.unauthorized('Please provider the correct authentication credentials', 'Bearer', error)) // 401
        return
      }
      resolve(data)
    })
  })
}

module.exports = authenticate
