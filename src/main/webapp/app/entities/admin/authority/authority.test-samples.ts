import { IAuthority, NewAuthority } from './authority.model';

export const sampleWithRequiredData: IAuthority = {
  name: '53f04022-db6d-4f56-b7b9-d3e6d036e74a',
};

export const sampleWithPartialData: IAuthority = {
  name: '0b4beba3-2400-4bdf-b869-fa133d70f437',
};

export const sampleWithFullData: IAuthority = {
  name: '75479064-1751-4494-827b-a79b822d00a6',
};

export const sampleWithNewData: NewAuthority = {
  name: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
