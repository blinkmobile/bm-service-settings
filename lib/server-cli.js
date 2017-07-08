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
  logger /* : typeof console */,
  bmProject /* : string */
) /* : Promise<ServerCLISettings> */ {
  if (!bmProject) {
    return Promise.reject(Boom.badRequest('Invalid \'bmProject\' parameter on query string'))
  }

  const projectRegistryOrigin = ensureEnvVariable('PROJECT_REGISTRY_ORIGIN')
  const projectRegistrySecret = ensureEnvVariable('PROJECT_REGISTRY_SECRET')

  logger.log(`Making request to ${projectRegistryOrigin} for project settings for server-cli project: ${bmProject}`)
  return new Promise((resolve, reject) => {
    const url = `${projectRegistryOrigin}/v1/projects/${bmProject}?include=service`
    request.get(url, {
      auth: {
        bearer: projectRegistrySecret
      },
      json: true
    }, function (err, response, body) {
      if (err) {
        logger.error('Request to project registry failed.', err)
        return reject(Boom.wrap(err))
      }
      if (response.statusCode === 404) {
        return reject(Boom.notFound(`Could not find project: ${bmProject}`))
      }
      if (response.statusCode !== 200) {
        const error = Boom.create(response.statusCode, body.message)
        logger.error('Response from project registry was not 200 - OK', error)
        return reject(error)
      }

      const store = new jsonapi.JsonApiDataStore()
      store.sync(body)
      const project = store.find(body.data.type, body.data.id)
      logger.log(project)
      if (!project.service) return reject(Boom.notFound(`Could not find service for project: ${bmProject}`))

      resolve({
        bucket: project.service.awsS3Bucket,
        serviceOrigin: project.service.origin
      })
    })
  })
}

module.exports = serverCLI
