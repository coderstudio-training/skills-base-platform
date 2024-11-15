const API_BASE_URL = 'http://localhost:3003';

export async function GET() {
  try {
    // Use hardcoded email for now
    const email = 'kathlynelmajoy.alcoseba@stratpoint.com';

    console.log('Fetching from:', `${API_BASE_URL}/api/learning/recommendations/${email}`);

    const response = await fetch(`${API_BASE_URL}/api/learning/recommendations/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Add this to prevent caching
    });

    if (!response.ok) {
      console.error('Response status:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    return Response.json(data);
  } catch (error) {
    console.error('Error in route handler:', error);
    return Response.json({ status: 500 });
  }
}
