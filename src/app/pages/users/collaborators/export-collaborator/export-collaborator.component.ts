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
import { FieldExportColumns } from '../interfaces/validation.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { fieldsExportOptions, sortOptions } from '../constants/selectors.constants';
declare const toastr: any;

@Component({
	selector: 'app-export-collaborator',
	imports: [CommonModule, SidebarComponent, TopbarComponent, RouterModule, FormsModule],
	templateUrl: './export-collaborator.component.html',
	styleUrl: './export-collaborator.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExportCollaboratorComponent {
	public fieldsExport: FieldExportColumns[] = fieldsExportOptions;
	public exportOptions = {
		format: 'xlsx',
		maskData: false,
		scope: 'all',
		sort: 'Predeterminado',
		data: [] as any,
		ids: [] as any,
	};
	public isExportCollaboratorLoading: boolean = false;
	public validationCollaboratioError: any = {};
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
					console.log(err);
					let errorParsed: any;
					if (err.error instanceof Blob && err.error.type === 'application/json') {
						try {
							const text = await err.error.text();
							errorParsed = JSON.parse(text);
						} catch {
							errorParsed = { message: 'Error al procesar la respuesta del servidor.' };
						}
					} else {
						errorParsed = err.error;
					}

					toastr.error(errorParsed.message || '¡Error desconocido!');

					if (errorParsed.validation) {
						this.validationCollaboratioError = errorParsed.validation;
						if (this.validationCollaboratioError.ids) {
							this.validationCollaboratioError.scope = [...(this.validationCollaboratioError.scope || []), ...this.validationCollaboratioError.ids];
						}
					}
					console.log(this.validationCollaboratioError);
				},
			});
	}
}
