import { connectToDatabase } from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import { cookies } from 'next/headers';

const SESSION_TOKEN = 'fathy_session_valid_2024';

async function checkAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  return session && session.value === SESSION_TOKEN;
}

// GET all orders sorted by sizeValue then _id
export async function GET() {
  const isAuth = await checkAuth();
  if (!isAuth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const orders = await Order.find()
      .sort({ sizeValue: 1, _id: 1 })
      .lean();

    const ordersWithNumbers = orders.map((order, index) => ({
      ...order,
      id: order._id.toString(),
      orderNumber: index + 1,
    }));

    return Response.json({ orders: ordersWithNumbers });
  } catch (error) {
    console.error('GET /api/orders error:', error);
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

    if (!companyName || !quantity || !sizeValue || !sizeLabel || !canName || !status) {
      return Response.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return Response.json({ error: 'الكمية يجب أن تكون رقم صحيح أكبر من صفر' }, { status: 400 });
    }

    await connectToDatabase();

    const newOrder = new Order({
      companyName,
      quantity: parseInt(quantity, 10),
      sizeValue: parseFloat(sizeValue),
      sizeLabel,
      canName,
      status,
      createdAt: new Date().toISOString(),
    });

    await newOrder.save();

    return Response.json({ success: true, message: 'تم إضافة الطلب بنجاح' });
  } catch (error) {
    console.error('POST /api/orders error:', error);
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

    await connectToDatabase();

    const updated = await Order.findByIdAndUpdate(
      id,
      {
        companyName,
        quantity: parseInt(quantity, 10),
        sizeValue: parseFloat(sizeValue),
        sizeLabel,
        canName,
        status,
      },
      { new: true }
    );

    if (!updated) {
      return Response.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'تم تحديث الطلب بنجاح' });
  } catch (error) {
    console.error('PUT /api/orders error:', error);
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

    await connectToDatabase();

    const deleted = await Order.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    console.error('DELETE /api/orders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
