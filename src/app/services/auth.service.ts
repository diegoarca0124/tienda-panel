import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Store } from '@ngrx/store';

import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = environment.apiUrl;

	constructor(
		private http: HttpClient,
		private store: Store,
		private router: Router
	) {}

	getToken() {
		return localStorage.getItem('token')?.toString();
	}

	getUser() {
		return JSON.parse(localStorage.getItem('user')!);
	}

	login(auth: { email: string; password: string }): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.getToken() || ''}`,
		});
		return this.http.post(`${this.apiUrl}/collaborator/login`, auth, { headers });
	}

	validate_token(): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.getToken() || ''}`,
		});
		return this.http.get(`${this.apiUrl}/collaborator/validate_token`, { headers });
	}

	logout(): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.getToken() || ''}`,
		});
		return this.http.get(`${this.apiUrl}/collaborator/logout`, { headers });
	}

	/*  */
}
