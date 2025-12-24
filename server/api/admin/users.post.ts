import { requireAuth } from '../../utils/auth';
import { getUsers, saveUsers, hashPassword, type User, getUserByUsername } from '../../utils/users';
import crypto from 'crypto';
import { z } from 'zod';

const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1),
  password: z.string().optional(),
  name: z.string().min(1),
  role: z.enum(['admin', 'mic']),
});

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  // Only admins can manage users
  const currentUser = event.context.user;
  if (!currentUser || currentUser.role !== 'admin') {
    throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Only admins can manage users",
    });
  }

  const body = await readBody(event);

  const result = userSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid input",
      data: result.error.errors,
    });
  }

  const { id, username, password, name, role } = result.data;

  const users = await getUsers();

  if (id) {
    // Update existing user
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Check if username is taken by another user
    const existingUser = users.find(u => u.username === username && u.id !== id);
    if (existingUser) {
        throw createError({ statusCode: 409, statusMessage: "Username already exists" });
    }

    const user = users[userIndex];
    if (!user) throw createError({statusCode: 500, statusMessage: 'Internal Error'});

    user.username = username;
    user.name = name;
    user.role = role;

    if (password && password.trim() !== "") {
      const { hash, salt } = hashPassword(password);
      user.passwordHash = hash;
      user.salt = salt;
    }

    users[userIndex] = user;
    await saveUsers(users);
    return { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } };

  } else {
    // Create new user
    if (!password) {
        throw createError({ statusCode: 400, statusMessage: "Password is required for new users" });
    }

    // Check if username exists (using the helper is async)
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
        throw createError({ statusCode: 409, statusMessage: "Username already exists" });
    }

    const { hash, salt } = hashPassword(password);
    const newUser: User = {
        id: crypto.randomUUID(),
        username,
        passwordHash: hash,
        salt,
        name,
        role
    };

    users.push(newUser);
    await saveUsers(users);
    return { success: true, user: { id: newUser.id, username: newUser.username, name: newUser.name, role: newUser.role } };
  }
});
