import crypto from 'crypto';
import { readJson, writeJson } from './storage';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: 'admin' | 'mic';
}

export type UserWithoutPassword = Omit<User, 'passwordHash' | 'salt'>;

const USERS_FILENAME = 'users.json';
const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = 'sha512';

// Ensure at least one admin exists
async function ensureAdminUser() {
  const users = await readJson<User[]>(USERS_FILENAME, []);
  if (users.length === 0) {
    // Only create default admin if NO users exist
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('admin123', salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
    const defaultUser: User = {
      id: '1',
      username: 'admin',
      passwordHash: hash,
      salt: salt,
      name: 'Administrator',
      role: 'admin'
    };
    await writeJson(USERS_FILENAME, [defaultUser]);
    console.warn('Created default admin user (admin/admin123). Please change this immediately in production.');
  }
}

export const getUsers = async (): Promise<User[]> => {
  await ensureAdminUser();
  return readJson<User[]>(USERS_FILENAME, []);
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find(u => u.id === id);
};

export const getUserByUsername = async (username: string): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find(u => u.username === username);
};

export const saveUsers = async (users: User[]) => {
  await writeJson(USERS_FILENAME, users);
};

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return { hash, salt };
};

export const verifyPassword = (password: string, hash: string, salt: string) => {
  const verifyHash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  // timingSafeEqual expects buffers of equal length
  const b1 = Buffer.from(verifyHash, 'utf-8');
  const b2 = Buffer.from(hash, 'utf-8');
  if (b1.length !== b2.length) return false;
  return crypto.timingSafeEqual(b1, b2);
};
