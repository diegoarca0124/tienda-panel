import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Attribute } from '@app/common/interface/attribute.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { AttributeService } from '@app/services/attribute.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, Subject, takeUntil } from 'rxjs';
declare const toastr: any;

@Component({
	selector: 'app-create-attribute',
	imports: [TopbarComponent, SidebarComponent, CommonModule, FormsModule, RouterModule, NgSelectModule],
	templateUrl: './create-attribute.component.html',
	styleUrl: './create-attribute.component.css',
})
export class CreateAttributeComponent {
	public errorsAtribute: any = {};
	private destroy$ = new Subject<void>();
	public loadBtn: boolean = false;
	public attribute: Attribute = {
		name: '',
		code: '',
		categories: [],
		values: [],
	};
	public values: Array<{ value: string }> = [];
	public value: string = '';
	public errorMsmSeverListCategories: string = '';
	public categoriesSelected = [];
	public loadingCategories: boolean = true;
	public errorMsmServer: string = '';
	public categories = [];

	constructor(
		private attributeService: AttributeService,
		private _router: Router
	) {}

	ngOnInit() {
		this.init_categories();
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

	add() {
		delete this.errorsAtribute.values;
		if (this.value) {
			let val = this.attribute.unit ? this.value + this.attribute.unit : this.value;
			this.values.push({ value: val });
			this.value = '';
		} else {
			this.errorsAtribute.values[0] = 'El valor del atributo es requerido';
		}
	}

	remove(index: number) {
		if (index >= 0) {
			this.values.splice(index, 1);
		}
	}

	create() {
		this.loadBtn = true;
		this.attribute.categories = this.categoriesSelected;
		this.attribute.values = this.values;
		if (!this.attribute.unit) delete this.attribute.unit;
		console.log(this.attribute);

		this.attributeService
			.create_attribute(this.attribute)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next) => {
					console.log(next);
					this.errorsAtribute = {};
					toastr.success('Atributo creado correctamente.');
					this._router.navigate(['/products/attributes']);
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServer = error.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);

					if (error.validation) {
						this.errorsAtribute = error.validation;
						this.errorMsmServer = '';
					}
				},
			});
	}
}
