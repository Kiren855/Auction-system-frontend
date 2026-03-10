export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Parse token error:', error);
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem('access_token');
}

export function getCurrentUserIdFromToken() {
  const token = getAccessToken();
  if (!token) return null;

  const payload = parseJwt(token);
  return payload?.sub || null;
}
