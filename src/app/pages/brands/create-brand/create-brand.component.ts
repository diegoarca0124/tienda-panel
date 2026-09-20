import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { countries } from '@app/common/constants/countries.constant';
import { UploadImageComponent } from '@app/shared/upload-image/upload-image.component';
import { BrandService } from '@app/services/brand.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { IMaskModule } from 'angular-imask';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { createEmptyBrand, createEmptyFieldErrorsBrand } from '../utils/empties.util';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { BrandInterface } from '../interfaces/data.interface';
import { BrandFieldErrors, BrandValidationErrors } from '../interfaces/validation.interface';
import { prefixMask } from '@app/pages/categories/constants/prefix-mask.constant';
import { CreateBrandRESI } from '../interfaces/response.interface';
declare const toastr: any;

@Component({
	selector: 'app-create-brand',
	imports: [
		TopbarComponent,
		SidebarComponent,
		CommonModule,
		FormsModule,
		RouterModule,
		NgSelectModule,
		UploadImageComponent,
		AlertComponent,
		IMaskModule,
		ValidationPopoverComponent,
		TextareaAutoresizeDirective,
	],
	templateUrl: './create-brand.component.html',
	styleUrl: './create-brand.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CreateBrandComponent {
	private destroy$ = new Subject<void>();
	public brand: BrandInterface = createEmptyBrand();
	public croppedImage: string | null = null;
	public countriesValues = countries;
	public isCreateBrandLoading = false;
	public validationBrandError: BrandValidationErrors = {
		logoUrl: [],
		bannerUrl: [],
	};
	public prefixMask = prefixMask;
	public fieldErrors: BrandFieldErrors = createEmptyFieldErrorsBrand();

	constructor(
		private brandService: BrandService,
		private _router: Router
	) {}

	ngOnInit() {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	setErrorLogo(error: string | null): void {
		this.validationBrandError.logoUrl = error ? [error] : [];
	}

	setErrorBanner(error: string | null): void {
		this.validationBrandError.bannerUrl = error ? [error] : [];
	}

	create() {
		this.isCreateBrandLoading = true;
		this.brandService
			.createBrand(this.brand)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.isCreateBrandLoading = false))
			)
			.subscribe({
				next: (next: CreateBrandRESI) => {
					this.validationBrandError = {
						logoUrl: [],
						bannerUrl: [],
					};
					toastr.success(next.message);
					this._router.navigate(['/products/brands']);
				},
				error: (err: HttpErrorResponse) => {
					this.validationBrandError = {
						logoUrl: [],
						bannerUrl: [],
					};
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.validationBrandError = {
							...this.validationBrandError,
							...error.validation,
						};
						this.fieldErrors = buildShowErrors(this.fieldErrors, this.validationBrandError);
					}
				},
			});
	}
}
