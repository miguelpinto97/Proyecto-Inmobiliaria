import { useState, useEffect } from 'react';
import { commonService } from '../services/api';

export const useCommonValues = () => {
  const [values, setValues] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValues = async () => {
      try {
        const res = await commonService.getValues();
        setValues(res.data);
      } catch (e) {
        console.error('Error fetching common values', e);
      } finally {
        setLoading(false);
      }
    };
    fetchValues();
  }, []);

  return { values, loading };
};
