import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AttributeGroupInterface } from '../interfaces/attribute-group.interface';
import { createEmptyGroupAttribute } from '../utils/empties.util';
import { AttributeService } from '@app/services/attribute.service';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { showErrorsGroupAttribute } from '../constants/show-errors-group-attribute.constant';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { CategoryInterface } from '@app/pages/categories/interfaces/category.interface';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
declare const toastr : any;

@Component({
  selector: 'app-create-group-attribute',
  imports: [
    TopbarComponent,
    SidebarComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    NgSelectModule,
    AlertComponent,
    ValidationPopoverComponent,
    TextareaAutoresizeDirective
  ],
  templateUrl: './create-group-attribute.component.html',
  styleUrl: './create-group-attribute.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateGroupAttributeComponent {

  public errorsGroupAtribute: any = {};
  private destroy$ = new Subject<void>();
  public loadBtn: boolean = false;
  public groupAttribute : AttributeGroupInterface = createEmptyGroupAttribute();
  public msmErrorGroupAttribute: any = [];
  public option = 1;

  public categoriesSelected = [];
  public errorMsmSeverListCategories: string = '';
	public loadingCategories: boolean = true;
	public categories : CategoryInterface[] = [];
  public showErrors = showErrorsGroupAttribute;

  constructor(
    private categoryService: CategoryService,
    private attributeService: AttributeService,
    private _router: Router
  ){

  }

  ngOnInit(){
    this.init_categories();
  }

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
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
        next: (next: { data: CategoryInterface[], message: string}) => {
          this.categories = next.data;
        },
        error: (err) => {
          const error = err.error;
          this.errorMsmSeverListCategories = error;
        },
      });
  }

  create(){
    this.loadBtn = true;
		this.groupAttribute.categories = this.categoriesSelected;
    this.msmErrorGroupAttribute = '';
    this.attributeService
    .create_group_attribute(this.groupAttribute)
    .pipe(
      takeUntil(this.destroy$),
      withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
      finalize(() => (this.loadBtn = false))
    )
    .subscribe({
      next: (next: {message: string, attribute: AttributeGroupInterface}) => {
        this.errorsGroupAtribute = {};
        toastr.success(next.message);
        this._router.navigate(['/products/attributes/groups']);
      },
      error: (err) => {
        const error = err.error;
        toastr.error(error.message || '¡Error desconocido!');
        if (error.validation) {
          this.errorsGroupAtribute = error.validation;
          this.msmErrorGroupAttribute =Object.values(this.errorsGroupAtribute).flat();
          this.showErrors = buildShowErrors(this.showErrors,this.errorsGroupAtribute);
        }
      },
    });
  }

  
}
