import { IGrantSettings, NewGrantSettings } from './grant-settings.model';

export const sampleWithRequiredData: IGrantSettings = {
  id: 'fadc676a-9517-4608-9fb7-fcdbb71df059',
};

export const sampleWithPartialData: IGrantSettings = {
  id: '82373a0b-f35e-4a33-9f05-153690618cf6',
};

export const sampleWithFullData: IGrantSettings = {
  id: '8342e39c-f65a-49c2-9a16-ca85bb4e7b28',
  grantMap: 'schnarren nordwestlich',
};

export const sampleWithNewData: NewGrantSettings = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
