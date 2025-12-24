import crypto from "crypto";
import { requireAuth } from "../../utils/auth";
import {
  getUsers,
  saveUsers,
  hashPassword,
  type User,
  getUserByUsername,
} from "../../utils/users";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  // Only admins can manage users
  const currentUser = event.context.user;
  if (currentUser.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Only admins can manage users",
    });
  }

  const body = await readBody(event);
  const { id, username, password, name, role } = body;

  if (!username || !name || !role) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields (username, name, role)",
    });
  }

  const users = getUsers();

  if (id) {
    // Update existing user
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Check if username is taken by another user
    const existingUser = users.find(
      (u) => u.username === username && u.id !== id,
    );
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: "Username already exists",
      });
    }

    const user = users[userIndex];
    if (!user)
      throw createError({ statusCode: 500, statusMessage: "Internal Error" });
    user.username = username;
    user.name = name;
    user.role = role;

    if (password && password.trim() !== "") {
      const { hash, salt } = hashPassword(password);
      user.passwordHash = hash;
      user.salt = salt;
    }

    users[userIndex] = user;
    saveUsers(users);
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  } else {
    // Create new user
    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Password is required for new users",
      });
    }

    if (getUserByUsername(username)) {
      throw createError({
        statusCode: 409,
        statusMessage: "Username already exists",
      });
    }

    const { hash, salt } = hashPassword(password);
    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      passwordHash: hash,
      salt,
      name,
      role,
    };

    users.push(newUser);
    saveUsers(users);
    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
      },
    };
  }
});
