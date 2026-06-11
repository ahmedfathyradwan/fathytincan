import { getSupabase } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

const SESSION_TOKEN = 'fathy_session_valid_2024';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  return session && session.value === SESSION_TOKEN;
}

// GET all orders sorted by sizeValue
export async function GET() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('sizeValue', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      throw error;
    }

    // Assign sequential order numbers
    const ordersWithNumbers = orders.map((order, index) => ({
      ...order,
      orderNumber: index + 1,
    }));

    return Response.json({ orders: ordersWithNumbers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST create new order
export async function POST(request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { companyName, quantity, sizeValue, sizeLabel, canName, status } = body;

    // Validate
    if (!companyName || !quantity || !sizeValue || !sizeLabel || !canName || !status) {
      return Response.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return Response.json({ error: 'الكمية يجب أن تكون رقم صحيح أكبر من صفر' }, { status: 400 });
    }

    const createdAt = new Date().toISOString();
    const supabase = getSupabase();
    const { error } = await supabase.from('orders').insert([
      {
        companyName,
        quantity: parseInt(quantity, 10),
        sizeValue: parseFloat(sizeValue),
        sizeLabel,
        canName,
        status,
        createdAt,
      },
    ]);

    if (error) {
      throw error;
    }

    return Response.json({ success: true, message: 'تم إضافة الطلب بنجاح' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT update order
export async function PUT(request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, companyName, quantity, sizeValue, sizeLabel, canName, status } = body;

    if (!id) {
      return Response.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    if (!companyName || !quantity || !sizeValue || !sizeLabel || !canName || !status) {
      return Response.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return Response.json({ error: 'الكمية يجب أن تكون رقم صحيح أكبر من صفر' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('orders')
      .update({
        companyName,
        quantity: parseInt(quantity, 10),
        sizeValue: parseFloat(sizeValue),
        sizeLabel,
        canName,
        status,
      })
      .eq('id', parseInt(id, 10));

    if (error) {
      throw error;
    }

    return Response.json({ success: true, message: 'تم تحديث الطلب بنجاح' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE order
export async function DELETE(request) {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('orders').delete().eq('id', parseInt(id, 10));

    if (error) {
      throw error;
    }

    return Response.json({ success: true, message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
