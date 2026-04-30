import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { countries } from '@app/common/constants/countries.constant';
import { Brand } from '@app/common/interface/brand.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { BrandService } from '@app/services/brand.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { UploadImageComponent } from '@app/shared/upload-image/upload-image.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, Subject, takeUntil } from 'rxjs';
declare const toastr: any;
declare const $: any;

@Component({
	selector: 'app-edit-brand',
	imports: [TopbarComponent, SidebarComponent, CommonModule, FormsModule, RouterModule, NgSelectModule, UploadImageComponent, NotFoundComponent, AlertComponent],
	templateUrl: './edit-brand.component.html',
	styleUrl: './edit-brand.component.css',
})
export class EditBrandComponent {
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
	public msmErrorBrand: any = [];
	public loadBtn = false;
	public id: string = '';
	public loading = true;
	public errorMsmServerGetBrand: string = '';
	public logoUrlEdit: any = '';
	public bannerUrlEdit: any = '';
	public errorMsmServer: string = '';
	public errorsBrand: any = {
		logoUrl: [],
		bannerUrl: [],
	};

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
				next: (next: Brand) => {
					console.log(next);

					this.brand = next;
					this.logoUrlEdit = this.brand.logoUrl;
					this.bannerUrlEdit = this.brand.bannerUrl;
					this.brand.bannerUrl = undefined;
					this.brand.logoUrl = undefined;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerGetBrand = error;
				},
			});
	}

	update() {
		this.loadBtn = true;
		this.errorMsmServer = '';
		this.msmErrorBrand = [];
		this.errorsBrand = {
			logoUrl: [],
			bannerUrl: [],
		};
		this.brandService
			.update_brand(this.id, this.brand)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next: Brand) => {
					this.brand = next;
					this.logoUrlEdit = next.logoUrl;
					this.bannerUrlEdit = next.bannerUrl;
					this.brand.bannerUrl = undefined;
					this.brand.logoUrl = undefined;
					this.loadBtn = false;
					toastr.success('Marca actualizada correctamente.');
					this.errorsBrand = {
						logoUrl: [],
						bannerUrl: [],
					};
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
						this.errorMsmServer = '';
					}	
				},
			});
	}

	handleValidationError(event: any, type: string) {
		console.log(event);

		if (type == 'banner') {
			this.errorsBrand.bannerUrl = [];
			if (event) this.errorsBrand.bannerUrl[0] = event;
		} else if (type == 'logo') {
			this.errorsBrand.logoUrl = [];
			if (event) this.errorsBrand.logoUrl[0] = event;
		}
	}
}
