import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { AuthUserReducer } from './store/auth/auth.reducer';
import { metaReducers } from './store/meta-reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    provideStore(
      {
        authUser: AuthUserReducer,
      },
      { metaReducers } 
    ),
  ]
};
