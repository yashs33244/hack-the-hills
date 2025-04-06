import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

// Define a proper interface for JWT payload
export interface JwtPayload {
  userId: string;
  email?: string;
  [key: string]: any; // Allow additional properties
}

export async function signToken(payload: JwtPayload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error('Token signing error:', error);
    return null;
  }
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Middleware to verify auth token
export async function verifyAuth(req: Request): Promise<JwtPayload> {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  console.log(token);
  
  if (!token) {
    throw new Error('Missing token');
  }

  try {
    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Helper to get user ID from token
export async function getUserFromToken(req: Request): Promise<string> {
  try {
    const payload = await verifyAuth(req);
    return payload.userId;
  } catch (error) {
    throw new Error('Unauthorized');
  }
}