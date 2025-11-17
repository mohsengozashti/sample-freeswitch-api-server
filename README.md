# sample-freeswitch-api-server

This repository provides a minimal Express server that can be used by FreeSWITCH's [`mod_xml_curl`](https://freeswitch.org/confluence/display/FREESWITCH/mod_xml_curl) module to retrieve directory and dialplan data over HTTP.

## Features

- Basic authentication on all FreeSWITCH endpoints.
- `/freeswitch/directory` returns a directory document containing the requested user with a static `1234` password.
- `/freeswitch/dialplan` returns a simple dialplan that matches the requested destination number.
- JSON and URL-encoded payloads are supported, matching the default payload `mod_xml_curl` sends.

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure credentials in a `.env` file or environment variables:

   ```bash
   API_USERNAME=admin
   API_PASSWORD=secret
   PORT=3000
   ```

3. Start the server

   ```bash
   npm start
   ```

## Endpoint usage

### Directory lookup

Send a POST request to `/freeswitch/directory` containing the user information FreeSWITCH provides. Example using `curl` with basic auth:

```bash
curl -u admin:secret \
  -X POST http://localhost:3000/freeswitch/directory \
  -d "user=1000&domain=example.com"
```

The response contains the user passed in the request with password `1234`.

### Dialplan lookup

POST to `/freeswitch/dialplan` with a `destination_number` and optional `context`:

```bash
curl -u admin:secret \
  -X POST http://localhost:3000/freeswitch/dialplan \
  -d "destination_number=1000&context=default"
```

The response is a basic dialplan XML document with a single extension that answers, pauses briefly, plays hold music, and hangs up.

## Notes

- By default the API credentials are `admin` / `secret`. Update these via environment variables for production.
- The directory response always uses `1234` as the password for the requested user to satisfy the sample requirement.
- The server currently returns static dialplan actions meant for demonstration; adjust the generated XML in `src/lib/xmlResponses.js` to fit your needs.
