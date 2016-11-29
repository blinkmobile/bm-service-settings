/* @flow */
'use strict'

/* ::
import type {
  ServerCLISettings
} from '../types.js'
*/

const Boom = require('boom')
const request = require('request')

const ensureEnvVariable = require('./ensure-env-var.js')

function serverCLI (
  bmProject /* : string | void */
) /* : Promise<ServerCLISettings> */ {
  if (!bmProject) {
    return Promise.reject(Boom.badRequest('Invalid \'bmProject\' parameter on query string'))
  }

  const projectRegistryOrigin = ensureEnvVariable('PROJECT_REGISTRY_ORIGIN')

  return new Promise((resolve, reject) => {
    request.get(`${projectRegistryOrigin}projects?name=${bmProject || ''}`, function (err, response, body) {
      if (err) return reject(Boom.wrap(err))
      if (response.statusCode !== 200) return reject(Boom.create(response.statusCode, body.message))

      resolve({
        bucket: body.service.details.deployS3Bucket,
        serviceOrigin: body.service.details.origin
      })
    })
  })
}

module.exports = serverCLI
