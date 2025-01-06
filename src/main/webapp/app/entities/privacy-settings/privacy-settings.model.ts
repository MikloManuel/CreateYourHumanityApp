import { IUser } from 'app/entities/user/user.model';

export interface IPrivacySettings {
  id: string;
  settingsMap?: string | null;
  user?: Pick<IUser, 'id'> | null;
}

export type NewPrivacySettings = Omit<IPrivacySettings, 'id'> & { id: null };
