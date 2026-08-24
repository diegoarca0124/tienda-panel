import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { FormsModule } from '@angular/forms';
import { CollaboratorService } from '@app/services/collaborator.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { finalize, Subject, takeUntil } from 'rxjs';
import { GLOBAL } from '@app/services/GLOBAL';
import { ExportCollaboratorsXlsxUtil } from '../utils/export-collaborators-xlsx.util';
import { ExportCollaboratorsCsvUtil } from '../utils/export-collaborators-csv.util';
import { FieldExportColumns, FieldExportColumnsErrors } from '../interfaces/validation.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { fieldsExportOptions, sortOptions } from '../constants/selectors.constants';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { createEmptyFieldExportErrors } from '../utils/empties.util';
declare const toastr: any;

@Component({
	selector: 'app-export-collaborator',
	imports: [CommonModule, SidebarComponent, TopbarComponent, RouterModule, FormsModule],
	templateUrl: './export-collaborator.component.html',
	styleUrl: './export-collaborator.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExportCollaboratorComponent {
	public fieldsExport: FieldExportColumns[] = fieldsExportOptions.map((field) => ({
		...field,
	}));
	public exportOptions = {
		format: 'xlsx',
		maskData: false,
		scope: 'all',
		sort: 'Predeterminado',
		data: [] as any,
		ids: [] as any,
	};
	public isExportCollaboratorLoading: boolean = false;
	public validationCollaboratorError: any = {};
	public fieldErrors: FieldExportColumnsErrors = createEmptyFieldExportErrors();
	public sortOptions = sortOptions;
	private destroy$ = new Subject<void>();

	constructor(private collaboratorService: CollaboratorService) {}

	ngOnInit() {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onExport() {
		this.exportOptions.data = this.fieldsExport.map((prev) => ({
			field: prev.key,
			checked: prev.checked,
		}));
		this.isExportCollaboratorLoading = true;
		this.exportOptions.ids = [];
		console.log(this.exportOptions);

		this.collaboratorService
			.exportCollaborators(this.exportOptions)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.isExportCollaboratorLoading = false))
			)
			.subscribe({
				next: (next: { data: any[] }) => {
					if (this.exportOptions.format === 'xlsx') {
						ExportCollaboratorsXlsxUtil(next.data, {
							fileName: 'IMP-COLLABORATORS',
							sheetName: 'COLLABORATORS',
						});
					} else if (this.exportOptions.format === 'csv') {
						ExportCollaboratorsCsvUtil(next.data, {
							fileName: 'IMP-COLLABORATORS',
						});
					} else {
						toastr.error('El formato seleccionado no es válido.');
						return;
					}
					toastr.success('Archivo generado correctamente.');
				},
				error: async (err: HttpErrorResponse) => {
					const error = err?.error ?? {};
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.validationCollaboratorError = error.validation;
						this.fieldErrors = buildShowErrors(this.fieldErrors, this.validationCollaboratorError);
					}
					console.log(this.validationCollaboratorError);
				},
			});
	}
}
