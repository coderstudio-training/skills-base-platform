import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const { businessUnit } = await req.json();

  if (!businessUnit) {
    return new Response('Missing businessUnit', { status: 400 });
  }

  // You can use the businessUnit to have dynamic tags `taxonomy-${businessUnit} for further control`
  revalidateTag('taxonomy');
  return new Response('Revalidated taxonomy!', { status: 200 });
}
