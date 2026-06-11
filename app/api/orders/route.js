import { getDb, saveDb } from '@/lib/db';
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
    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM orders ORDER BY sizeValue ASC, id ASC');
    const orders = [];
    while (stmt.step()) {
      orders.push(stmt.getAsObject());
    }
    stmt.free();

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

    const db = await getDb();
    const createdAt = new Date().toISOString();

    db.run(
      'INSERT INTO orders (companyName, quantity, sizeValue, sizeLabel, canName, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [companyName, parseInt(quantity), parseFloat(sizeValue), sizeLabel, canName, status, createdAt]
    );

    saveDb();

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

    const db = await getDb();
    db.run(
      'UPDATE orders SET companyName = ?, quantity = ?, sizeValue = ?, sizeLabel = ?, canName = ?, status = ? WHERE id = ?',
      [companyName, parseInt(quantity), parseFloat(sizeValue), sizeLabel, canName, status, id]
    );

    saveDb();

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

    const db = await getDb();
    db.run('DELETE FROM orders WHERE id = ?', [parseInt(id)]);
    saveDb();

    return Response.json({ success: true, message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
