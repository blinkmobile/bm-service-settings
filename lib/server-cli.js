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

  console.log(`Making request to ${projectRegistryOrigin} for project settings for server-cli project: ${bmProject}`)
  return new Promise((resolve, reject) => {
    const url = `${projectRegistryOrigin}/v1/projects?filter={"attributes.name":"${bmProject}"}&include=service`
    request.get(url, {
      auth: {
        bearer: projectRegistrySecret
      },
      json: true
    }, function (err, response, body) {
      if (err) {
        console.error('Request to project registry failed.', err)
        return reject(Boom.wrap(err))
      }
      if (response.statusCode !== 200) {
        const error = Boom.create(response.statusCode, body.message)
        console.error('Response from project registry was not 200 - OK', error)
        return reject(error)
      }
      if (!body.data || body.data.length !== 1) return reject(Boom.notFound(`Could not find project: ${bmProject}`))

      const store = new jsonapi.JsonApiDataStore()
      store.sync(body)
      const project = store.find(body.data[0].type, body.data[0].id)

      if (!project.service) return reject(Boom.notFound(`Could not find service for project: ${bmProject}`))

      resolve({
        bucket: project.service.awsS3Bucket,
        serviceOrigin: project.service.origin
      })
    })
  })
}

module.exports = serverCLI
