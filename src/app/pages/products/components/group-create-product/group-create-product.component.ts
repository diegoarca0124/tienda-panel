import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { ProductService } from '@app/services/product.service';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ProductInterface } from '../../interfaces/product.interface';
import { environment } from 'environments/environment.dev';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { IconAlertComponent } from '@app/icons/icon-alert/icon-alert.component';
declare const toastr:any;

@Component({
  selector: 'app-group-create-product',
  imports: [
    CommonModule,
    FormsModule,
    NotFoundComponent,
    NgbTooltipModule,
    IconAlertComponent
  ],
  templateUrl: './group-create-product.component.html',
  styleUrl: './group-create-product.component.css',
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class GroupCreateProductComponent {
  @Input({ required: true}) errorsProduct! : any;
  @Input({ required: true }) product!: ProductInterface;
  @Input() categoryId!: string;
  public groups : Array<any> = [];
  public loadingGroups: boolean = true;
  public filterGroup : string = '';
  private destroy$ = new Subject<void>();
  @Input() id : string = '';
  public loadUpdateGroup : boolean = false;

  public productGroupEdit = {
    productGroupId: ''
  }

  constructor(
    private productService: ProductService
  ){

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['categoryId']?.currentValue) {
      this.init_groups();
    }
  }

  ngOnInit(){
    if (!this.id) {
      this.loadingGroups = false;
    } 
  }

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

  onSelectGroup(id: string){
		if(!this.id){
      this.product.productGroupId = id;
    }else{
      this.productGroupEdit.productGroupId = id;
      this.productService.update_group_in_product(this.id, this.productGroupEdit)
      .pipe(
        takeUntil(this.destroy$),
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loadUpdateGroup = false))
      )
      .subscribe({
        next: (next)=>{
          console.log(next);
          
        },
        error: (err)=>{
           toastr.error(err.error.message);
        }
      });
    }
	}

  init_groups(){
    this.loadingGroups = true;
    console.log(this.product);
    
    this.productService.get_groups_for_create_product(this.id,this.product.categoryId!,this.filterGroup)
    .pipe(
      takeUntil(this.destroy$),
      withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
      finalize(() => (this.loadingGroups = false))
    )
    .subscribe({
      next: (next)=>{
        this.groups = next;
        this.groups = this.groups.map(group => ({
            ...group,
            productGroupItems: group.productGroupItems.map((item:any) => ({
                ...item,
                product: {
                    ...item.product,
                    cover: `${environment.s3_public_url}/products/medium/${item.product.cover}`,
                }
            }))
        }));
      },
      error: (err)=>{
        toastr.error(err.error.message);
        
      }
    });
  }
}
