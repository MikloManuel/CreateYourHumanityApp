import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';

export interface IFriends {
  id: string;
  connectDate?: dayjs.Dayjs | null;
  friendId?: string | null;
  user?: Pick<IUser, 'id'> | null;
}

export type NewFriends = Omit<IFriends, 'id'> & { id: null };
