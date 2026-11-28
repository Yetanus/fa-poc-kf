import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';
import { config } from './config.js';
import { ForbiddenError, InvalidTokenError, UnauthenticatedError } from './errors.js';
import { logger } from './logger.js';

export type Role = 'reader' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  roles: Role[];
}

const jwks = createRemoteJWKSet(new URL(`${config.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`));

const claimsSchema = z.object({
  sub: z.string(),
  azp: z.string(),
  preferred_username: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
  realm_access: z.object({ roles: z.array(z.string()) }).optional(),
});

function isRole(value: string): value is Role {
  return value === 'reader' || value === 'admin';
}

async function verifyToken(token: string): Promise<AuthUser> {
  const { payload } = await jwtVerify(token, jwks, {
    issuer: config.KEYCLOAK_ISSUER,
    algorithms: ['RS256'],
  });
  const claims = claimsSchema.parse(payload);

  // keycloak puts "account" in aud for this public client, so check who the token was issued to
  if (claims.azp !== config.KEYCLOAK_CLIENT_ID) {
    throw new Error(`Unexpected azp: ${claims.azp}`);
  }

  return {
    id: claims.sub,
    username: claims.preferred_username,
    name: claims.name ?? null,
    email: claims.email ?? null,
    roles: (claims.realm_access?.roles ?? []).filter(isRole),
  };
}

// no Authorization header = anonymous user, a header with a bad token = 401
export async function authenticate(request: Request): Promise<AuthUser | null> {
  const header = request.headers.get('authorization');
  if (!header) {
    return null;
  }

  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  try {
    return await verifyToken(token);
  } catch (err) {
    logger.warn(
      { reason: err instanceof Error ? err.message : String(err) },
      'Rejected access token',
    );
    throw new InvalidTokenError();
  }
}

export function requireUser(context: { user: AuthUser | null }): AuthUser {
  if (!context.user) {
    throw new UnauthenticatedError();
  }
  return context.user;
}

export function requireRole(context: { user: AuthUser | null }, role: Role): AuthUser {
  const user = requireUser(context);
  if (!user.roles.includes(role)) {
    throw new ForbiddenError(role);
  }
  return user;
}
