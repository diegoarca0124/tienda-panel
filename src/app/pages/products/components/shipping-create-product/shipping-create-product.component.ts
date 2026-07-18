import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { productFormHelp } from '../../constants/form-product-helper.constant';
import { packages } from '@app/common/constants/packages.constant';
import { ShippingProduct } from '@app/common/interface/shipping-product.interface';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';

@Component({
  selector: 'app-shipping-create-product',
  imports: [
    NgSelectModule,
    CommonModule,
    FormsModule,
    ValidationPopoverComponent,
    TextareaAutoresizeDirective
  ],
  templateUrl: './shipping-create-product.component.html',
  styleUrl: './shipping-create-product.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShippingCreateProductComponent {
  public labelHelper = productFormHelp;
  public packages_ : any = packages;
  @Input({ required: true}) errorsProduct! : any;
  @Input({ required: true}) shipping! : ShippingProduct;
  @Input() showErrors: any = {};
  @Input() id : string = '';
  @Input({ required: false}) loadProduct : boolean = true;
}
