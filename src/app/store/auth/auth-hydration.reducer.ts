import { ActionReducer, INIT, MetaReducer } from '@ngrx/store';
import { AuthUserState } from './auth.state';

export function authUserMetaReducer(
    reducer: ActionReducer<any>
  ): ActionReducer<any> {
    return (state, action) => {
      const newState = reducer(state, action);
      console.log('newState',newState);
      
  
      if (action.type === INIT) {
        const stored = localStorage.getItem('authUser');
        if (stored) {
          try {
            const user = JSON.parse(stored);
            return {
              ...newState,
              authUser: { user }
            };
          } catch {
            localStorage.removeItem('authUser');
          }
        }
      }
  
      if (newState.authUser?.user) {
        localStorage.setItem('authUser', JSON.stringify(newState.authUser.user));
      }
  
      return newState;
    };
}
  
  
