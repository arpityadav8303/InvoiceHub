import { useState, useMemo } from 'react';

export default function usePagination(data = [], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Calculate total pages based on data length
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // 2. Slice the data to get only the items for the current page
  // useMemo ensures we don't recalculate this unless data/page changes
  const currentData = useMemo(() => {
    const begin = (currentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    return data.slice(begin, end);
  }, [data, currentPage, itemsPerPage]);

  // 3. Helper to safely change pages
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  return {
    currentData,   // The actual 10 items to display
    currentPage,   // The number 1, 2, 3...
    totalPages,    // The total count
    goToPage,      // Function to jump to a page
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
  };
}
