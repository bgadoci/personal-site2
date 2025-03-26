import { NextRequest, NextResponse } from 'next/server';

// This is a simplified approach for demo purposes
// In a real app, this would set cookies or session data
export async function GET(request: NextRequest) {
  try {
    // Check if admin mode is enabled via environment variable
    const adminMode = process.env.ADMIN_MODE === 'true';
    
    return NextResponse.json({ 
      adminMode,
      message: adminMode ? 'Admin mode is enabled' : 'Admin mode is disabled'
    });
  } catch (error) {
    console.error('Error checking admin mode:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check admin mode' 
    }, { status: 500 });
  }
}
