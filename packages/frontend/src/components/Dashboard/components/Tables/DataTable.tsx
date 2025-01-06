import { ScrollArea } from '@/components/ui/scroll-area';

export type ColumnConfig<T> = {
  header: string;
  key: keyof T | string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
};

interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  height?: string;
}

export function DataTable<T>({ data, columns, height = 'h-[360px]' }: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <div className="bg-gray-200 dark:bg-gray-800 border-b">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`py-4 px-6 text-gray-600 dark:text-gray-400 font-normal text-sm ${
                    column.width || ''
                  } text-${column.align || 'left'}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <ScrollArea className={height}>
        <div className="px-4">
          <table className="w-full">
            <tbody className="divide-y">
              {data.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`py-4 px-6 text-sm ${column.width || ''} text-${
                        column.align || 'left'
                      }`}
                    >
                      {column.render
                        ? column.render(item)
                        : (item[column.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}
