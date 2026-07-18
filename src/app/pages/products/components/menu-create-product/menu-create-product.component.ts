import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductTabInterface } from '../../interfaces/product-tab.interface';

@Component({
  selector: 'app-menu-create-product',
  imports: [
    CommonModule
  ],
  templateUrl: './menu-create-product.component.html',
  styleUrl: './menu-create-product.component.css'
})
export class MenuCreateProductComponent {
  
  @Input() categorySelected : any;
  @Input() tab : ProductTabInterface;
  @Output() tabChange = new EventEmitter<ProductTabInterface>();

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  changeOption(tab: ProductTabInterface) {
    this.tab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
    this.tabChange.emit(this.tab);
	}
}
