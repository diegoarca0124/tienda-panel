import { TestBed } from '@angular/core/testing';

import { KibanaService } from './kibana.service';

describe('KibanaService', () => {
	let service: KibanaService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(KibanaService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
