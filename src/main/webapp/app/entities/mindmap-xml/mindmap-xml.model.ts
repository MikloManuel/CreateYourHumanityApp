import dayjs from 'dayjs/esm';

export interface IMindmapXml {
  id: string;
  text?: string | null;
  modified?: dayjs.Dayjs | null;
}

export type NewMindmapXml = Omit<IMindmapXml, 'id'> & { id: null };
