import { IPrivacySettings, NewPrivacySettings } from './privacy-settings.model';

export const sampleWithRequiredData: IPrivacySettings = {
  id: 'a24c7228-3a7c-4ce6-9373-ff6176b16999',
};

export const sampleWithPartialData: IPrivacySettings = {
  id: '7b5e3ad1-c47a-43d9-8387-1055ed0d7bb7',
};

export const sampleWithFullData: IPrivacySettings = {
  id: '1c9e1794-a050-4083-9004-8e4fe1b6b63d',
  settingsMap: 'friedvoll hierauf incidentally',
};

export const sampleWithNewData: NewPrivacySettings = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
