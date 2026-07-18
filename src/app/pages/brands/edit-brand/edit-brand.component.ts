import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { countries } from '@app/common/constants/countries.constant';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { BrandService } from '@app/services/brand.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { UploadImageComponent } from '@app/shared/upload-image/upload-image.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { IMaskModule } from 'angular-imask';
import { finalize, Subject, takeUntil } from 'rxjs';
import { BrandInterface } from '../interfaces/brand.interface';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { showErrorsBrand } from '../constants/show-errors-brand.constant';
import { environment } from 'environments/environment.dev';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
import { HttpErrorResponse } from '@angular/common/http';
declare const toastr: any;
declare const $: any;

@Component({
	selector: 'app-edit-brand',
	imports: [TopbarComponent, SidebarComponent, CommonModule, FormsModule, RouterModule, NgSelectModule, UploadImageComponent, NotFoundComponent, AlertComponent, IMaskModule, ValidationPopoverComponent, TextareaAutoresizeDirective],
	templateUrl: './edit-brand.component.html',
	styleUrl: './edit-brand.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditBrandComponent {
	public brand: BrandInterface = {
		name: '',
		prefix: '',
		description: '',
		country: null,
		websiteUrl: '',
		logoUrl: undefined as File | undefined,
		bannerUrl: undefined as File | undefined,
	};
	public croppedImage: string | null = null;
	public countries = countries;
	private destroy$ = new Subject<void>();
	public msmErrorBrand: any = [];
	public loadBtn = false;
	public id: string = '';
	public loading = true;
	public errorMsmServerGetBrand: string = '';
	public logoUrlEdit: any = '';
	public bannerUrlEdit: any = '';
	public errorsBrand: any = {
		logoUrl: [],
		bannerUrl: [],
	};
	public prefixMask = {
		mask: /^[A-Z]{0,3}$/,
		prepare: (str: string) => str.toUpperCase()
	};
	public showErrors = showErrorsBrand;

	constructor(
		private brandService: BrandService,
		private _route: ActivatedRoute
	) {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnInit() {
		this._route.params.pipe(takeUntil(this.destroy$)).subscribe({
			next: (next) => {
				this.id = next['id'];
				this.init_data();
			},
			error: (error) => {},
		});
	}

	init_data() {
		this.loading = true;
		this.errorMsmServerGetBrand = '';
		this.brandService
			.get_brand(this.id)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: {data: BrandInterface, message: string}) => {
					this.brand = next.data;
					this.logoUrlEdit = `${environment.s3_public_url}/brands/small/${this.brand.logoUrl}`;
					this.bannerUrlEdit = `${environment.s3_public_url}/brands/small/${this.brand.bannerUrl}`;
					this.brand.bannerUrl = undefined;
					this.brand.logoUrl = undefined;
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.errorMsmServerGetBrand = error;
				},
			});
	}

	update() {
		this.loadBtn = true;
		this.msmErrorBrand = [];
		this.errorsBrand = {
			logoUrl: [],
			bannerUrl: [],
		};
		console.log(this.brand);
		
		this.brandService
			.update_brand(this.id, this.brand)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next: { data: BrandInterface, message: string}) => {
					this.brand = next.data;
					this.logoUrlEdit = `${environment.s3_public_url}/brands/small/${next.data.logoUrl}`;
					this.bannerUrlEdit = `${environment.s3_public_url}/brands/small/${next.data.bannerUrl}`;
					this.brand.bannerUrl = undefined;
					this.brand.logoUrl = undefined;
					this.loadBtn = false;
					toastr.success(next.message);
					this.errorsBrand = {
						logoUrl: [],
						bannerUrl: [],
					};
				},
				error: (err: HttpErrorResponse) => {
					console.log(err);
					
					this.errorsBrand = {
						logoUrl: [],
						bannerUrl: [],
					};
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.errorsBrand = {
							...this.errorsBrand,
							...error.validation,
						};
						this.msmErrorBrand = Object.values(this.errorsBrand).flat();
						for (const key in this.showErrors) {
							this.showErrors[key as keyof typeof this.showErrors] =
							!!this.errorsBrand?.[key]?.length;
						}
					}	
				},
			});
	}

	handleValidationError(event: any, type: string) {
		if (type == 'banner') {
			this.errorsBrand.bannerUrl = [];
			if (event) this.errorsBrand.bannerUrl[0] = event;
		} else if (type == 'logo') {
			this.errorsBrand.logoUrl = [];
			if (event) this.errorsBrand.logoUrl[0] = event;
		}
	}
}
