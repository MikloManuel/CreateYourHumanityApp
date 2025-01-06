import dayjs from 'dayjs/esm';

import { IUserMindmap, NewUserMindmap } from './user-mindmap.model';

export const sampleWithRequiredData: IUserMindmap = {
  id: 'de815be4-6ada-4c68-8ba2-1223150fb912',
};

export const sampleWithPartialData: IUserMindmap = {
  id: 'e6e75413-a703-46d1-94ca-b0ac47ee302a',
  text: 'gah',
  modified: dayjs('2024-07-22T11:55'),
};

export const sampleWithFullData: IUserMindmap = {
  id: 'd4d361d1-92d3-4859-98ba-b5361be379a3',
  text: 'gemeiniglich vor Arm',
  modified: dayjs('2024-07-23T01:34'),
};

export const sampleWithNewData: NewUserMindmap = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
