import dayjs from 'dayjs/esm';

import { IUserDetails, NewUserDetails } from './user-details.model';

export const sampleWithRequiredData: IUserDetails = {
  id: '7924d052-52b0-406c-a8b5-20fceeb25003',
};

export const sampleWithPartialData: IUserDetails = {
  id: '96559cbb-bbd4-4ac2-b7c9-8032d774f61b',
  created: dayjs('2024-07-22T16:30'),
};

export const sampleWithFullData: IUserDetails = {
  id: '1f3d8312-95b9-433d-86c7-816162d2d3b6',
  dob: dayjs('2024-07-22T10:35'),
  created: dayjs('2024-07-22T19:26'),
  modified: dayjs('2024-07-22T14:49'),
};

export const sampleWithNewData: NewUserDetails = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
