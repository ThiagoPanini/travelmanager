export function hasApiAccessToken(session: unknown): session is { apiAccessToken: string } {
  if (!session || typeof session !== "object") return false;

  const { apiAccessToken } = session as { apiAccessToken?: unknown };
  return typeof apiAccessToken === "string" && apiAccessToken.length > 0;
}
