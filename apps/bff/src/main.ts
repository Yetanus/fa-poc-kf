import { createHash } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { GraphQLError } from 'graphql';
import { createYoga, maskError } from 'graphql-yoga';
import { config } from './config.js';
import { schema } from './schema.js';
import { createContext } from './context.js';
import { useUpstreamErrors } from './upstream-errors.plugin.js';
import { AppError, UpstreamError } from './errors.js';
import { checkSources } from './health.js';
import { logger } from './logger.js';

const isDev = config.NODE_ENV === 'development';

const yoga = createYoga({
  schema,
  context: createContext,
  logging: logger,
  plugins: [useUpstreamErrors()],
  cors: {
    origin: config.CORS_ORIGIN,
    credentials: true,
  },
  maskedErrors: {
    isDev,
    maskError(error, message, dev, context) {
      const original = error instanceof GraphQLError ? error.originalError : error;
      if (original instanceof AppError && error instanceof GraphQLError) {
        const publicMessage =
          original instanceof UpstreamError ? original.publicMessage : original.message;
        return new GraphQLError(publicMessage, {
          nodes: error.nodes,
          path: error.path,
          extensions: original.extensions,
        });
      }
      return maskError(error, message, dev, context);
    },
  },
});

async function handleHealth(req: IncomingMessage, res: ServerResponse) {
  const sources = await checkSources(logger);
  const healthyCount = sources.filter((s) => s.healthy).length;
  const status = healthyCount === sources.length ? 'ok' : healthyCount === 0 ? 'down' : 'degraded';

  const body = JSON.stringify({ status, sources });
  const etag = `"${createHash('sha1').update(body).digest('base64url')}"`;
  const headers = { 'Cache-Control': 'no-cache', ETag: etag };

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, headers);
    res.end();
    return;
  }
  res.writeHead(status === 'down' ? 503 : 200, {
    ...headers,
    'Content-Type': 'application/json',
  });
  res.end(body);
}

const server = createServer((req, res) => {
  if (req.url === '/api/health') {
    handleHealth(req, res).catch((err: unknown) => {
      logger.error({ err }, 'Health check failed');
      res.writeHead(500).end();
    });
    return;
  }
  yoga(req, res);
});

server.listen(config.PORT, () => {
  logger.info(`BFF running on http://localhost:${config.PORT}/graphql`);
});
