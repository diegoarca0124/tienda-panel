import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { AttributeService } from '@app/services/attribute.service';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, forkJoin, Subject, switchMap, takeUntil } from 'rxjs';
import { AttributeInterface } from '../interfaces/attribute.interface';
import { AttributeGroupInterface } from '../interfaces/attribute-group.interface';
import { createEmptyAttribute, createEmptyGroupAttribute } from '../utils/empties.util';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { showErrorsAttribute } from '../constants/show-errors-attribute.constant';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { valuesDefault } from '../constants/values-default.constant';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
declare const toastr: any;

@Component({
	selector: 'app-create-attribute',
	imports: [
		TopbarComponent, 
		SidebarComponent, 
		CommonModule, 
		FormsModule, 
		RouterModule, 
		NgSelectModule, 
		AlertComponent,
		NotFoundComponent,
		ValidationPopoverComponent,
		TextareaAutoresizeDirective
	],
	templateUrl: './create-attribute.component.html',
	styleUrl: './create-attribute.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateAttributeComponent {
	public errorsAtribute: any = {};
	public groupAttribute: AttributeGroupInterface = createEmptyGroupAttribute();
	private destroy$ = new Subject<void>();
	public loading : boolean = true;
	public loadBtn: boolean = false;
	public id : string = '';
	public attribute: AttributeInterface = createEmptyAttribute();
	public values: Array<{ value: string }> = [];
	public value: string = '';
	public errorMsmServerGetGroupAttribute: string = '';
	public msmErrorAttribute: any = [];
	public showErrors = showErrorsAttribute;
	public valuesDefault : Array<{name?: string, value?: string}> = valuesDefault;
	public valuesDefaultSelected: string | null = null;

	constructor(
		private attributeService: AttributeService,
		private categoryService: CategoryService,
		private _router: Router,
		private _route: ActivatedRoute
	) {}

	ngOnInit() {
		this._route.params
		.pipe(
			takeUntil(this.destroy$),
			switchMap((params) => {
				this.id = params['id'];
				this.attribute.attributeGroupId = this.id;
				this.loading = true;
				this.errorMsmServerGetGroupAttribute = '';
				return forkJoin({
					groupAttribute: this.attributeService.get_attribute_group(this.id)
				}).pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loading = false ))
			})
		)
		.subscribe({
			next: ({ groupAttribute }: any) => {
				console.log(groupAttribute);
				
				this.groupAttribute = groupAttribute;
			},
			error: (err) => {
				const error = err.error;
				this.errorMsmServerGetGroupAttribute = error;
			},
		});
	}

	add() {
		delete this.errorsAtribute.values;

		let added = false;

		// Agregar valores por defecto
		if (this.valuesDefaultSelected) {
			const defaultValues = this.valuesDefaultSelected
				.split(',')
				.map(v => v.trim())
				.filter(v => v.length > 0)
				.map(v => ({ value: v }));

			this.values.push(...defaultValues);

			this.valuesDefaultSelected = null;
			added = true;
		}

		// Agregar valor manual
		if (this.value?.trim()) {
			const val = this.attribute.unit
				? `${this.value.trim()}${this.attribute.unit}`
				: this.value.trim();

			this.values.push({ value: val });

			this.value = '';
			added = true;
		}

		// Validar
		if (!added) {
			this.errorsAtribute.values = [
				'Ingrese un valor o seleccione un conjunto de valores por defecto.'
			];
		}
}

	remove(index: number) {
		if (index >= 0) {
			this.values.splice(index, 1);
		}
	}

	create() {
		this.loadBtn = true;
		this.attribute.values = this.values;
		this.msmErrorAttribute = '';
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
			next: (next: {message: string, attribute: AttributeInterface}) => {
				this.errorsAtribute = {};
				toastr.success(next.message);
				this._router.navigate([`/products/attributes/groups/${this.id}/attributes`]);
			},
			error: (err) => {
				const error = err.error;
				toastr.error(error.message || '¡Error desconocido!');
				if (error.validation) {
					this.errorsAtribute = error.validation;
					this.msmErrorAttribute = Object.values(this.errorsAtribute).flat();
					this.showErrors = buildShowErrors(this.showErrors,this.errorsAtribute);
					this.showErrors.value = true;
					
				}
			},
		});
	}
}
