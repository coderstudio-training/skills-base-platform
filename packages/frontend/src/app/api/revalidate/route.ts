// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tags = ['all'] } = await request.json();

    console.log('Revalidating cache with tags:', tags);

    // First, trigger version update by calling version endpoint
    const versionResponse = await fetch(new URL('/api/version', request.url).toString(), {
      method: 'POST',
    });

    if (!versionResponse.ok) {
      throw new Error('Failed to update version');
    }

    const { version } = await versionResponse.json();

    // Then revalidate all specified tags
    for (const tag of tags) {
      revalidateTag(tag);
    }

    return NextResponse.json(
      {
        message: 'Revalidation successful',
        revalidatedTags: tags,
        version: version,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ message: 'Error revalidating cache' }, { status: 500 });
  }
}
