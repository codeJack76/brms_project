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

// GET /api/financial - Fetch financial transactions filtered by user's barangay
export async function GET(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData } = userResult;

    let query = supabaseAdmin
      .from('financial_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    // Superadmin can see all transactions, others only see their barangay's transactions
    if (userData.role !== 'superadmin' && userData.barangay_id) {
      query = query.eq('barangay_id', userData.barangay_id);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform snake_case to camelCase for frontend
    const transformedTransactions = transactions?.map((txn: any) => ({
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
    })) || [];

    return NextResponse.json({ transactions: transformedTransactions });
  } catch (error: any) {
    console.error('Error fetching financial transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial transactions', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/financial - Create a new financial transaction
export async function POST(request: NextRequest) {
  try {
    const userResult = await getUserBarangay(request);
    
    if ('error' in userResult) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }

    const { userData, userEmail } = userResult;
    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.category || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: type, category, and amount are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['income', 'expense'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "income" or "expense"' },
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(parseFloat(body.amount)) || parseFloat(body.amount) < 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number' },
        { status: 400 }
      );
    }

    // Use user's barangay_id (required for data isolation)
    if (!userData.barangay_id) {
      return NextResponse.json(
        { error: 'User is not assigned to a barangay' },
        { status: 400 }
      );
    }

    // Generate transaction number unique per barangay
    const year = new Date().getFullYear();
    const prefix = body.type === 'income' ? 'INC' : 'EXP';
    const { count } = await supabaseAdmin
      .from('financial_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('barangay_id', userData.barangay_id)
      .eq('type', body.type);
    
    const transactionNumber = `${prefix}-${year}-${String((count || 0) + 1).padStart(4, '0')}`;

    const transactionData = {
      barangay_id: userData.barangay_id,
      transaction_number: transactionNumber,
      type: body.type,
      category: body.category,
      amount: parseFloat(body.amount),
      description: body.description || null,
      transaction_date: body.transaction_date || new Date().toISOString().split('T')[0],
      paid_by: body.paid_by || null,
      received_by: body.received_by || userEmail,
      reference_number: body.reference_number || null,
      status: body.status || 'completed',
      notes: body.notes || null,
    };

    const { data: transaction, error } = await supabaseAdmin
      .from('financial_transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform response
    const transformedTransaction = {
      id: transaction.id,
      barangayId: transaction.barangay_id,
      transactionNumber: transaction.transaction_number,
      type: transaction.type,
      category: transaction.category,
      amount: parseFloat(transaction.amount),
      description: transaction.description,
      transactionDate: transaction.transaction_date,
      paidBy: transaction.paid_by,
      receivedBy: transaction.received_by,
      referenceNumber: transaction.reference_number,
      status: transaction.status,
      notes: transaction.notes,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
    };

    return NextResponse.json({ transaction: transformedTransaction }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating financial transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create financial transaction', details: error.message },
      { status: 500 }
    );
  }
}
