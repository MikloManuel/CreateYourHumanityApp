import dayjs from 'dayjs/esm';

import { IFormulaData, NewFormulaData } from './formula-data.model';

export const sampleWithRequiredData: IFormulaData = {
  id: 'ef579de0-2a6d-4535-9932-813674117783',
};

export const sampleWithPartialData: IFormulaData = {
  id: 'bea89839-945f-402f-9873-aeb14b05c2ce',
};

export const sampleWithFullData: IFormulaData = {
  id: '01bef13f-7c3d-4ef4-8ccb-32f727e62e22',
  map: 'in prachtvoll lernen',
  created: dayjs('2024-07-22T16:14'),
  modified: dayjs('2024-07-22T02:44'),
};

export const sampleWithNewData: NewFormulaData = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
