import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { UploadImagesComponent } from '@app/shared/upload-images/upload-images.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProductInterface } from '../../interfaces/product.interface';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { ProductService } from '@app/services/product.service';
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';
import { environment } from 'environments/environment.dev';
import { GLOBAL } from '@app/services/GLOBAL';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { IconAlertComponent } from '@app/icons/icon-alert/icon-alert.component';
declare var toastr: any;

@Component({
	selector: 'app-gallery-create-product',
	imports: [CommonModule, NgSelectModule, FormsModule, UploadImagesComponent, AlertComponent, ValidationPopoverComponent, NotFoundComponent, IconAlertComponent],
	templateUrl: './gallery-create-product.component.html',
	styleUrl: './gallery-create-product.component.css',
})
export class GalleryCreateProductComponent {
	@Input({ required: true }) product!: ProductInterface;
	@Input({ required: true }) errorsProduct!: any;
	@Input() images: any[] = [];
	@Input() showErrors: any = {};
	@Input() id: string = '';
	public loadPhotos: boolean = true;
	public errorMsmSeverListPhotos: string = '';
	private destroy$ = new Subject<void>();

	public loadDeletePhoto: boolean = false;
	public idSelectDeletePhoto: string = '';
	public loadUploadPhotos: boolean = false;

	public loadSetCoverPhoto: boolean = false;
	public idSelectUpdateCover: string = '';

	public loadSetMiniaturePhoto: boolean = false;
	public idSelectUpdateMiniature: string = '';

	constructor(private productService: ProductService) {}

	ngOnInit() {
		if (this.id) {
			this.init_photos();
		} else {
			this.loadPhotos = false;
		}
	}

	onSelectFiles(event: any) {
		if (!this.id) {
			this.onUploadFileOnCreate(event);
		} else {
			this.onUploadFileOnEdit(event);
		}
	}

	onUploadFileOnCreate(event: any) {
		this.images.push(...event);
		this.images.forEach((element, index) => {
			element.index = index;
		});
	}

	onUploadFileOnEdit(images: any) {
		const formData = new FormData();
		formData.append('productId', this.id);
		images.forEach((file: { file: File; preview: string; index: number }) => {
			formData.append('gallery', file.file);
		});

		this.loadUploadPhotos = true;
		this.productService
			.upload_images_product(formData)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.loadUploadPhotos = false))
			)
			.subscribe({
				next: (next: { data: any; message: string }) => {
					console.log(next);

					const lastIndex = this.images.length ? Math.max(...this.images.map((x) => x.index)) : 0;
					const news = next.data.map((item: any, i: any) => ({
						...item,
						preview: `${environment.s3_public_url}/products/medium/${item.url}?v=${Date.now()}`,
						index: lastIndex + i + 1,
					}));
					console.log(news);

					this.images = [...this.images, ...news];
					toastr.success(next.message);
				},
				error: (err) => {
					toastr.error(err.error.message);
				},
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	init_photos() {
		this.init_photos$().pipe(takeUntil(this.destroy$)).subscribe();
	}

	init_photos$() {
		this.loadPhotos = true;
		this.errorMsmSeverListPhotos = '';
		this.images = [];
		return this.productService.get_photos_product(this.id).pipe(
			tap((data) => {
				console.log(data);

				this.images = data.map((photo: any, index: any) => ({
					...photo,
					preview: `${environment.s3_public_url}/products/medium/${photo.url}`,
					index,
				}));
				console.log(this.images);
			}),

			catchError((err) => {
				this.errorMsmSeverListPhotos = err?.error?.message || 'Error cargando fotos';
				return of([]);
			}),
			finalize(() => (this.loadPhotos = false))
		);
	}

	onSelectedCover(image: { file: File; preview: string; index: number }) {
		this.product.cover = image.file.name;
	}

	onSelectedMiniature(image: { file: File; preview: string; index: number }) {
		this.product.miniature = image.file.name;
	}

	removeImage(idx: number) {
		this.images.splice(idx, 1);
	}

	onRemovePhoto(id: string) {
		this.loadDeletePhoto = true;
		this.idSelectDeletePhoto = id;
		this.productService
			.delete_image_product(this.idSelectDeletePhoto)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadDeletePhoto = false))
			)
			.subscribe({
				next: (next: { data: any; message: string }) => {
					console.log(next);
					this.images = this.images.filter((item) => item.id !== next.data.id);
					toastr.success(next.message);
				},
				error: (err) => {
					toastr.error(err.error.message);
				},
			});
	}

	onUpdateCover(id: string, cover: string) {
		this.loadSetCoverPhoto = true;
		this.idSelectUpdateCover = id;
		this.productService
			.set_cover_product(this.id, { cover })
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadSetCoverPhoto = false))
			)
			.subscribe({
				next: (next: { data: any; message: string }) => {
					console.log(next);
					this.product.cover = next.data.cover;
					toastr.success(next.message);
				},
				error: (err) => {
					toastr.error(err.error.message);
				},
			});
	}

	onUpdateMiniature(id: string, miniature: string) {
		this.loadSetMiniaturePhoto = true;
		this.idSelectUpdateMiniature = id;
		this.productService
			.set_miniature_product(this.id, { miniature })
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadSetMiniaturePhoto = false))
			)
			.subscribe({
				next: (next: { data: any; message: string }) => {
					console.log(next);
					this.product.miniature = next.data.miniature;
					toastr.success(next.message);
				},
				error: (err) => {
					toastr.error(err.error.message);
				},
			});
	}

	getImagesSelected() {
		return this.images;
	}
}
