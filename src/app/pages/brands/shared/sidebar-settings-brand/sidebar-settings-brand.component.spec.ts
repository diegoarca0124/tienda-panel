import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { SidebarSettingsBrandComponent } from './sidebar-settings-brand.component';

describe('SidebarSettingsBrandComponent', () => {
	let component: SidebarSettingsBrandComponent;
	let fixture: ComponentFixture<SidebarSettingsBrandComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SidebarSettingsBrandComponent],
			providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'brand-1' }) } } }],
		}).compileComponents();

		fixture = TestBed.createComponent(SidebarSettingsBrandComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
