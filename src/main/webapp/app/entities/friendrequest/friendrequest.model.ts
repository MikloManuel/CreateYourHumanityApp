import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';

export interface IFriendrequest {
  id: string;
  requestDate?: dayjs.Dayjs | null;
  requestUserId?: string | null;
  info?: string | null;
  user?: Pick<IUser, 'id'> | null;
}

export type NewFriendrequest = Omit<IFriendrequest, 'id'> & { id: null };
