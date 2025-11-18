# sample-freeswitch-api-server

This repository provides a minimal Express server that can be used by FreeSWITCH's [`mod_xml_curl`](https://freeswitch.org/confluence/display/FREESWITCH/mod_xml_curl) module to retrieve directory and dialplan data over HTTP.

## Features

- Basic authentication on all FreeSWITCH endpoints.
- `/freeswitch/directory` returns a directory document for users that exist in `config/users.json`, enforcing their stored password.
- `/freeswitch/dialplan` returns a simple dialplan that bridges the requested destination number to a registered user.
- JSON and URL-encoded payloads are supported, matching the default payload `mod_xml_curl` sends.
- Requests for unknown users return HTTP 404, and password mismatches return HTTP 403, signaling FreeSWITCH to reject the registration.

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure API credentials in a `.env` file or environment variables:

   ```bash
   API_USERNAME=admin
   API_PASSWORD=secret
   HOST=0.0.0.0
   PORT=3000
   ```

3. Define the SIP users that FreeSWITCH is allowed to register by editing `config/users.json`. The default file ships with two sample users (`1000`/`1001`, both with password `1234`). Each entry must contain a `username` and `password`:

   ```json
   {
     "users": [
       { "username": "1000", "password": "hunter2" },
       { "username": "1001", "password": "correcthorsebattery" }
     ]
   }
   ```

4. Start the server

   ```bash
   npm start
   ```

   By default the server binds to `0.0.0.0`, which makes it reachable from other devices on your local network. To bind to a specific
   network interface (for example your local ip address on network), set `HOST` in your `.env` file:

   ```bash
   HOST=192.168.7.7
   ```

## Endpoint usage

### Directory lookup

Send a POST request to `/freeswitch/directory` containing the user information FreeSWITCH provides. Example using `curl` with basic auth:

```bash
curl -u admin:secret \
  -X POST http://localhost:3000/freeswitch/directory \
  -d "user=1000&domain=example.com"
```

The response contains the user passed in the request as long as it exists in `config/users.json`. If the user is missing you will receive HTTP 404, and if `sip_auth_password` is supplied but does not match the stored password the server replies with HTTP 403.

### Dialplan lookup

POST to `/freeswitch/dialplan` with a `destination_number` and optional `context`/`domain`:

```bash
curl -u admin:secret \
  -X POST http://localhost:3000/freeswitch/dialplan \
  -d "destination_number=1000&context=default&domain=example.com"
```

The response is a basic dialplan XML document with a single extension that bridges to `user/DESTINATION@DOMAIN`, enabling users registered to the same domain to call each other. If the requested destination does not exist in `config/users.json`, the API returns HTTP 404 so FreeSWITCH can fail the call immediately. If the bridge fails, the call is hung up with `NO_ROUTE_DESTINATION`.

## Notes

- By default the API credentials are `admin` / `secret`. Update these via environment variables for production.
- Directory and dialplan data is dynamically driven by the entries defined in `config/users.json`.
- The server currently returns static dialplan actions meant for demonstration; adjust the generated XML in `src/lib/xmlResponses.js` to fit your needs.

## Configuring FreeSWITCH `mod_xml_curl`

Point your FreeSWITCH instance at the API endpoints and supply the same basic-auth credentials you configured in the `.env` file (`API_USERNAME` / `API_PASSWORD`). Below is a minimal `xml_curl.conf.xml` snippet that assumes the server runs at `http://192.168.7.85:3000` with the default credentials (`admin` / `secret`):

```xml
<configuration name="xml_curl.conf" description="cURL XML Gateway">
        <bindings>
                    <!-- Directory lookup -->
    <binding name="directory">
      <param name="gateway-url" value="http://yourserverdomain:port/freeswitch/directory" method="POST" />
            <!-- BASIC AUTH USERNAME -->
      <param name="gateway-credentials" value="admin:secret"/>
      <param name="auth-scheme" value="basic"/>
    </binding>
        <binding name="dialplan">
      <param name="gateway-url" value="http://yourserverdomain:port/freeswitch/dialplan" method="POST" />
            <!-- BASIC AUTH USERNAME -->
      <param name="gateway-credentials" value="admin:secret"/>
      <param name="auth-scheme" value="basic"/>
    </binding>
  </bindings>
</configuration>
```

After updating the configuration:

1. Restart or reload FreeSWITCH (e.g., `fs_cli -x reloadxml`).
2. Confirm the API responds with the same credentials using `curl`:

   ```bash
   curl -u admin:secret \
     -X POST http://yourserverdomain:port/freeswitch/directory \
     -d "user=1011&domain=yourserverdomain"
   ```

If FreeSWITCH logs an HTTP 401, double-check that `API_USERNAME` and `API_PASSWORD` in the API server match the `auth-username` and `auth-password` values in `xml_curl.conf.xml`, and that the server host/port are reachable from FreeSWITCH.
