import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductGroupIndexComponent } from './product-group-index.component';

describe('ProductGroupIndexComponent', () => {
	let component: ProductGroupIndexComponent;
	let fixture: ComponentFixture<ProductGroupIndexComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ProductGroupIndexComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ProductGroupIndexComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
