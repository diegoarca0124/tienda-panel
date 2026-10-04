import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexProductsSettingsCategoryComponent } from './index-products-settings-category.component';

describe('IndexProductsSettingsCategoryComponent', () => {
	let component: IndexProductsSettingsCategoryComponent;
	let fixture: ComponentFixture<IndexProductsSettingsCategoryComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [IndexProductsSettingsCategoryComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(IndexProductsSettingsCategoryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
