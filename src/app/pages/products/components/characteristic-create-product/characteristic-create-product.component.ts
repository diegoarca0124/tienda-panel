import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { IconTrashComponent } from '@app/icons/icon-trash/icon-trash.component';
import { AttributeService } from '@app/services/attribute.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import { catchError, finalize, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ProductInterface } from '../../interfaces/product.interface';
import { PropertyInterface } from '../../interfaces/property.interface';
import { CommonModule } from '@angular/common';
import { AttributeGroupInterface } from '@app/pages/attributes/interfaces/attribute-group.interface';
import { ProductService } from '@app/services/product.service';
import { ProductDescriptionInterface } from '../../interfaces/product-description.interface';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { IconAlertComponent } from '@app/icons/icon-alert/icon-alert.component';
import { AttributeInterface } from '../../interfaces/attribute.interface';
import { CdkAutofill } from "@angular/cdk/text-field";
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { environment } from 'environments/environment.dev';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { ɵɵDir } from "@angular/cdk/scrolling";
declare const toastr:any;

@Component({
  selector: 'app-characteristic-create-product',
  imports: [
    AlertComponent,
    NgSelectComponent,
    FormsModule,
    IconTrashComponent,
    CommonModule,
    NotFoundComponent,
    IconAlertComponent,
    CdkAutofill,
    FallbackImageDirective,
    NgbTooltipModule,
    RouterModule,
    ɵɵDir
],
  templateUrl: './characteristic-create-product.component.html',
  styleUrl: './characteristic-create-product.component.css',
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CharacteristicCreateProductComponent {
  public attributes : any[] = [];
  public const_attributes : any[] = [];
  public loadingAttributes: boolean = true;
  public errorMsmSeverListAttributes: string = '';
  private destroy$ = new Subject<void>();
  @Input({ required: true }) product!: ProductInterface;
  @Input() categoryId!: string;
  @Input({ required: true}) errorsProduct! : any;
  public errorMsmSeverListValuesAttribute: string = '';
  public loadingValuesAttribute: boolean = false;
  public valuesAttribute : any = [];
  public filter : string = '';
  @Input() id : string = '';
  public loadProducts : boolean = false;

  public loadBtnProductDescripcion : boolean = false;
  public data : ProductDescriptionInterface[] = [];
  public charEdit : { attribute?: string, group?: string } = {};
  public products : ProductInterface[] = [];
  public filterProducts : string = '';
  public errorMsmServerListProducts : string = '';
  
  constructor(
    private attributeService : AttributeService,
    private productService : ProductService
  ){

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['categoryId']?.currentValue) {
      this.init_attributes();
    }
  }

  ngOnInit(){
    if (this.id) {
      this.init_characteristics(this.id);
    }else{
      this.loadingAttributes = false;
    }
  }

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

  onCopyAttributes(id: string){
    this.init_characteristics(id);
  }

  init_attributes() {
    console.log(this.product.categoryId);
    this.loadingAttributes = true;
    this.errorMsmSeverListAttributes = '';
    this.attributes = [];
    this.attributeService
      .get_attributes_by_category(this.product.categoryId!)
      .pipe(
        takeUntil(this.destroy$),
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loadingAttributes = false))
      )
      .subscribe({
        next: (next: {data: any, message: string}) => {
          console.log(next);
          this.attributes = next.data;
          this.const_attributes = structuredClone(this.attributes)
        },
        error: (err) => {
          const error = err.error;
          this.errorMsmSeverListAttributes = error.message;
        },
      });
  }

  init_products() {
    console.log(this.product.categoryId);
    this.errorMsmServerListProducts = '';
    this.products = [];
    this.loadProducts = true;
    this.productService
      .find_products_to_copy(this.product.categoryId!, this.filterProducts)
      .pipe(
        takeUntil(this.destroy$),
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loadProducts = false))
      )
      .subscribe({
        next: (next: {data: any, message: string}) => {
          console.log(next.data);
          
          this.products = next.data;
          this.products = this.products.map((product) => ({
            ...product,
            miniature: `${environment.s3_public_url}/products/small/${product.miniature}`,
          }));
          console.log(this.products);
          
        },
        error: (err) => {
          const error = err.error;
          this.errorMsmServerListProducts = error.message;
        },
      });
  }

  init_characteristics(id: string){
    this.init_characteristics$(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
  }

  init_characteristics_noload(id: string){
    this.init_characteristics_noload$(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
  }

  init_characteristics$(id: string) {
    this.loadingAttributes = true;
    this.errorMsmSeverListAttributes = '';
    this.attributes = [];
    return this.productService.get_characteristics_product(id).pipe(
      withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
      tap((next) => {
         console.log(next);
        this.attributes = next;
        this.const_attributes = structuredClone(this.attributes);
       
      }),

      catchError(err => {
        this.errorMsmSeverListAttributes =
          err?.error?.message || 'Error cargando subcategorías';
        return of([]);
      }),

      finalize(() => this.loadingAttributes = false)
    );
  }

  init_characteristics_noload$(id: string) {
    this.errorMsmSeverListAttributes = '';
    return this.productService.get_characteristics_product(id).pipe(
      tap((next) => {
         console.log(next);
        this.attributes = next;
        this.const_attributes = structuredClone(this.attributes);
      }),
      catchError(err => {
        this.errorMsmSeverListAttributes =
          err?.error?.message || 'Error cargando subcategorías';
        return of([]);
      }),
    );
  }

  onSearchAttribute(){
    if(this.filter){
      const regex = new RegExp(this.filter, 'i');
      this.attributes = this.const_attributes
      .map(group => ({
        ...group,
        attributes: group.attributes.filter((attr: any) =>
          regex.test(attr.name)
        )
      }))
      .filter(group => group.attributes.length > 0);
    }else{
      this.attributes = this.const_attributes;
    }
  }

  getAttributesSelected() {
    return this.attributes;
  }

  onAttributeChange(group: any, attribute: any, selectedValues: any) { 
    this.charEdit = {
      group : group.id,
      attribute : attribute.id
    }
    const snnipet = this.const_attributes.find(item => item.id == group.id)
    .attributes.find((attr:any) => attr.id == attribute.id)
    .attributeValueId;
    
    this.data = []; 
    selectedValues.forEach((element:any) => { 
      this.data.push({ 
        attributeId: attribute.id, 
        attributeValueId: element.id, 
        value: element.value,
        productId: this.id
      }); 
    }); 
    this.loadBtnProductDescripcion = true;
    this.productService
    .update_product_description({
      groupId: group.id,
      attributeId: attribute.id,
      productId: this.id,
      descriptions: this.data
    })
    .pipe(
      withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
      takeUntil(this.destroy$),
      finalize(() => (this.loadBtnProductDescripcion = false))
    )
    .subscribe({
      next: (next: {data: any, message: string}) => {
        console.log(next);
        
        const attribute = this.attributes
          .find(item => item.id === next.data.groupId)
          ?.attributes.find((attr: any) => attr.id === next.data.attributeId);

        if (!attribute) return;

        attribute.attributeValueId = next.data.attributeValueId;
        toastr.success(next.message);
      },
      error: (err) => {
        const error = err.error;
        this.attributes.find(item => item.id == group.id)
        .attributes.find((attr:any) => attr.id == attribute.id)
        .attributeValueId = snnipet;
        toastr.error(error.message || '¡Error desconocido!');
      },
    });
  }

}
