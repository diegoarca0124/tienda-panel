import { getHttpErrorBody, type HttpErrorBody } from '@app/common/utils/get-http-error-body.util';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { countries } from '@app/common/constants/countries.constant';
import { BrandService } from '@app/services/brand.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { UploadImageComponent } from '@app/shared/upload-image/upload-image.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { IMaskModule } from 'angular-imask';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { environment } from 'environments/environment.dev';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
import { HttpErrorResponse } from '@angular/common/http';
import { BrandInterface } from '../../../interfaces/data.interface';
import { createEmptyBrand, createEmptyFieldErrorsBrand } from '../../../utils/empties.util';
import { BrandFieldErrors, BrandValidationErrors } from '../../../interfaces/validation.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { prefixMask } from '@app/pages/brands/constants/prefix-mask.constant';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { GetBrandRESI, UpdateBrandRESI } from '../../../interfaces/response.interface';
import { DEFAULT_IMAGE_UPLOAD_CONFIG } from '@app/common/constants/file-upload.constant';
declare const toastr: any;
declare const $: any;

@Component({
	selector: 'app-edit-brand',
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		NgSelectModule,
		UploadImageComponent,
		NotFoundComponent,
		AlertComponent,
		IMaskModule,
		ValidationPopoverComponent,
		TextareaAutoresizeDirective,
	],
	templateUrl: './edit-brand.component.html',
	styleUrl: './edit-brand.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditBrandComponent {
	private destroy$ = new Subject<void>();
	private readonly cancelContext$ = new Subject<void>();
	private contextVersion = 0;
	public brand: BrandInterface = createEmptyBrand();
	public croppedImage: string | null = null;
	public countriesValues = countries;

	public isUpdateBrandLoading = false;
	public isBrandLoading = true;

	public id: string = '';

	public brandLoadError: HttpErrorBody | null = null;
	public validationBrandError: BrandValidationErrors = {
		logoUrl: [],
		bannerUrl: [],
	};

	public logoUrlEdit: string = '';
	public bannerUrlEdit: string = '';
	public prefixMask = prefixMask;
	public readonly logoUploadConfig = DEFAULT_IMAGE_UPLOAD_CONFIG;
	public readonly bannerUploadConfig = DEFAULT_IMAGE_UPLOAD_CONFIG;
	public fieldErrors: BrandFieldErrors = createEmptyFieldErrorsBrand();

	constructor(
		private brandService: BrandService,
		private _route: ActivatedRoute
	) {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.cancelContext$.complete();
	}

	ngOnInit() {
		(this._route.parent ?? this._route).params.pipe(takeUntil(this.destroy$)).subscribe({
			next: (next) => {
				this.id = next['id'];
				this.initData();
			},
			error: (error) => {},
		});
	}

	initData() {
		const contextVersion = ++this.contextVersion;
		this.cancelContext$.next();
		const brandId = this.id;
		const isCurrentContext = () => contextVersion === this.contextVersion && brandId === this.id;
		this.brand = createEmptyBrand();
		this.fieldErrors = createEmptyFieldErrorsBrand();
		this.validationBrandError = { logoUrl: [], bannerUrl: [] };
		this.logoUrlEdit = '';
		this.bannerUrlEdit = '';
		this.isUpdateBrandLoading = false;
		this.isBrandLoading = true;
		this.brandLoadError = null;
		this.brandService
			.getBrand(brandId)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.cancelContext$),
				takeUntil(this.destroy$),
				finalize(() => {
					if (isCurrentContext()) this.isBrandLoading = false;
				})
			)
			.subscribe({
				next: (next: GetBrandRESI) => {
					if (!isCurrentContext()) return;
					this.brand = next.data;
					this.logoUrlEdit = this.brand.logoUrl ? `${environment.s3_public_url}/brands/small/${this.brand.logoUrl}` : '';
					this.bannerUrlEdit = this.brand.bannerUrl ? `${environment.s3_public_url}/brands/small/${this.brand.bannerUrl}` : '';
					this.brand.bannerUrl = undefined;
					this.brand.logoUrl = undefined;
				},
				error: (err: HttpErrorResponse) => {
					if (!isCurrentContext()) return;
					const error = getHttpErrorBody(err);
					this.brandLoadError = error;
				},
			});
	}

	updateBrand() {
		if (!this.id || this.brand.id !== this.id || this.isBrandLoading || this.brandLoadError || this.isUpdateBrandLoading) return;
		const brandId = this.id;
		const contextVersion = this.contextVersion;
		const isCurrentContext = () => contextVersion === this.contextVersion && brandId === this.id;
		this.isUpdateBrandLoading = true;
		this.brandService
			.updateBrand(brandId, { ...this.brand })
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.cancelContext$),
				takeUntil(this.destroy$),
				finalize(() => {
					if (isCurrentContext()) this.isUpdateBrandLoading = false;
				})
			)
			.subscribe({
				next: (next: UpdateBrandRESI) => {
					if (!isCurrentContext()) return;
					this.fieldErrors = createEmptyFieldErrorsBrand();
					this.brand = next.data;
					this.logoUrlEdit = next.data.logoUrl ? `${environment.s3_public_url}/brands/small/${next.data.logoUrl}` : '';
					this.bannerUrlEdit = next.data.bannerUrl ? `${environment.s3_public_url}/brands/small/${next.data.bannerUrl}` : '';
					this.brand.bannerUrl = undefined;
					this.brand.logoUrl = undefined;
					toastr.success(next.message);
					this.validationBrandError = {};
				},
				error: (err: HttpErrorResponse) => {
					if (!isCurrentContext()) return;
					const error = getHttpErrorBody(err);
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.validationBrandError = error.validation;
						this.fieldErrors = buildShowErrors(this.fieldErrors, this.validationBrandError);
					}
				},
			});
	}

	handleValidationError(event: any, type: string) {
		if (type == 'banner') {
			this.validationBrandError.bannerUrl = [];
			if (event) this.validationBrandError.bannerUrl[0] = event;
		} else if (type == 'logo') {
			this.validationBrandError.logoUrl = [];
			if (event) this.validationBrandError.logoUrl[0] = event;
		}
		this.fieldErrors = buildShowErrors(this.fieldErrors, this.validationBrandError);
	}
}
