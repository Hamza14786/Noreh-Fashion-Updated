'use strict';

// Passenger supplies the port for this application. Never fall back to a
// development port, since Passenger routes requests to its assigned port.
const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('[Noreh] Startup failed: Passenger must provide a valid PORT.');
  process.exit(1);
}

// This entry point is for the production deployment managed by Passenger.
process.env.NODE_ENV = 'production';

const http = require('node:http');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((request, response) => {
      handle(request, response).catch((error) => {
        console.error('[Noreh] Request handling failed:', error);
        if (!response.headersSent) {
          response.statusCode = 500;
          response.end('Internal Server Error');
        } else {
          response.destroy(error);
        }
      });
    });

    server.on('error', (error) => {
      console.error('[Noreh] HTTP server failed to start:', error);
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(`[Noreh] Next.js production server is listening on Passenger PORT ${port}.`);
    });
  })
  .catch((error) => {
    console.error('[Noreh] Next.js production startup failed:', error);
    process.exit(1);
  });
