// JWT utilities for Cloudflare Functions
// Using a simple implementation without external dependencies

const JWT_SECRET = 'university-booking-jwt-secret';

interface JWTPayload {
  adminId: string;
  username: string;
  exp: number;
}

// Simple base64url encoding
function base64urlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Simple base64url decoding
function base64urlDecode(str: string): string {
  str += '='.repeat((4 - str.length % 4) % 4);
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

// Simple HMAC-SHA256 signature (for demo purposes)
// In production, use Web Crypto API or a proper JWT library
async function sign(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  
  return base64urlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

export async function signJWT(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, exp: now + 24 * 60 * 60 }; // 24 hours
  
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  
  const signature = await sign(data);
  return `${data}.${signature}`;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }
    
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = await sign(data);
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(base64urlDecode(encodedPayload)) as JWTPayload;
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp < now) {
      return null; // Token expired
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}