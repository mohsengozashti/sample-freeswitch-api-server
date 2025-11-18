const express = require('express')
const auth = require('./middleware/basicAuth')
const { buildDirectoryXml, buildDialplanXml, emptyFSResponse } = require('./lib/xmlResponses')
const { findUser } = require('./lib/userStore')

function createApp(config = {}) {
  const app = express()
  const username = config.username || process.env.API_USERNAME || 'admin'
  const password = config.password || process.env.API_PASSWORD || 'secret'

  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  app.use('/freeswitch', auth(username, password))

  app.post('/freeswitch/directory', (req, res) => {
    const user = req.body.user || req.query.user || '1000'
    const domain = req.body.domain || req.query.domain || req.body.domain_name || 'default'
    const providedPassword = req.body.sip_auth_password || req.query.sip_auth_password
    
    const directoryUser = findUser(user)

    if (directoryUser === undefined) {
      return res.type('application/xml').send(emptyFSResponse())
    }

    if (providedPassword && directoryUser.password !== providedPassword) {
      return res.type('application/xml').send(emptyFSResponse())
    }

    const xml = buildDirectoryXml({ user, domain, password: directoryUser.password })
    return res.type('application/xml').send(xml)
  })

  app.post('/freeswitch/dialplan', (req, res) => {
    const destination = req.body.destination_number || req.query.destination_number || '1000'
    const context = req.body.context || req.query.context || 'default'
    const domain = req.body.domain || req.query.domain || req.body.domain_name || 'default'

    if (!findUser(destination)) {
      return res.type('application/xml').send(emptyFSResponse())
    }

    const xml = buildDialplanXml({ destination, context, domain })
    return res.type('application/xml').send(xml)
  })

  app.use((req, res) => {
    return res.type('application/xml').send(emptyFSResponse())
  })

  return app
}

module.exports = createApp
