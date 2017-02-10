/* @flow */
'use strict'

/* ::
import type {BmRequest} from '../../types.js'
*/

// Use dotenv to store secrets
const dotenv = require('dotenv')

// Configure dotenv to get secrets and set as environment variables
dotenv.config()

const authenticate = require('../../lib/authenticate.js')
const settings = require('../../lib/settings.js')

module.exports.get = function get (
  request /* : BmRequest */
) /* : Promise<any> */ {
  return authenticate(request.headers.authorization || '')
    .then((data) => settings(console, request.url.query))
}
