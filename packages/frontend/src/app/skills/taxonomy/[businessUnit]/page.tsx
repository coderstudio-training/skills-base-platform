import TaxonomyTable from '@/components/skills/TaxonomyTable';
import { authOptions } from '@/lib/api/auth';
import { getTechnicalTaxonomy } from '@/lib/skills/api';
import { logger } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
// Define the revalidation interval for ISR (if needed)
export const revalidate = 0;

interface PageProps {
  params: {
    businessUnit: string;
  };
}

export default async function TaxonomyPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  logger.log('Server-side session:', session);

  if (!session) {
    logger.log('No session, redirecting to login');
    redirect('/');
  }

  const { businessUnit } = params;

  const { data, error } = await getTechnicalTaxonomy(businessUnit);

  if (error) {
    logger.log(`ACCESSING DATA ${data}`);
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-red-500">Error</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">No Data Available</h1>
        <p>There is no taxonomy data for the selected business unit: {businessUnit}.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Taxonomy for {businessUnit}</h1>
      <TaxonomyTable data={data} />
    </div>
  );
}
