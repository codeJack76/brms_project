import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to get user's barangay_id from cookie
async function getUserBarangay(request: NextRequest) {
  const userEmail = request.cookies.get('user_email')?.value;
  
  if (!userEmail) {
    return { error: 'Unauthorized - Please log in', status: 401 };
  }

  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('barangay_id, role')
    .eq('email', userEmail)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
    return { error: 'Failed to fetch user information', status: 500 };
  }

  return { userData, userEmail };
}

// Helper to transform transaction data
function transformTransaction(txn: any) {
  return {
    id: txn.id,
    barangayId: txn.barangay_id,
    transactionNumber: txn.transaction_number,
    type: txn.type,
    category: txn.category,
    amount: parseFloat(txn.amount),
    description: txn.description,
    transactionDate: txn.transaction_date,
    paidBy: txn.paid_by,
    receivedBy: txn.received_by,
    referenceNumber: txn.reference_number,
    status: txn.status,
    notes: txn.notes,
    createdAt: txn.created_at,
    updatedAt: txn.updated_at,
  };
}

// GET /api/financial/[id] - Fetch a single financial transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;
    const { id } = await params;

    let query = supabaseAdmin
      .from('financial_transactions')
      .select('*')
      .eq('id', id);

    // Non-superadmins can only access their barangay's transactions
    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data: transaction, error } = await query.single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ transaction: transformTransaction(transaction) });
  } catch (error: any) {
    console.error('Error fetching financial transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial transaction', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/financial/[id] - Update a financial transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;
    const { id } = await params;
    const body = await request.json();

    // First verify the transaction belongs to user's barangay
    let verifyQuery = supabaseAdmin
      .from('financial_transactions')
      .select('id, barangay_id')
      .eq('id', id);

    if (userData.role !== 'superadmin' && userData.barangay_id) {
      verifyQuery = verifyQuery.eq('barangay_id', userData.barangay_id);
    }

    const { data: existingTransaction, error: verifyError } = await verifyQuery.single();

    if (verifyError || !existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found or access denied' }, { status: 404 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (body.type !== undefined) {
      if (!['income', 'expense'].includes(body.type)) {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
      }
      updateData.type = body.type;
    }
    if (body.category !== undefined) updateData.category = body.category;
    if (body.amount !== undefined) {
      if (isNaN(parseFloat(body.amount)) || parseFloat(body.amount) < 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }
      updateData.amount = parseFloat(body.amount);
    }
    if (body.description !== undefined) updateData.description = body.description;
    if (body.transaction_date !== undefined) updateData.transaction_date = body.transaction_date;
    if (body.paid_by !== undefined) updateData.paid_by = body.paid_by;
    if (body.received_by !== undefined) updateData.received_by = body.received_by;
    if (body.reference_number !== undefined) updateData.reference_number = body.reference_number;
    if (body.status !== undefined) {
      if (!['completed', 'pending', 'cancelled', 'refunded'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = body.status;
    }
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data: transaction, error } = await supabaseAdmin
      .from('financial_transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transaction: transformTransaction(transaction) });
  } catch (error: any) {
    console.error('Error updating financial transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update financial transaction', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/financial/[id] - Delete a financial transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;
    const { id } = await params;

    // First verify the transaction belongs to user's barangay
    let verifyQuery = supabaseAdmin
      .from('financial_transactions')
      .select('id, barangay_id')
      .eq('id', id);

    if (userData.role !== 'superadmin' && userData.barangay_id) {
      verifyQuery = verifyQuery.eq('barangay_id', userData.barangay_id);
    }

    const { data: existingTransaction, error: verifyError } = await verifyQuery.single();

    if (verifyError || !existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found or access denied' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('financial_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting financial transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete financial transaction', details: error.message },
      { status: 500 }
    );
  }
}
