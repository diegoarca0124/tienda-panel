import { CommonModule } from '@angular/common';
import { Component, Input, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Brand } from '@app/common/interface/brand.interface';
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
declare const toastr: any;

@Component({
	selector: 'app-create-brand',
	imports: [TopbarComponent, SidebarComponent, CommonModule, FormsModule, RouterModule, NgSelectModule, UploadImageComponent, AlertComponent],
	templateUrl: './create-brand.component.html',
	styleUrl: './create-brand.component.css',
})
export class CreateBrandComponent {
	public brand: Brand = {
		name: '',
		description: '',
		country: null,
		websiteUrl: '',
		logoUrl: undefined as File | undefined,
		bannerUrl: undefined as File | undefined,
	};
	public croppedImage: string | null = null;
	public countries = countries;
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public errorMsmServer: string = '';
	public msmErrorBrand: any = [];
	public errorsBrand: any = {
		logoUrl: [],
		bannerUrl: [],
	};

	constructor(
		private brandService: BrandService,
		private _router: Router
	) {}

	ngOnInit() {
		console.log(this.errorsBrand);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	create() {
		this.loadBtn = true;
		this.errorMsmServer = '';
		this.errorsBrand = {
			logoUrl: [],
			bannerUrl: [],
		};
		this.msmErrorBrand = [];
		this.brandService
			.create_brand(this.brand)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next) => {
					this.errorsBrand = {};
					toastr.success('Marca creada correctamente.');
					this._router.navigate(['/products/brands']);
				},
				error: (err) => {
					this.errorsBrand = {
						logoUrl: [],
						bannerUrl: [],
					};
					const error = err.error;
					this.errorMsmServer = error.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);

					if (error.validation) {
						this.errorsBrand = {
							...this.errorsBrand, 
							...error.validation, 
						};
						this.msmErrorBrand = Object.values(this.errorsBrand).flat();
					}

					console.log(this.errorsBrand);
				},
			});
	}
}
