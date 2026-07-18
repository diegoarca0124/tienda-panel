import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { fieldsExportCollaborator } from '../constants/fieldsExportCollaborator.constant';
import { FormsModule } from '@angular/forms';
import { sortColumnsCollaborators } from '../constants/sortColumnsCollaborators.constant';
import { CollaboratorService } from '@app/services/collaborator.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { finalize, Subject, takeUntil } from 'rxjs';
import { GLOBAL } from '@app/services/GLOBAL';
import { ExportCollaboratorsXlsxUtil } from '../utils/export-collaborators-xlsx.util';
import { ExportCollaboratorsCsvUtil } from '../utils/export-collaborators-csv.util';
declare const toastr:any;

@Component({
  selector: 'app-export-collaborator',
  imports: [
    CommonModule,
    SidebarComponent,
    TopbarComponent,
    RouterModule,
    FormsModule
  ],
  templateUrl: './export-collaborator.component.html',
  styleUrl: './export-collaborator.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExportCollaboratorComponent {

  	public fieldsExport : Array<{key: string, checked: boolean,label: string, description: string}> = fieldsExportCollaborator;
	public exportOptions = {
		format: 'xlsx',
		maskData: false,
		scope: 'all',
		sort: 'Predeterminado',
		data: [] as any,
		ids: [] as any
	}
	public loadBtnExportCollaborators : boolean = false;
	public errorMsmServer: string = '';
	public errorsExportCollaborators: any = {};
	public msmErrorExportCollaborators: any = [];
	public sortColumns = sortColumnsCollaborators;
	private destroy$ = new Subject<void>();
  

	constructor(
		private collaboratorService: CollaboratorService
	){

	}

	ngOnInit(){

	}

  	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

  	onExport(){
		this.exportOptions.data = this.fieldsExport.map(prev => ({
			field: prev.key,
			checked: prev.checked
		}));
		this.loadBtnExportCollaborators = true;
		this.exportOptions.ids = [];
		/* if(this.exportOptions.scope == 'selected'){
			this.exportOptions.ids = [...this.selectedIds];
		}
		if(this.exportOptions.scope == 'page'){
			this.exportOptions.ids = this.collaborators.map(c => c.id);
		} */
		this.collaboratorService
			.export_collaborators(this.exportOptions)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadBtnExportCollaborators = false))
			)
			.subscribe({
				next: (next: { data: []}) => {

					if(this.exportOptions.format == "xlsx"){
						ExportCollaboratorsXlsxUtil(next.data, {
							fileName: 'IMP-COLLABORATORS',
							sheetName: 'COLLABORATORS'
						});
					}else if(this.exportOptions.format == "csv"){
						ExportCollaboratorsCsvUtil(next.data, {
							fileName: 'IMP-COLLABORATORS'
						});
					}
					toastr.success('Archivo generado correctamente.');
				},
				error: async (err) => {
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

					this.errorMsmServer = errorParsed.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);

					if (errorParsed.validation) {
						this.errorsExportCollaborators = errorParsed.validation;
						this.msmErrorExportCollaborators = Object.values(errorParsed.validation).flat();
						if (this.errorsExportCollaborators.ids) {
							this.errorsExportCollaborators.scope = [
								...(this.errorsExportCollaborators.scope || []),
								...this.errorsExportCollaborators.ids
							];
						}
					}
					console.log(this.errorsExportCollaborators);
					
				},
			});
			
	}
}
