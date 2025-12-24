import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SESSIONS_FILE = path.resolve(process.cwd(), 'server/data/sessions.json');

export interface Session {
  token: string;
  userId: string;
  expires: number; // timestamp
}

// 24 hours in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000;

function ensureSessionsFile() {
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2));
  }
}

function getSessions(): Session[] {
  ensureSessionsFile();
  try {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export const createSession = (userId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  const sessions = getSessions();

  // Clean up expired sessions while we're at it
  const now = Date.now();
  const validSessions = sessions.filter(s => s.expires > now);

  validSessions.push({
    token,
    userId,
    expires: now + SESSION_DURATION
  });

  saveSessions(validSessions);
  return token;
};

export const getSession = (token: string): Session | undefined => {
  const sessions = getSessions();
import crypto from 'crypto'; // Ensure crypto is imported at the top of your file

export const getSession = (token: string): Session | undefined => {
  const sessions = getSessions();
  const tokenBuffer = Buffer.from(token, 'utf-8');
  const session = sessions.find(s => {
    const sessionTokenBuffer = Buffer.from(s.token, 'utf-8');
    // crypto.timingSafeEqual throws if lengths differ, so check length first
    return sessionTokenBuffer.length === tokenBuffer.length &&
      crypto.timingSafeEqual(sessionTokenBuffer, tokenBuffer);
  });

  if (session && session.expires > Date.now()) {
    return session;
  }
  return undefined;
};

  if (session && session.expires > Date.now()) {
    return session;
  }
  return undefined;
};

export const deleteSession = (token: string) => {
  let sessions = getSessions();
import crypto from 'crypto'; // Ensure crypto is imported at the top

sessions = sessions.filter(s =>
  typeof s.token === 'string' &&
  s.token.length === token.length &&
  !crypto.timingSafeEqual(Buffer.from(s.token, 'utf-8'), Buffer.from(token, 'utf-8'))
);
  saveSessions(sessions);
};
