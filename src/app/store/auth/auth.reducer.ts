import { createReducer, on } from '@ngrx/store';
import { initialAuthUserState } from './auth.state';
import { clearUserAuth, setUserAuth } from './auth.action';

export const AuthUserReducer  = createReducer(
  initialAuthUserState,
  on(setUserAuth, (state, { user }) => ({
    ...state,
    user
  })),
  on(clearUserAuth, () => ({ user: null }))
);
