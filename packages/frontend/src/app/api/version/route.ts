// app/api/version/route.ts
import { revalidateTag, unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

// Use Next.js cache to store version
const getVersionFromCache = unstable_cache(
  async () => {
    return {
      version: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };
  },
  ['api-version'],
  {
    tags: ['version'],
    revalidate: false, // We'll manually revalidate
  },
);

export async function GET() {
  const { version } = await getVersionFromCache();

  return NextResponse.json(
    { version },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export async function POST() {
  try {
    // Revalidate version cache
    revalidateTag('version');
    // Revalidate all data
    revalidateTag('all');

    // Get new version
    const { version } = await getVersionFromCache();

    return NextResponse.json(
      {
        version,
        message: 'Version updated successfully',
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  } catch (error) {
    console.error('Version update error:', error);
    return NextResponse.json({ message: 'Error updating version' }, { status: 500 });
  }
}
