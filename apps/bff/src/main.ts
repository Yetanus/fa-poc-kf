import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { config } from './config.js';
import { schema } from './schema.js';

const yoga = createYoga({
  schema,
  cors: {
    origin: config.CORS_ORIGIN,
    credentials: true,
  },
});

const server = createServer((req, res) => {
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  yoga(req, res);
});

server.listen(config.PORT, () => {
  console.log(`BFF running on http://localhost:${config.PORT}/graphql`);
});
