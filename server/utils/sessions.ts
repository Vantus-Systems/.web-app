import crypto from 'crypto';
import { readJson, writeJson } from './storage';

export interface Session {
  token: string;
  userId: string;
  expires: number; // timestamp
}

const SESSIONS_FILENAME = 'sessions.json';
// 24 hours in milliseconds
const SESSION_DURATION = 24 * 60 * 60 * 1000;

async function getSessions(): Promise<Session[]> {
  return readJson<Session[]>(SESSIONS_FILENAME, []);
}

async function saveSessions(sessions: Session[]) {
  await writeJson(SESSIONS_FILENAME, sessions);
}

export const createSession = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  const sessions = await getSessions();

  // Clean up expired sessions
  const now = Date.now();
  const validSessions = sessions.filter(s => s.expires > now);

  validSessions.push({
    token,
    userId,
    expires: now + SESSION_DURATION
  });

  await saveSessions(validSessions);
  return token;
};

export const getSession = async (token: string): Promise<Session | undefined> => {
  const sessions = await getSessions();
  const tokenBuffer = Buffer.from(token, 'utf-8');

  const session = sessions.find(s => {
    const sessionTokenBuffer = Buffer.from(s.token, 'utf-8');
    if (sessionTokenBuffer.length !== tokenBuffer.length) return false;
    return crypto.timingSafeEqual(sessionTokenBuffer, tokenBuffer);
  });

  if (session && session.expires > Date.now()) {
    return session;
  }

  return undefined;
};

export const deleteSession = async (token: string) => {
  let sessions = await getSessions();
  const tokenBuffer = Buffer.from(token, 'utf-8');

  sessions = sessions.filter(s => {
    const sessionTokenBuffer = Buffer.from(s.token, 'utf-8');
    if (sessionTokenBuffer.length !== tokenBuffer.length) return true; // keep mismatching tokens
    return !crypto.timingSafeEqual(sessionTokenBuffer, tokenBuffer); // remove matching token
  });

  await saveSessions(sessions);
};
