const express = require('express');
const auth = require('./middleware/basicAuth');
const { buildDirectoryXml, buildDialplanXml } = require('./lib/xmlResponses');

function createApp(config = {}) {
  const app = express();
  const username = config.username || process.env.API_USERNAME || 'admin';
  const password = config.password || process.env.API_PASSWORD || 'secret';

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/freeswitch', auth(username, password));

  app.post('/freeswitch/directory', (req, res) => {
    console.log(req.body);
    const user = req.body.user || req.query.user || '1000';
    const domain = req.body.domain || req.query.domain || req.body.domain_name || 'default';

    const xml = buildDirectoryXml({ user, domain, password: '1234' });
    res.type('application/xml').send(xml);
  });

  app.post('/freeswitch/dialplan', (req, res) => {
    const destination = req.body.destination_number || req.query.destination_number || '1000';
    const context = req.body.context || req.query.context || 'default';
    const domain = req.body.domain || req.query.domain || req.body.domain_name || 'default';

    const xml = buildDialplanXml({ destination, context, domain });
    res.type('application/xml').send(xml);
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}

module.exports = createApp;
