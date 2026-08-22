import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { VariationInterface } from '../../interfaces/variation.interface';
import { IconTrashComponent } from '@app/icons/icon-trash/icon-trash.component';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { ProductService } from '@app/services/product.service';
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { closeModal } from '@app/common/utils/close-modal.util';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { IconAlertComponent } from '@app/icons/icon-alert/icon-alert.component';
declare const toastr: any;

@Component({
	selector: 'app-variations-create-product',
	imports: [
		AlertComponent,
		CommonModule,
		FormsModule,
		IconTrashComponent,
		ValidationPopoverComponent,
		ModalDeleteComponent,
		NotFoundComponent,
		NgbTooltipModule,
		IconAlertComponent,
	],
	templateUrl: './variations-create-product.component.html',
	styleUrl: './variations-create-product.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VariationsCreateProductComponent {
	@Input({ required: true }) errorsProduct!: any;
	@Input({ required: false }) errorsVariation!: any;
	@Input() variations: VariationInterface[] = [];
	@Input({ required: true }) variation!: any;
	@Input() showErrors: any = {};
	public loadVariations: boolean = true;
	public errorMsmSeverListVariations: string = '';
	@Input() id: string = '';
	private destroy$ = new Subject<void>();
	public loadCreateVariation: boolean = false;
	public loadBtnStatus: WritableSignal<boolean> = signal(false);
	public variationEdit: any = {};
	public loadBtnUpdateName: boolean = false;

	constructor(private productService: ProductService) {}

	ngOnInit() {
		if (this.id) {
			this.init_variations();
		}
	}

	onCreateVariation() {
		this.errorsVariation = {};
		if (!this.variation.name) this.errorsVariation.name = ['El nombre de la variación es requerido.'];
		if (Object.keys(this.errorsVariation).length > 0) return;
		this.variations.push({ ...this.variation });
		this.variation.name = '';
	}

	onAddVariation() {
		this.variation.productId = this.id;
		this.loadCreateVariation = true;
		this.productService
			.create_variation_product(this.variation)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadCreateVariation = false))
			)
			.subscribe({
				next: (next: { data: any; message: string }) => {
					this.variation.name = '';
					this.variations.push({ ...next.data });
					toastr.success(next.message);
				},
				error: (err) => {
					console.log(err);

					toastr.error(err.error.message || '¡Error desconocido!');
				},
			});
	}

	onEditVariation(item: any) {
		this.variationEdit = item;
		setTimeout(() => {
			const input = document.getElementById(`variation-input-${item.id}`) as HTMLInputElement;
			input?.focus();
		});
	}

	onUpdateNameVariation() {
		this.loadBtnUpdateName = true;
		this.productService
			.update_name_variation(this.variationEdit.id, { name: this.variationEdit.name })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadBtnUpdateName = false))
			)
			.subscribe({
				next: (next: { data: VariationInterface; message: string }) => {
					this.variations = this.variations.map((prev: any) => {
						if (next.data.id === prev.id) {
							return { ...prev, name: next.data.name };
						}
						return prev;
					});
					toastr.success(next.message);
					this.variationEdit = {};
				},
				error: (error: any) => {
					toastr.error(error.error.message);
				},
			});
	}

	onRemoveVariation(idx: number) {
		this.variations.splice(idx, 1);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	init_variations$() {
		this.loadVariations = true;
		this.errorMsmSeverListVariations = '';
		this.variations = [];
		return this.productService.get_variations_product(this.id).pipe(
			tap((data) => {
				console.log(data);

				this.variations = data;
			}),
			catchError((err) => {
				this.errorMsmSeverListVariations = err?.error?.message || 'Error cargando variaciones';
				return of([]);
			}),

			finalize(() => (this.loadVariations = false))
		);
	}

	init_variations() {
		this.init_variations$().pipe(takeUntil(this.destroy$)).subscribe();
	}

	onUpdateStatus(id: string, status: boolean) {
		this.loadBtnStatus.set(true);
		this.productService
			.update_status_variation(id, { status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnStatus.set(false))
			)
			.subscribe({
				next: (next: { data: VariationInterface; message: string }) => {
					this.variations = this.variations.map((prev: any) => {
						if (next.data.id === prev.id) {
							return { ...prev, status: next.data.status };
						}
						return prev;
					});
					toastr.success(next.message);
					closeModal(id);
				},
				error: (error: any) => {
					toastr.error(error.error.message);
				},
			});
	}

	getVariationsSelected() {
		return this.variations;
	}
}
