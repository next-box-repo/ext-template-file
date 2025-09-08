import { useMemo } from 'react';

import { nextbox } from '../service/nextbox';

export const useNextbox = () => {
  const service = useMemo(() => nextbox, []);
  return service;
};
