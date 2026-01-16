import { useState, useEffect, useCallback } from 'react';

// Usage: const { data, loading, error } = useFetch(api.getInvoices);
export default function useFetch(apiFunction, immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate); // Start loading if immediate is true
  const [error, setError] = useState(null);

  // The actual function that calls the API
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction(...args);
      setData(response.data); // Assuming your API returns { data: ... }
      return response.data;
    } catch (err) {
      // Extract the error message safely
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMessage);
      throw err; // Re-throw so the component can handle it if needed
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  // Automatically run the fetch on mount if 'immediate' is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute };
}
