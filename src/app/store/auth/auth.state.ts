import { AuthUser } from '../../common/interface/auth-user.interface';

export interface AuthUserState {
	user: AuthUser | null;
}

export const initialAuthUserState: AuthUserState = {
	user: null,
};
