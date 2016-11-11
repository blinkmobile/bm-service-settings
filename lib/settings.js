/* @flow */
'use strict'

/* ::
import type {ServerCLISettings} from '../types.js'
*/

// Use boom for error handling
const Boom = require('boom')

const ensureEnvVariable = require('./ensure-env-var.js')

const serverCLI = () /* : ServerCLISettings */ => ({
  bucket: ensureEnvVariable('SERVER_CLI_BUCKET'),
  deploymentUrl: ensureEnvVariable('SERVER_CLI_DEPLOYMENT_URL'),
  region: ensureEnvVariable('SERVER_CLI_REGION')
})

function settings (
  bmService /* : string */
) /* : Promise<any> */ {
  return Promise.resolve()
    .then(() => {
      switch (bmService) {
        case '@blinkmobile/server-cli': return serverCLI()
        default: return Promise.reject(Boom.badRequest('Invalid \'bmService\' parameter on query string'))
      }
    })
}

module.exports = settings
