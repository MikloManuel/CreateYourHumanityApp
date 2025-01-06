import dayjs from 'dayjs/esm';

import { IFriends, NewFriends } from './friends.model';

export const sampleWithRequiredData: IFriends = {
  id: '6e7bb1ad-ee49-4e99-b870-f159f2b10790',
};

export const sampleWithPartialData: IFriends = {
  id: 'f83f346b-f7d7-4a1b-bb23-3c6c384c31aa',
  friendId: 'picken imaginär',
};

export const sampleWithFullData: IFriends = {
  id: '2f7e8ec9-2609-4251-9485-515e3bed700b',
  connectDate: dayjs('2024-07-22T02:55'),
  friendId: 'solidarisch',
};

export const sampleWithNewData: NewFriends = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
