import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Attribute } from '@app/common/interface/attribute.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { IconCheckComponent } from '@app/icons/icon-check/icon-check.component';
import { AttributeService } from '@app/services/attribute.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { catchError, finalize, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
declare const toastr: any;

@Component({
	selector: 'app-edit-attribute',
	imports: [TopbarComponent, SidebarComponent, CommonModule, FormsModule, RouterModule, NgSelectModule, IconCheckComponent, NotFoundComponent],
	templateUrl: './edit-attribute.component.html',
	styleUrl: './edit-attribute.component.css',
})
export class EditAttributeComponent {
	public errorsAtribute: any = {};
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public loadValueBtn = false;
	public attribute: Attribute = {
		name: '',
		code: '',
		unit: '',
		categories: [],
		values: [],
	};
	public loading: boolean = true;
	public loadingValues: boolean = true;
	public values: Array<{ value: string }> = [];
	public value: string = '';
	public id: string = '';
	public categories = [];
	public categoriesSelected: any = [];
	public errorMsmServerGetAttribute: string = '';
	public errorMsmServerGetValues: string = '';
	public errorMsmSeverListCategories: string = '';
	public errorMsmSeverListValues: string = '';
	public loadingCategories: boolean = true;

	constructor(
		private _route: ActivatedRoute,
		private attributeService: AttributeService
	) {}

	ngOnInit() {
		this._route.params.pipe(takeUntil(this.destroy$)).subscribe({
			next: (next) => {
				this.id = next['id'];
				this.init_data();
				this.init_categories();
				this.init_values(this.id);
			},
			error: (error) => {},
		});
	}

	init_data() {
		this.loading = true;
		this.errorMsmServerGetAttribute = '';
		this.attributeService
			.get_attribute(this.id)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: any) => {
					console.log(next);

					this.attribute = next;
					this.categoriesSelected = this.attribute.categories;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerGetAttribute = error;
				},
			});
	}

	init_categories() {
		this.loadingCategories = true;
		this.errorMsmSeverListCategories = '';
		this.attributeService
			.get_categories_by_select()
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadingCategories = false))
			)
			.subscribe({
				next: (next) => {
					console.log(next);
					this.categories = next;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmSeverListCategories = error;
				},
			});
	}

	init_values(id: string) {
		this.loadingValues = true;
		this.errorMsmSeverListValues = '';
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
					this.errorMsmSeverListValues = error;
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
				attributeId: this.id,
			})
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadValueBtn = false))
			)
			.subscribe({
				next: (next) => {
					this.values.push(next);
					this.value = '';
				},
				error: (err) => {
					console.log(err);

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
		this.attribute.categories = this.categoriesSelected;
		if (!this.attribute.unit) delete this.attribute.unit;
		this.attributeService
			.update_attribute(this.id, this.attribute)
			.pipe(withMinLoadingTime(GLOBAL.MIN_LOADING_TIME), takeUntil(this.destroy$))
			.subscribe({
				next: (next) => {
					this.attribute = next;
					this.categoriesSelected = this.attribute.categories;
					this.loadBtn = false;
					toastr.success('Atributo actualizado correctamente.');
					this.errorsAtribute = {};
				},
				error: (error) => {
					console.log(error);

					this.errorsAtribute = {};
					if (error.error.messages) {
						this.errorsAtribute = error.error.messages;
					} else {
						toastr.error(error.error.message);
					}
					this.loadBtn = false;
				},
			});
	}

	remove(idx: number) {}
}
