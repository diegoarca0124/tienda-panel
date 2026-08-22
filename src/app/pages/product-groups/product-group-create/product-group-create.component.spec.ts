import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductGroupCreateComponent } from './product-group-create.component';

describe('ProductGroupCreateComponent', () => {
	let component: ProductGroupCreateComponent;
	let fixture: ComponentFixture<ProductGroupCreateComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ProductGroupCreateComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ProductGroupCreateComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
