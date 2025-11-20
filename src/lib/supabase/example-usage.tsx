// Example: Using Supabase in a React Component
// This demonstrates how to use the Supabase hooks and utilities

'use client';

import { useState } from 'react';
import { useResidents, insertRecord, searchResidents } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Resident = Database['public']['Tables']['residents']['Row'];
type ResidentInsert = Database['public']['Tables']['residents']['Insert'];

export default function ExampleResidentsComponent() {
  // Using the custom hook to fetch all residents
  const { data: residents, loading, error, refetch } = useResidents({
    is_active: true,
    limit: 50,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Resident[]>([]);

  // Example: Search residents
  const handleSearch = async () => {
    try {
      const results = await searchResidents(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Example: Create new resident
  const handleCreateResident = async () => {
    const newResident: ResidentInsert = {
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      date_of_birth: '1990-01-01',
      gender: 'Male',
      civil_status: 'Single',
      barangay: 'Sample Barangay',
      city_municipality: 'Sample City',
      province: 'Sample Province',
      residency_status: 'Permanent',
      // Add other required fields...
    };

    try {
      const created = await insertRecord('residents', newResident);
      console.log('Created resident:', created);
      refetch(); // Refresh the list
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  if (loading) {
    return <div>Loading residents...</div>;
  }

  if (error) {
    return <div>Error loading residents: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Residents Management</h1>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search residents..."
          className="px-4 py-2 border rounded"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </div>

      {/* Create Button */}
      <button
        onClick={handleCreateResident}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Create Test Resident
      </button>

      {/* Residents List */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">All Residents ({residents?.length || 0})</h2>
        {residents?.map((resident) => (
          <div key={resident.id} className="p-4 border rounded">
            <div className="font-medium">
              {resident.first_name} {resident.middle_name} {resident.last_name}
            </div>
            <div className="text-sm text-gray-600">
              {resident.email} | {resident.mobile}
            </div>
            <div className="text-sm text-gray-600">
              {resident.purok}, {resident.barangay}
            </div>
          </div>
        ))}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-xl font-semibold">Search Results ({searchResults.length})</h2>
          {searchResults.map((resident) => (
            <div key={resident.id} className="p-4 border rounded bg-yellow-50">
              <div className="font-medium">
                {resident.first_name} {resident.last_name}
              </div>
              <div className="text-sm text-gray-600">{resident.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===================================
// EXAMPLE: Using in API Route (Server-Side)
// ===================================

/*
// src/app/api/residents/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('residents')
      .select('*')
      .eq('is_active', true)
      .order('last_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ residents: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch residents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('residents')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ resident: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create resident' },
      { status: 500 }
    );
  }
}
*/

// ===================================
// EXAMPLE: Real-time Subscription
// ===================================

/*
import { useSupabaseSubscription } from '@/lib/supabase';

function ResidentsPageWithRealtime() {
  const { data: residents, refetch } = useResidents();

  // Subscribe to changes
  useSupabaseSubscription('residents', (payload) => {
    console.log('Change received:', payload);
    refetch(); // Refresh the list when changes occur
  });

  return <div>...</div>;
}
*/
