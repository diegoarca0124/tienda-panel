import { MetaReducer } from '@ngrx/store';
import { authUserMetaReducer } from './auth/auth-hydration.reducer';

export const metaReducers: MetaReducer[] = [
  authUserMetaReducer,
];