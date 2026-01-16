import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Table = ({ 
  columns, 
  data, 
  onRowClick,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="w-full p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        Loading data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
        No data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
      <table className="w-full text-sm text-left">
        {/* HEADER */}
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50 dark:text-gray-400">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-6 py-4 font-medium">
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800 dark:divide-gray-700">
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`
                hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                  {/* If column has a 'render' function, use it. Otherwise just show the data. */}
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
