import SoftProficiencyTable from '@/components/Dashboard/components/Taxonomy/SoftProficiencyTable';
import TechnicalProficiencyTable from '@/components/Dashboard/components/Taxonomy/TechnicalProficiencyTable';
import { BUSINESS_UNITS } from '@/components/Dashboard/constants';
import useTaxonomyScroll from '@/components/Dashboard/hooks/useTSCScroll';
import { TSC, TSCContentProps } from '@/components/Dashboard/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { validateTextData } from '@/lib/utils';
import { isSoftSkill, isTSC } from '@/lib/utils/taxonomy-utils';
import { Loader2, Pencil, Trash2 } from 'lucide-react';

export default function SkillContent({
  filteredTaxonomies,
  searchQuery,
  handleEdit,
  handleDelete,
}: TSCContentProps) {
  const { loaderRef, items, hasMore } = useTaxonomyScroll(filteredTaxonomies, 5);

  return (
    <div className="space-y-4">
      {filteredTaxonomies.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery
            ? `No taxonomies found matching "${searchQuery}"`
            : 'No taxonomies found for this business unit'}
        </div>
      ) : (
        items.map(taxonomy => (
          <Accordion type="single" collapsible key={taxonomy.id}>
            <AccordionItem value={taxonomy.id}>
              <AccordionTrigger>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center space-x-4">
                    <span>{taxonomy.title}</span>
                    {taxonomy.type === 'technical' && (
                      <span className="text-sm text-muted-foreground">
                        {BUSINESS_UNITS[(taxonomy as TSC).businessUnit]}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-blue-500"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(taxonomy);
                      }}
                      aria-label="Edit Skill"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-red-500"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(taxonomy.id);
                      }}
                      aria-label="Delete Skill"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Category</h3>
                    <p>{taxonomy.category}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p>{taxonomy.description}</p>
                  </div>
                  {isTSC(taxonomy) && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Proficiency Description</h3>
                        <TechnicalProficiencyTable proficiencies={taxonomy.proficiencies} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Range of Application</h3>
                        {taxonomy.rangeOfApplication.length > 0 &&
                        !validateTextData((taxonomy as TSC).rangeOfApplication[0]) ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {taxonomy.rangeOfApplication.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No range of application specified</p>
                        )}
                      </div>
                    </>
                  )}
                  {isSoftSkill(taxonomy) && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Proficiency Description</h3>
                        <SoftProficiencyTable proficiencies={taxonomy.proficiencies} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Rating</h3>
                        {taxonomy.rating.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {taxonomy.rating.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No ratings specified</p>
                        )}
                      </div>
                    </>
                  )}
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
