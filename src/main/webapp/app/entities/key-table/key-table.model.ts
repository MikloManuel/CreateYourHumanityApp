import dayjs from 'dayjs/esm';

export interface IKeyTable {
  id: string;
  key?: string | null;
  created?: dayjs.Dayjs | null;
  modified?: dayjs.Dayjs | null;
}

export type NewKeyTable = Omit<IKeyTable, 'id'> & { id: null };
