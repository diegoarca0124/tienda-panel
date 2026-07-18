import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IconCheckComponent } from '@app/icons/icon-check/icon-check.component';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, forkJoin, Subject, switchMap, takeUntil } from 'rxjs';
import { AttributeGroupInterface } from '../interfaces/attribute-group.interface';
import { createEmptyGroupAttribute } from '../utils/empties.util';
import { CategoryService } from '@app/services/category.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { AttributeService } from '@app/services/attribute.service';
import { showErrorsGroupAttribute } from '../constants/show-errors-group-attribute.constant';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
declare const toastr:any;

@Component({
  selector: 'app-edit-group-attribute',
  imports: [TopbarComponent, SidebarComponent, CommonModule, FormsModule, RouterModule, NgSelectModule, 
		IconCheckComponent, NotFoundComponent, AlertComponent, ValidationPopoverComponent, TextareaAutoresizeDirective],
  templateUrl: './edit-group-attribute.component.html',
  styleUrl: './edit-group-attribute.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditGroupAttributeComponent {

  public errorsGroupAtribute: any = {};
  private destroy$ = new Subject<void>();
  public loadBtn: boolean = false;
  public groupAttribute : AttributeGroupInterface = createEmptyGroupAttribute();
  public msmErrorGroupAttribute: any = [];
  public errorMsmServer: string = '';
  public option = 1;

  public categoriesSelected : any = [];
  public errorMsmSeverListCategories: string = '';
  public errorMsmServerGetGroupAttribute: string = '';
	public loadingCategories: boolean = true;
	public categories = [];
  public id: string = '';
  public loading: boolean = true;
  public showErrors = showErrorsGroupAttribute;

  constructor(
    private categoryService: CategoryService,
    private _route: ActivatedRoute,
    private attributeService: AttributeService
  ){

  }

  ngOnInit(): void {
    this._route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.id = params['id'];
          this.loading = true;
          this.loadingCategories = true;
          this.errorMsmServerGetGroupAttribute = '';
          this.errorMsmSeverListCategories = '';
          return forkJoin({
            groupAttribute: this.attributeService.get_attribute_group(this.id),
            categories: this.categoryService.get_categories_by_select()
          }).pipe(
            withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
            finalize(() => {
              this.loading = false;
              this.loadingCategories = false;
            })
          );
        })
      )
      .subscribe({
        next: ({ groupAttribute, categories }: any) => {
          console.log(groupAttribute, categories);
          
          this.groupAttribute = groupAttribute.data;
          this.categoriesSelected = groupAttribute.data.categories;
          this.categories = categories.data;
        },
        error: (err) => {
          console.log(err);
          
          const error = err.error;
          this.errorMsmServerGetGroupAttribute = error;
          this.errorMsmSeverListCategories = error;
        },
      });
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
        next: (next) => {
          this.categories = next;
        },
        error: (err) => {
          const error = err.error;
          this.errorMsmSeverListCategories = error;
        },
      });
  }

  update(){
    this.loadBtn = true;
    this.groupAttribute.categories = this.categoriesSelected;
    this.errorMsmServer = '';
    this.msmErrorGroupAttribute = '';
    this.attributeService
    .update_attribute_group(this.id, this.groupAttribute)
    .pipe(
      withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
      takeUntil(this.destroy$),
      finalize(() => (this.loadBtn = false))
    )
    .subscribe({
      next: (next: {message: string, data: AttributeGroupInterface}) => {
        this.errorsGroupAtribute = {};
        this.groupAttribute = next.data;
        this.categoriesSelected = this.groupAttribute.attributeCategories!.map((prev)=> prev.categoryId);
        toastr.success(next.message);
      },
      error: (err) => {
        const error = err.error;
        this.errorMsmServer = error.message || '¡Error desconocido!';
        toastr.error(this.errorMsmServer);

        if (error.validation) {
          this.errorsGroupAtribute = error.validation;
          this.msmErrorGroupAttribute =Object.values(this.errorsGroupAtribute).flat();
          for (const key in this.showErrors) {
						this.showErrors[key as keyof typeof this.showErrors] =
						!!this.errorsGroupAtribute?.[key]?.length;
					}
        }
      },
    });
  }

}
