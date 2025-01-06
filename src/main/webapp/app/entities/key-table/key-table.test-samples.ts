import dayjs from 'dayjs/esm';

import { IKeyTable, NewKeyTable } from './key-table.model';

export const sampleWithRequiredData: IKeyTable = {
  id: '07935bc0-3600-453c-8215-3d0621a8648d',
};

export const sampleWithPartialData: IKeyTable = {
  id: '2be5bbcb-bdf9-453d-9444-a9c367b2c3d8',
  key: 'Lunge laut',
  created: dayjs('2024-07-22T06:06'),
};

export const sampleWithFullData: IKeyTable = {
  id: 'd6a92c88-a720-4bf5-a366-2d59e8b263d2',
  key: 'instead',
  created: dayjs('2024-07-22T15:10'),
  modified: dayjs('2024-07-23T01:11'),
};

export const sampleWithNewData: NewKeyTable = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
