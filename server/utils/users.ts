import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const USERS_FILE = path.resolve(process.cwd(), 'server/data/users.json');

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: 'admin' | 'mic';
}

export type UserWithoutPassword = Omit<User, 'passwordHash' | 'salt'>;

const DEFAULT_ADMIN_PASS = 'admin123';

function ensureUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(DEFAULT_ADMIN_PASS, salt, 1000, 64, 'sha512').toString('hex');
    const defaultUser: User = {
      id: '1',
      username: 'admin',
      passwordHash: hash,
      salt: salt,
      name: 'Administrator',
      role: 'admin'
    };
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify([defaultUser], null, 2));
    } catch (e) {
        // Directory might not exist if data dir was deleted, though unlikely given existing files.
        console.error("Failed to write users file", e);
    }
  }
}

export const getUsers = (): User[] => {
  ensureUsersFile();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

export const getUserByUsername = (username: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.username === username);
};

export const saveUsers = (users: User[]) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
};

export const verifyPassword = (password: string, hash: string, salt: string) => {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  // timingSafeEqual expects buffers of equal length
  const b1 = Buffer.from(verifyHash, 'utf-8');
  const b2 = Buffer.from(hash, 'utf-8');
  if (b1.length !== b2.length) return false;
  return crypto.timingSafeEqual(b1, b2);
};
