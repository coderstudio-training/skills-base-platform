import { NextRequest, NextResponse } from 'next/server';

// Types
interface Employee {
  firstName: string;
  lastName: string;
  department: string;
  employmentStatus: string;
  grade: string;
}

// Mock data - In a real application, this would come from a database
const mockEmployees: Employee[] = [
  {
    firstName: 'John',
    lastName: 'Doe',
    department: 'Engineering',
    employmentStatus: 'Active',
    grade: 'Senior Engineer',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    department: 'Product',
    employmentStatus: 'Active',
    grade: 'Product Manager',
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    department: 'Sales',
    employmentStatus: 'Inactive',
    grade: 'Sales Executive',
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    department: 'Engineering',
    employmentStatus: 'Active',
    grade: 'Lead Engineer',
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    department: 'Marketing',
    employmentStatus: 'Active',
    grade: 'Marketing Manager',
  },
  // Add more mock data as needed...
];

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate pagination parameters
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const total = mockEmployees.length;
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    const paginatedEmployees = mockEmployees.slice(startIndex, endIndex);

    // Return paginated response
    return NextResponse.json({
      data: paginatedEmployees,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error('Error in employees route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
