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
import { BrandInterface } from '../interfaces/brand.interface';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { showErrorsBrand } from '../constants/show-errors-brand.constant';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { createEmptyBrand } from '../utils/empties.util';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
import { HttpErrorResponse } from '@angular/common/http';
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
	public brand: BrandInterface = createEmptyBrand();
	public croppedImage: string | null = null;
	public countries = countries;
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public msmErrorBrand: any = [];
	public errorsBrand: any = {
		logoUrl: [],
		bannerUrl: [],
	};
	public prefixMask = {
		mask: /^[A-Z]{0,3}$/,
		prepare: (str: string) => str.toUpperCase(),
	};
	public showErrors = showErrorsBrand;

	constructor(
		private brandService: BrandService,
		private _router: Router
	) {}

	ngOnInit() {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	setErrorLogo(event: any) {
		if (event) {
			this.errorsBrand.logoUrl[0] = event;
		}
	}

	setErrorBanner(event: any) {
		if (event) {
			this.errorsBrand.bannerUrl[0] = event;
		}
	}

	create() {
		this.loadBtn = true;
		this.msmErrorBrand = [];
		this.brandService
			.create_brand(this.brand)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next: { data: BrandInterface; message: string }) => {
					this.errorsBrand = {
						logoUrl: [],
						bannerUrl: [],
					};
					toastr.success(next.message);
					this._router.navigate(['/products/brands']);
				},
				error: (err: HttpErrorResponse) => {
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
						this.showErrors = buildShowErrors(this.showErrors, this.errorsBrand);
					}
				},
			});
	}
}
