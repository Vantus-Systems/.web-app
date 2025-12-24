import { H3Event, getCookie, createError } from "h3";
import { getServerSession } from "./sessions";
import { getUserById } from "./users";

export const requireAuth = (event: H3Event) => {
  const authToken = getCookie(event, "auth_token");

  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: No token provided",
    });
  }

  const session = getServerSession(authToken);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: Invalid or expired token",
    });
  }

  const user = getUserById(session.userId);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: User not found",
    });
  }

  // Attach user to context for downstream use
  (event as any).context.user = user;
};
