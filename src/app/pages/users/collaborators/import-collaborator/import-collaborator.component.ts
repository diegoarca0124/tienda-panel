import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { UploadFileImportComponent } from '@app/shared/upload-file-import/upload-file-import.component';
import { SettingsImport } from '../interfaces/settings-import.interface';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx-js-style';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { fieldsExportCollaborator } from '../constants/fieldsExportCollaborator.constant';
import { fieldsImportCollaborator } from '../constants/fieldsImportCollaborator.constant';
import { CollaboratorService } from '@app/services/collaborator.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { NgClearButtonTemplateDirective } from "@ng-select/ng-select";
import { NgbPopover, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ExportCollaboratorsXlsxUtil } from '../utils/export-collaborators-xlsx.util';
declare const toastr:any;

@Component({
  selector: 'app-import-collaborator',
  imports: [
    AlertComponent,
    TopbarComponent,
    SidebarComponent,
    RouterModule,
    UploadFileImportComponent,
    CommonModule,
    FormsModule,
    NotFoundComponent,
    NgClearButtonTemplateDirective,
    NgbTooltipModule,
    NgbPopover
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './import-collaborator.component.html',
  styleUrl: './import-collaborator.component.css'
})
export class ImportCollaboratorComponent {
products = [
    { name: 'Producto Premium' },
    { name: 'Producto Gold' },
    { name: 'Producto Enterprise' }
];
  public settings : SettingsImport = {
    file: undefined,
    mode: 'upsert',
    identifyBy: 'number_document',
  }
  public errorsSettings : any = {
    file: []
  };
  public loadBtn : boolean = false;
  private destroy$ = new Subject<void>();
  public importData : Array<any> = [];
  public importKeys : Array<any> = [];
  public loadData : boolean = false;
  public importFields = fieldsImportCollaborator.map(({ index ,key, label, inputType, inputValues }) => ({
    index,
    key,
    label,
    inputType,
    inputValues,
    status: false,
  }));
  public errorsCollaborator: any = {
    data: []
  };
	public msmErrorCollaborator: any = [];
  public missingColumns: any = [];
  public selectedIndexes : number[] = [];
  public loadBtnMapColummns : boolean = false;
  public draggedColumnIndex: number | null = null;
  public dragOverIndex: number | null = null;
  public errorsValidation : { total: number, errors: number} = {
    total: 0,
    errors: 0
  };
  public loadBtnValidate : boolean = false;
  public validateStatus : boolean = false;
  public loadBtnImport : boolean = false;
  
  constructor(
    private colaboratorService: CollaboratorService
  ){

  }

  ngOnInit(){

  }

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

  onFileSelected(file: File | null) {
    this.settings.file = file ?? undefined;

    if (!this.settings.file) return;
    const extension = file!.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = (e: any) => {
      let workbook;
      if (extension === 'csv') {
        const text = e.target.result;

        workbook = XLSX.read(text, {
          type: 'string'
        });
      } else {
        const data = new Uint8Array(e.target.result);
        workbook = XLSX.read(data, { type: 'array' });
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      this.importData = jsonData;
      this.importData = this.importData.map((prev, index)=>({...prev,index: index +1}));
      
      
      this.importKeys = Object.keys(jsonData[0] || {}).map((label, index) => ({
        index: index + 1,
        key: '',
        label: label, 
        inputType: '',
        inputValues: []
      })); 
    };
    console.log(this.importKeys);
    
    if (extension === 'csv') {
      reader.readAsText(this.settings.file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(this.settings.file);
    }
  }

  hasCellError(i: number, field: string): boolean {
    const rows = this.errorsCollaborator?.data?.[0] || [];
    const found = rows.find((item: any) => item[i]);
    return !!found?.[i]?.[field];
  }

  hasMapping(key: string): boolean {
    return this.importKeys?.some(col => col.key === key);
  }

  hasColumn(key: string): boolean {
    return this.importKeys.some(prev => prev.key === key);
  }
  
  getCellError(i: number, field: string): string[] {
    const rows = this.errorsCollaborator?.data?.[0] || [];
    const found = rows.find((item: any) => item[i]);
    const errors = found?.[i]?.[field];
    if (!errors) return [];
    return Array.isArray(errors) ? errors : [errors];
  }

  isFieldSelected(key: string): boolean {
    return this.importKeys.some(ik => ik.key === key);
  }

  onSelectMapping(selectedColumn: any, event: any, dropdownBtn?: HTMLElement) {
    const itemField = this.importFields.find(item=> item.key == event.target.value);
    this.importKeys.find(item=> item.index == selectedColumn!.index).key = itemField!.key;
    this.importKeys.find(item=> item.key == itemField!.key).inputType = itemField!.inputType;
    this.importKeys.find(item=> item.key == itemField!.key).inputValues = itemField!.inputValues;
    console.log(this.errorsCollaborator);
    
    if(dropdownBtn){
      const dropdown = (window as any).bootstrap.Dropdown.getInstance(dropdownBtn)
      || new (window as any).bootstrap.Dropdown(dropdownBtn);
      dropdown.hide();
    }
  }

  onRemove(){
    this.importData = this.importData.filter(
      (_, index) => !this.selectedIndexes.includes(index)
    );
    this.selectedIndexes = [];
  }

  onAdd(){
    const newRow: any = {};
    this.importKeys.forEach(element => {
      newRow[element.label] = '';
    });
    this.importData.push(newRow);
  }

  onRemoveColumn(index: string){
    this.importKeys = this.importKeys.filter(item => item.index !== index);
  }

  onAddColumn(key: string){
    let importField = this.importFields.find(prev => prev.key == key);
    this.importKeys.push({
      index: this.importKeys.length + 1,
      key: key,
      label: importField!.label, 
      inputType: importField?.inputType,
      inputValues: importField?.inputValues
    }); 
  }

  onCheckboxChange(event: any, index: number) {
    if (event.target.checked) {
      if (!this.selectedIndexes.includes(index)) {
        this.selectedIndexes.push(index);
      }
    } else {
      this.selectedIndexes = this.selectedIndexes.filter(i => i !== index);
    }
  }

  onDragStart(index: number) {
    this.draggedColumnIndex = index;
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    this.dragOverIndex = index;
  }

  onDrop(targetIndex: number) {
    if (this.draggedColumnIndex === null) return;
    const draggedItem = this.importKeys[this.draggedColumnIndex];
    this.importKeys.splice(this.draggedColumnIndex, 1);
    this.importKeys.splice(targetIndex, 0, draggedItem);
    this.draggedColumnIndex = null;
    this.dragOverIndex = null;
  }

  validate(){
    this.errorsValidation.total = 0;
    this.errorsValidation.errors = 0; 
    this.missingColumns = [];
    const mappedData = this.importData.map(item =>
      Object.fromEntries(
        Object.entries(item)
          .map(([key, value]) => {
            if (key === 'index') {
              return [key, value];
            }
            const match = this.importKeys.find(
              f => f.label === key && f.key
            );
            return match ? [match.key, value] : null;
          })
          .filter(Boolean) as [string, any][]
      )
    );
    console.log(mappedData);
    
    const importFieldKeys = this.importFields.map(x => x.key);
    const importKeyKeys = this.importKeys.map(x => x.key);
    const missingCount = importFieldKeys.filter(
      key => !importKeyKeys.includes(key)
    ).length;
    this.loadBtnValidate = true;
    let importBody = {
      data : mappedData,
      mode: this.settings.mode,
      identifyBy: this.settings.identifyBy
    }
    this.colaboratorService.validate_import_collaborators(importBody)
    .pipe(
      takeUntil(this.destroy$),
      withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
      finalize(() => (this.loadBtnValidate = false))
    )
    .subscribe({
      next: (next: {message: string, created: number, updated: number, ignored: number}) => {
        this.validateStatus = true;
        this.errorsCollaborator = {
          data: []
        };
        toastr.success(next.message);
      },
      error: (err) => {
        const error = err.error;
        toastr.error(error.message || '¡Error desconocido!');

        if (error.validation) {
          this.errorsCollaborator = error.validation;
          this.missingColumns = error.validation.missing_columns[0];
          this.msmErrorCollaborator =Object.values(this.errorsCollaborator).flat();
        }  
        this.errorsValidation.total = this.errorsCollaborator.total[0];
        this.errorsValidation.errors = this.errorsCollaborator.errors[0];
      },
    });
  }

  onMapSelect(event: Event, keySelect: string) {
    const value = (event.target as HTMLSelectElement).value;
    let key = this.importKeys.find(item=> item.label == value);
    let field = this.importFields.find(item=> item.key == keySelect);
    this.importKeys.find(item=> item.index == key!.index).key = keySelect;
    this.importKeys.find(item=> item.key == field!.key).inputType = field!.inputType;
    this.importKeys.find(item=> item.key == field!.key).inputValues = field!.inputValues;
  }

  export(){
    const mappedData = this.importData.map(item =>
      Object.fromEntries(
        Object.entries(item)
          .map(([key, value]) => {

            const match = this.importKeys.find(
              f => f.label === key && f.key
            );

            return match ? [match.key, value] : null;

          })
          .filter(Boolean) as [string, any][]
      )
    );
    console.log(mappedData);
    
    ExportCollaboratorsXlsxUtil(mappedData, {
      fileName: 'EXP-COLLABORATORS',
      sheetName: 'COLLABORATORS'
    });
  }
}

