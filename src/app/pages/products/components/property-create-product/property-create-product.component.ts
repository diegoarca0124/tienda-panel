import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UnitMaskDirective } from '@app/common/directives/unit-mask.directive';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProductInterface } from '../../interfaces/product.interface';
import { unitsOfMeasure } from '@app/common/constants/units.constan';
import { PhysicalProductInterface } from '../../interfaces/product-physical.interface';
import { productFormHelp } from '../../constants/form-product-helper.constant';
import { temperatures } from '@app/common/constants/temperatures.cosntant';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';

@Component({
	selector: 'app-property-create-product',
	imports: [NgSelectModule, CommonModule, FormsModule, UnitMaskDirective, ValidationPopoverComponent],
	templateUrl: './property-create-product.component.html',
	styleUrl: './property-create-product.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PropertyCreateProductComponent {
	@Input({ required: true }) product!: ProductInterface;
	@Input({ required: true }) physical!: PhysicalProductInterface;
	@Input({ required: true }) errorsProduct!: any;
	@Input({ required: false }) loadProduct: boolean = true;
	@Input() showErrors: any = {};
	@Input() categorySelected: any;
	@Input() id: string = '';
	public weightUnits_ = unitsOfMeasure.filter((item) => item.group == 'Peso');
	public dimensiontUnits_ = unitsOfMeasure.filter((item) => item.group == 'Longitud');
	public labelHelper = productFormHelp;
	public temperatures_: any = temperatures;
}
