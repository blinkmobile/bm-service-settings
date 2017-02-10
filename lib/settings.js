/* @flow */
'use strict'

/* ::
import type {SettingsQuery} from '../types.js'
*/

// Use boom for error handling
const Boom = require('boom')

const serverCLI = require('./server-cli.js')

function settings (
  query /* : SettingsQuery */
) /* : Promise<any> */ {
  return Promise.resolve()
    .then(() => {
      switch (query.bmService) {
        case '@blinkmobile/server-cli': return serverCLI(query.bmProject)
        default: return Promise.reject(Boom.badRequest('Invalid \'bmService\' parameter on query string'))
      }
    })
    .then(settings => {
      console.log(`Found project settings for ${query.bmService} project: ${query.bmProject}`, settings)
      return settings
    })
}

module.exports = settings
