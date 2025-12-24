import { getCookie, createError } from "h3";
import { getServerSession } from "../../utils/sessions";
import { getUserById } from "../../utils/users";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");
  if (!token)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const session = await getServerSession(token);
  if (!session)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const user = getUserById(session.userId);
  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  // Return a safe user object (omit password/salt)
  return {
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  };
});
