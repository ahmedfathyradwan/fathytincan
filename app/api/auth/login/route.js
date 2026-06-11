import { cookies } from 'next/headers';

const AUTH_COOKIE = 'auth_session';
const VALID_USER = 'fathy';
const VALID_PASS = '6666';
// Simple token for session
const SESSION_TOKEN = 'fathy_session_valid_2024';

export async function POST(request) {
  const body = await request.json();
  const { username, password } = body;

  if (username === VALID_USER && password === VALID_PASS) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, SESSION_TOKEN, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return Response.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
  }

  return Response.json(
    { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
    { status: 401 }
  );
}
