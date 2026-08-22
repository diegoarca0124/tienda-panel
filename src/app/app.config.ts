import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { AuthUserReducer } from './store/auth/auth.reducer';
import { metaReducers } from './store/meta-reducers';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

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
		importProvidersFrom(MonacoEditorModule.forRoot()),
	],
};
