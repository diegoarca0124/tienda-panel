import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TinymceEditorComponent } from '@app/shared/tinymce-editor/tinymce-editor.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { basic_properties, full_properties } from './constants/properties-tinymce.constant';
import { environment } from 'environments/environment.dev';
import { AttributeService } from '@app/services/attribute.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '@app/services/category.service';

@Component({
  selector: 'app-create-product',
  imports: [
    SidebarComponent,
    TopbarComponent,
    RouterModule,
    CommonModule,
    TinymceEditorComponent,
    NgSelectModule,
    FormsModule
  ],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.css'
})
export class CreateProductComponent {

  private destroy$ = new Subject<void>();
  public loadBtn = false;
  public properties = (environment.tinymceSettings == 'basic') ? basic_properties : full_properties;
  public categories_ = [];
  public subcategories_ = [];
	public categories: string = '';
	public categoriesSelected: any = [];
	public errorMsmSeverListCategories: string = '';
  public errorMsmSeverListSubcategories: string = '';
  public loadingCategories: boolean = true;
  public loadingSubcategories: boolean = true;
  constructor(
    private attributeService: AttributeService,
    private categoryService: CategoryService
  ){
    
  }

  ngOnInit(){
    this.init_categories();
  }

  init_categories() {
    this.loadingCategories = true;
    this.errorMsmSeverListCategories = '';
    this.categoryService
      .get_categories_by_select()
      .pipe(
        takeUntil(this.destroy$),
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loadingCategories = false))
      )
      .subscribe({
        next: (next) => {
          this.categories_ = next;
        },
        error: (err) => {
          const error = err.error;
          this.errorMsmSeverListCategories = error;
        },
      });
  }

  init_subcategories(id: string) {
    this.loadingSubcategories = true;
    this.errorMsmSeverListSubcategories = '';
    this.categoryService
      .get_subcategories_by_select(this.categoriesSelected)
      .pipe(
        takeUntil(this.destroy$),
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loadingSubcategories = false))
      )
      .subscribe({
        next: (next) => {
          console.log(next);
          this.subcategories_ = next;
        },
        error: (err) => {
          const error = err.error;
          this.errorMsmSeverListSubcategories = error;
        },
      });
  }

  onSelectCategory(){
    this.init_subcategories(this.categoriesSelected);
  }

  create(){
    
  }
}
