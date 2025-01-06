import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';

export interface IUserMindmap {
  id: string;
  text?: string | null;
  modified?: dayjs.Dayjs | null;
  user?: Pick<IUser, 'id'> | null;
}

export type NewUserMindmap = Omit<IUserMindmap, 'id'> & { id: null };
