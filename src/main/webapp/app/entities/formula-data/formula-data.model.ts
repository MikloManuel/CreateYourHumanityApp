import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';

export interface IFormulaData {
  id: string;
  map?: string | null;
  created?: dayjs.Dayjs | null;
  modified?: dayjs.Dayjs | null;
  user?: Pick<IUser, 'id'> | null;
}

export type NewFormulaData = Omit<IFormulaData, 'id'> & { id: null };
