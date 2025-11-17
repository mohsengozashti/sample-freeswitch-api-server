function decodeCredentials(headerValue) {
  const token = headerValue.split(' ')[1];
  if (!token) return null;

  const decoded = Buffer.from(token, 'base64').toString();
  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) return null;

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);
  return { username, password };
}

function auth(expectedUsername, expectedPassword) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.toLowerCase().startsWith('basic ')) {
      res.set('WWW-Authenticate', 'Basic realm="FreeSWITCH API"');
      return res.status(401).send('Authentication required');
    }

    const credentials = decodeCredentials(authHeader);
    if (!credentials) {
      res.set('WWW-Authenticate', 'Basic realm="FreeSWITCH API"');
      return res.status(401).send('Invalid authentication header');
    }

    const { username, password } = credentials;
    if (username === expectedUsername && password === expectedPassword) {
      return next();
    }

    res.set('WWW-Authenticate', 'Basic realm="FreeSWITCH API"');
    return res.status(401).send('Unauthorized');
  };
}

module.exports = auth;
