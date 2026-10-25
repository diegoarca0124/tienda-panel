import { getHttpErrorBody, type HttpErrorBody } from '@app/common/utils/get-http-error-body.util';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { TagifyInputComponent, TagifyOption } from '@app/shared/tagify-input/tagify-input.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AttributeGroupInterface } from '../interfaces/attribute-group.interface';
import { createEmptyGroupAttribute, createEmptyFieldErrorsGroupAttribute } from '../utils/empties.util';
import { AttributeService } from '@app/services/attribute.service';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
import { CategoryInterface } from '@app/pages/categories/interfaces/data.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { GroupAttributeValidationErrors, GroupAttributeFieldErrors } from '../interfaces/validation.interface';
import { CreateGroupAttributeRESI } from '../interfaces/response.interface';
declare const toastr: any;

@Component({
	selector: 'app-create-group-attribute',
	imports: [TopbarComponent, SidebarComponent, CommonModule, RouterModule, FormsModule, TagifyInputComponent, ValidationPopoverComponent, TextareaAutoresizeDirective],
	templateUrl: './create-group-attribute.component.html',
	styleUrl: './create-group-attribute.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CreateGroupAttributeComponent {
	public validationGroupAttributeError: GroupAttributeValidationErrors = {};
	private destroy$ = new Subject<void>();
	public isCreateGroupAttributeLoading: boolean = false;
	public groupAttribute: AttributeGroupInterface = createEmptyGroupAttribute();

	public categoriesSelected: string[] = [];
	public categoriesLoadError: HttpErrorBody | null = null;
	public isCategoriesLoading: boolean = true;
	public categories: CategoryInterface[] = [];
	public categoryOptions: TagifyOption[] = [];
	public fieldErrors: GroupAttributeFieldErrors = createEmptyFieldErrorsGroupAttribute();

	constructor(
		private categoryService: CategoryService,
		private attributeService: AttributeService,
		private _router: Router
	) {}

	ngOnInit() {
		this.loadCategories();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadCategories() {
		this.isCategoriesLoading = true;
		this.categoriesLoadError = null;
		this.categoryService
			.get_categories_by_select()
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.isCategoriesLoading = false))
			)
			.subscribe({
				next: (next: { data: CategoryInterface[]; message: string }) => {
					this.categories = next.data;
					this.categoryOptions = next.data.filter((category) => !!category.id).map((category) => ({ value: category.id!, name: category.name }));
				},
				error: (err: HttpErrorResponse) => {
					const error = getHttpErrorBody(err);
					this.categoriesLoadError = error;
				},
			});
	}

	createGroupAttribute() {
		if (this.isCreateGroupAttributeLoading) return;
		this.isCreateGroupAttributeLoading = true;
		this.groupAttribute.categories = this.categoriesSelected;
		this.attributeService
			.createGroupAttribute(this.groupAttribute)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.isCreateGroupAttributeLoading = false))
			)
			.subscribe({
				next: (next: CreateGroupAttributeRESI) => {
					this.fieldErrors = createEmptyFieldErrorsGroupAttribute();
					this.validationGroupAttributeError = {};
					toastr.success(next.message);
					this._router.navigate(['/products/attributes/groups']);
				},
				error: (err: HttpErrorResponse) => {
					const error = getHttpErrorBody(err);
					toastr.error(error.message || '¡Error desconocido!');
					if (error.validation) {
						this.validationGroupAttributeError = error.validation;
						this.fieldErrors = buildShowErrors(this.fieldErrors, this.validationGroupAttributeError);
					}
				},
			});
	}
}
