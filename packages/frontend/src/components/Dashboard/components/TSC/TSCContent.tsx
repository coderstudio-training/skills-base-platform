import ProficiencyTable from '@/components/Dashboard/components/TSC/ProficiencyTable';
import { BUSINESS_UNITS } from '@/components/Dashboard/constants';
import useTSCScroll from '@/components/Dashboard/hooks/useTSCScroll';
import { TSCContentProps } from '@/components/Dashboard/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { validateTextData } from '@/lib/utils';
import { Loader2, Pencil, Trash2 } from 'lucide-react';

export default function TSCContent({
  filteredTSCs,
  searchQuery,
  handleEdit,
  handleDelete,
}: TSCContentProps) {
  const { loaderRef, items, hasMore } = useTSCScroll(filteredTSCs, 5);

  return (
    <div className="space-y-4">
      {filteredTSCs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery
            ? `No TSCs found matching "${searchQuery}"`
            : 'No TSCs found for this business unit'}
        </div>
      ) : (
        items.map(tsc => (
          <Accordion type="single" collapsible key={tsc.id}>
            <AccordionItem value={tsc.id}>
              <AccordionTrigger>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center space-x-4">
                    <span>{tsc.title || 'Untitled TSC'}</span>
                    <span className="text-sm text-muted-foreground">
                      {BUSINESS_UNITS[tsc.businessUnit]}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(tsc);
                      }}
                      aria-label="Edit TSC"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(tsc.id);
                      }}
                      aria-label="Delete TSC"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">TSC Category</h3>
                    <p>{tsc.category}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">TSC Description</h3>
                    <p>{tsc.description}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">TSC Proficiency Description</h3>
                    <ProficiencyTable proficiencies={tsc.proficiencies} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Range of Application</h3>
                    {tsc.rangeOfApplication.length > 0 &&
                    !validateTextData(tsc.rangeOfApplication[0]) ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {tsc.rangeOfApplication.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No range of application specified</p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))
      )}
      {hasMore && (
        <div ref={loaderRef}>
          <div className="w-full flex flex-col items-center p-3 justify-center align-middle">
            <Loader2 className="h-8 w-8 animate-spin" />
            <div className="text-sm text-muted-foreground">Loading more taxonomy...</div>
          </div>
        </div>
      )}
    </div>
  );
}
