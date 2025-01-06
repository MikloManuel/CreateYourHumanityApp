import { IUser } from './user.model';

export const sampleWithRequiredData: IUser = {
  id: '6d130b01-3df5-4a59-8115-9ef8b3f5e613',
  login: '@Nera7',
};

export const sampleWithPartialData: IUser = {
  id: 'a785d141-5cf0-457a-9e5c-02baa354db74',
  login: 'y^@msO4\\(z\\pYtEWq\\fL-ucIh',
};

export const sampleWithFullData: IUser = {
  id: '2aa33040-1bfd-4656-9578-9571a0e5713d',
  login: 'V5',
};
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
