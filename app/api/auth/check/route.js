import { cookies } from 'next/headers';

const SESSION_TOKEN = 'fathy_session_valid_2024';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');

  if (session && session.value === SESSION_TOKEN) {
    return Response.json({ authenticated: true });
  }

  return Response.json({ authenticated: false }, { status: 401 });
}
