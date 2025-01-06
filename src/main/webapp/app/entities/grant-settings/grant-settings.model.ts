import { IUser } from 'app/entities/user/user.model';

export interface IGrantSettings {
  id: string;
  grantMap?: string | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewGrantSettings = Omit<IGrantSettings, 'id'> & { id: null };
