import dayjs from 'dayjs/esm';

import { IMindmapXml, NewMindmapXml } from './mindmap-xml.model';

export const sampleWithRequiredData: IMindmapXml = {
  id: '3ef63936-3216-4af3-9e59-884532fe1bed',
};

export const sampleWithPartialData: IMindmapXml = {
  id: '91d70375-dc52-4e50-85dc-75a0d971bf3c',
  text: 'or Denker brillieren',
  modified: dayjs('2024-07-22T09:16'),
};

export const sampleWithFullData: IMindmapXml = {
  id: '7ea9fbe6-3587-4de3-884c-a2adac466487',
  text: 'inasmuch erkühnen reihen',
  modified: dayjs('2024-07-23T00:36'),
};

export const sampleWithNewData: NewMindmapXml = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
