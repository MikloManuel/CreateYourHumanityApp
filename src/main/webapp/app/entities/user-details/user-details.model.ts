import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';

export interface IUserDetails {
  id: string;
  dob?: dayjs.Dayjs | null;
  created?: dayjs.Dayjs | null;
  modified?: dayjs.Dayjs | null;
  user?: Pick<IUser, 'id'> | null;
}

export type NewUserDetails = Omit<IUserDetails, 'id'> & { id: null };
