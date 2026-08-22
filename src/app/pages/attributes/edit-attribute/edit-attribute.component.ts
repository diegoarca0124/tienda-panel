import { CommonModule } from '@angular/common';
import { Attribute, Component, CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { IconCheckComponent } from '@app/icons/icon-check/icon-check.component';
import { AttributeService } from '@app/services/attribute.service';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { catchError, finalize, forkJoin, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { AttributeInterface } from '../interfaces/attribute.interface';
import { createEmptyAttribute } from '../utils/empties.util';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { closeModal } from '@app/common/utils/close-modal.util';
import { showErrorsAttribute } from '../constants/show-errors-attribute.constant';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
declare const toastr: any;

@Component({
	selector: 'app-edit-attribute',
	imports: [
		TopbarComponent,
		SidebarComponent,
		CommonModule,
		FormsModule,
		RouterModule,
		NgSelectModule,
		IconCheckComponent,
		NotFoundComponent,
		AlertComponent,
		ModalDeleteComponent,
		ValidationPopoverComponent,
		TextareaAutoresizeDirective,
	],
	templateUrl: './edit-attribute.component.html',
	styleUrl: './edit-attribute.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditAttributeComponent {
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public errorsAtribute: any = {};
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public loadValueBtn = false;
	public attribute: AttributeInterface = createEmptyAttribute();
	public msmErrorAttribute: any = [];
	public loading: boolean = true;
	public loadingValues: boolean = true;
	public values: Array<{ id: string; value: string }> = [];
	public value: string = '';
	public id: string = '';
	public idAttribute: string = '';
	public showErrors = showErrorsAttribute;
	public errorMsmServerGetAttribute: string = '';

	constructor(
		private _route: ActivatedRoute,
		private attributeService: AttributeService,
		private categoryService: CategoryService
	) {}

	ngOnInit() {
		this._route.params
			.pipe(
				takeUntil(this.destroy$),
				switchMap((params) => {
					this.id = params['id'];
					this.idAttribute = params['idAttribute'];
					this.loading = true;
					this.loadingValues = true;
					return forkJoin({
						next: this.attributeService.get_attribute(this.idAttribute),
						values: this.attributeService.get_values_attribute(this.idAttribute),
					}).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						finalize(() => {
							this.loading = false;
							this.loadingValues = false;
						})
					);
				})
			)
			.subscribe({
				next: ({ next, values }: any) => {
					this.attribute = next.data;
					this.values = values.data;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerGetAttribute = error;
				},
			});
	}

	init_values(id: string) {
		this.loadingValues = true;
		this.attributeService
			.get_values_attribute(id)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadingValues = false))
			)
			.subscribe({
				next: (next) => {
					console.log(next);
					this.values = next;
					this.loadingValues = false;
				},
				error: (err) => {
					const error = err.error;
				},
			});
	}

	add() {
		this.loadValueBtn = true;
		this.errorsAtribute.value = '';
		let val = this.value && this.attribute.unit ? this.value + this.attribute.unit : this.value;
		this.attributeService
			.add_value_attribute({
				value: val,
				attributeId: this.idAttribute,
			})
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadValueBtn = false))
			)
			.subscribe({
				next: (next: { data: any; message: boolean }) => {
					console.log(next);

					this.values.push(next.data);
					this.value = '';
					toastr.success(next.message);
				},
				error: (err) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');
					if (error.validation) {
						this.errorsAtribute = error.validation;
					}
				},
			});
	}

	update() {
		this.loadBtn = true;
		if (!this.attribute.unit) delete this.attribute.unit;
		this.msmErrorAttribute = '';

		this.attributeService
			.update_attribute(this.idAttribute, this.attribute)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next: { data: any; message: boolean }) => {
					console.log(next.data);

					this.errorsAtribute = {};
					this.attribute = next.data;
					toastr.success(next.message);
				},
				error: (err) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.errorsAtribute = error.validation;
						this.msmErrorAttribute = Object.values(this.errorsAtribute).flat();
						this.showErrors = buildShowErrors(this.showErrors, this.errorsAtribute);
						this.showErrors.value = true;
					}
				},
			});
	}

	onDeleteValue(id: string) {
		this.loadBtnDelete.set(true);
		this.attributeService
			.delete_value_attribute(id)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnDelete.set(false))
			)
			.subscribe({
				next: (next: { data: any; message: string }) => {
					this.values = this.values.filter((item) => item.id != id);
					toastr.success(next.message);
					closeModal('modalDelete-' + id);
				},
				error: (error: any) => {
					toastr.error(error.error.message);
				},
			});
	}
}
