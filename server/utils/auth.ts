import { H3Event, getCookie, createError } from "h3";
import { getServerSession } from "./sessions";

export const requireAuth = async (event: H3Event) => {
  const authToken = getCookie(event, "auth_token");

  if (!authToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: No token provided",
    });
  }

  const session = await getServerSession(authToken);
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }
};
