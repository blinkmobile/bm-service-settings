/* @flow */
'use strict'

/* ::
import type {SettingsQuery} from '../types.js'
*/

// Use boom for error handling
const Boom = require('boom')

const serverCLI = require('./server-cli.js')

function settings (
  logger /* : typeof console */,
  query /* : SettingsQuery */
) /* : Promise<any> */ {
  const bmService = query.bmService || ''
  const bmProject = query.bmProject || ''
  return Promise.resolve()
    .then(() => {
      switch (bmService) {
        case '@blinkmobile/server-cli': return serverCLI(logger, bmProject)
        default: return Promise.reject(Boom.badRequest('Invalid \'bmService\' parameter on query string'))
      }
    })
    .then(settings => {
      logger.log(`Found project settings for ${bmService} project: ${bmProject}`, settings)
      return settings
    })
}

module.exports = settings
