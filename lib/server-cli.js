/* @flow */
'use strict'

/* ::
import type {
  ServerCLISettings
} from '../types.js'
*/

const Boom = require('boom')
const jsonapi = require('jsonapi-datastore')
const request = require('request')

const ensureEnvVariable = require('./ensure-env-var.js')

function serverCLI (
  project /* : string | void */
) /* : Promise<ServerCLISettings> */ {
  const bmProject = project || ''
  if (!bmProject) {
    return Promise.reject(Boom.badRequest('Invalid \'bmProject\' parameter on query string'))
  }

  const projectRegistryOrigin = ensureEnvVariable('PROJECT_REGISTRY_ORIGIN')
  const projectRegistrySecret = ensureEnvVariable('PROJECT_REGISTRY_SECRET')

  return new Promise((resolve, reject) => {
    const url = `${projectRegistryOrigin}/v1/projects?filter={"attributes.name":"${bmProject}"}&include=service`
    request.get(url, {
      auth: {
        bearer: projectRegistrySecret
      },
      json: true
    }, function (err, response, body) {
      if (err) return reject(Boom.wrap(err))
      if (response.statusCode !== 200) return reject(Boom.create(response.statusCode, body.message))
      if (!body.data || body.data.length !== 1) return reject(Boom.notFound(`Could not find project: ${bmProject}`))

      const store = new jsonapi.JsonApiDataStore()
      store.sync(body)
      const serviceRelationship = body.data[0].relationships.service.data
      const service = store.find(serviceRelationship.type, serviceRelationship.id)

      resolve({
        bucket: service.awsS3Bucket,
        serviceOrigin: service.origin
      })
    })
  })
}

module.exports = serverCLI
