import dayjs from 'dayjs/esm';

import { IFriendrequest, NewFriendrequest } from './friendrequest.model';

export const sampleWithRequiredData: IFriendrequest = {
  id: '3dc7ccf5-6bb6-4562-8e99-9d3e1d2775d3',
};

export const sampleWithPartialData: IFriendrequest = {
  id: 'ee8fc412-c7bc-4017-b359-bd3e83bdbeb7',
  info: '../fake-data/blob/hipster.txt',
};

export const sampleWithFullData: IFriendrequest = {
  id: '9cbbf168-f927-4c50-8653-9bc5d08a9796',
  requestDate: dayjs('2024-07-22T21:01'),
  requestUserId: 'ugh',
  info: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewFriendrequest = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
