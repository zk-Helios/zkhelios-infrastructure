import jwt from "jsonwebtoken";

export interface JwtPayload {
  /** session DB id */
  jti: string;
  /** user pubkey */
  sub: string;
}

export function signSession(payload: JwtPayload, secret: string, ttlDays: number): string {
  return jwt.sign({ sub: payload.sub }, secret, {
    jwtid: payload.jti,
    expiresIn: `${ttlDays}d`,
  });
}

export function verifySession(token: string, secret: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    if (!decoded.jti || !decoded.sub) return null;
    return { jti: decoded.jti, sub: decoded.sub };
  } catch {
    return null;
  }
}
