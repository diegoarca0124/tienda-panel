import { createAction, props } from '@ngrx/store';
import { AuthUser } from '../../common/interface/auth-user.interface';

export const setUserAuth = createAction(
  '[UserAuth] Set User',
  props<{user:AuthUser}>()
);


export const clearUserAuth = createAction('[UserAuth] Clear User');