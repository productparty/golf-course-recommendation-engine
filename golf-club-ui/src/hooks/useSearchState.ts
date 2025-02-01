import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SearchCriteria {
  zipCode: string;
  radius: string;
  filters?: Record<string, any>;
  results?: any[];
}

export const useSearchState = (key: string = 'searchState') => {
  const location = useLocation();
  const [searchState, setSearchState] = useState<SearchCriteria>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {
      zipCode: '',
      radius: '25',
      filters: {},
      results: []
    };
  });

  useEffect(() => {
    if (searchState) {
      localStorage.setItem(key, JSON.stringify(searchState));
    }
  }, [searchState, key]);

  return [searchState, setSearchState] as const;
}; 