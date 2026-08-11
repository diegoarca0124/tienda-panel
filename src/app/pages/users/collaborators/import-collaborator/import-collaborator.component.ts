import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { CollaboratorService } from '@app/services/collaborator.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { UploadFileImportComponent } from '@app/shared/upload-file-import/upload-file-import.component';
import { NgbPopover, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgClearButtonTemplateDirective } from '@ng-select/ng-select';
import { finalize, Subject, takeUntil } from 'rxjs';
import * as XLSX from 'xlsx-js-style';
import { fieldImportOptions } from '../constants/selectors.constants';
import { ExportCollaboratorsXlsxUtil } from '../utils/export-collaborators-xlsx.util';
import { ImportInterface } from '../interfaces/validation.interface';

declare const toastr: any;

interface ImportColumn {
  index: number;
  key: string;
  label: string;
  inputType: string;
  inputValues: any[] | undefined;
}

@Component({
  selector: 'app-import-collaborator',
  imports: [
    AlertComponent,
    CommonModule,
    FormsModule,
    NgbPopover,
    NgbTooltipModule,
    NgClearButtonTemplateDirective,
    NotFoundComponent,
    RouterModule,
    SidebarComponent,
    TopbarComponent,
    UploadFileImportComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './import-collaborator.component.html',
  styleUrl: './import-collaborator.component.css',
})
export class ImportCollaboratorComponent implements OnDestroy {
  public importConfiguration: ImportInterface = {
    file: undefined,
    mode: 'upsert',
    identifyBy: 'number_document',
  };
  public importValidationErrors: any = {
    file: [],
  };
  
  public importedRows: any[] = [];
  public importedColumns: ImportColumn[] = [];
  public isFileLoading = false;
  public availableFields = fieldImportOptions.map(({ index, key, label, inputType, inputValues }) => ({
    index,
    key,
    label,
    inputType,
    inputValues,
    status: false,
  }));
  public dataValidationErrors: any = { data: [] };
  public selectedRowIndexes: number[] = [];
  public isMappingColumns = false;
  public draggedColumnIndex: number | null = null;
  public dragOverColumnIndex: number | null = null;
  public validationSummary = { total: 0, errors: 0 };
  public isImportLoading = false;
  public validationSucceeded = false;
  public isImporting = false;

  private readonly destroy$ = new Subject<void>();

  constructor(private collaboratorService: CollaboratorService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(file: File | null): void {
    this.importConfiguration.file = file ?? undefined;
    if (!this.importConfiguration.file) return;

    const extension = file!.name.split('.').pop()?.toLowerCase();
    const fileReader = new FileReader();

    fileReader.onload = (event: ProgressEvent<FileReader>) => {
      const fileContent = event.target?.result;
      const workbook = extension === 'csv'
        ? XLSX.read(fileContent, { type: 'string' })
        : XLSX.read(new Uint8Array(fileContent as ArrayBuffer), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const firstWorksheet = workbook.Sheets[firstSheetName];
      const worksheetRows = XLSX.utils.sheet_to_json(firstWorksheet, { defval: '' });

      this.importedRows = worksheetRows.map((row, index) => ({
        ...(row as object),
        index: index + 1,
      }));
      this.importedColumns = Object.keys(worksheetRows[0] || {}).map((label, index) => ({
        index: index + 1,
        key: '',
        label,
        inputType: '',
        inputValues: [],
      }));
    };

    if (extension === 'csv') {
      fileReader.readAsText(this.importConfiguration.file, 'UTF-8');
      return;
    }

    fileReader.readAsArrayBuffer(this.importConfiguration.file);
  }

  hasCellError(rowIndex: number, fieldKey: string): boolean {
    const validationRows = this.dataValidationErrors?.data?.[0] || [];
    const rowErrors = validationRows.find((item: any) => item[rowIndex]);
    return !!rowErrors?.[rowIndex]?.[fieldKey];
  }

  getCellErrors(rowIndex: number, fieldKey: string): string[] {
    const validationRows = this.dataValidationErrors?.data?.[0] || [];
    const rowErrors = validationRows.find((item: any) => item[rowIndex]);
    const fieldErrors = rowErrors?.[rowIndex]?.[fieldKey];
    if (!fieldErrors) return [];
    return Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
  }

  hasFieldMapping(fieldKey: string): boolean {
    return this.importedColumns.some((column) => column.key === fieldKey);
  }

  hasImportedColumn(fieldKey: string): boolean {
    return this.importedColumns.some((column) => column.key === fieldKey);
  }

  isFieldSelected(fieldKey: string): boolean {
    return this.importedColumns.some((column) => column.key === fieldKey);
  }

  selectColumnMapping(selectedColumn: ImportColumn, event: Event, dropdownButton?: HTMLElement): void {
    const selectedFieldKey = (event.target as HTMLSelectElement).value;
    const selectedField = this.availableFields.find((field) => field.key === selectedFieldKey)!;
    const column = this.importedColumns.find((item) => item.index === selectedColumn.index)!;
    this.applyFieldToColumn(column, selectedField);

    if (dropdownButton) {
      const dropdown = (window as any).bootstrap.Dropdown.getInstance(dropdownButton)
        || new (window as any).bootstrap.Dropdown(dropdownButton);
      dropdown.hide();
    }
  }

  removeSelectedRows(): void {
    this.importedRows = this.importedRows.filter(
      (_, index) => !this.selectedRowIndexes.includes(index),
    );
    this.selectedRowIndexes = [];
  }

  addRow(): void {
    const newRow: any = {};
    this.importedColumns.forEach((column) => {
      newRow[column.label] = '';
    });
    this.importedRows.push(newRow);
  }

  removeColumn(columnIndex: number): void {
    this.importedColumns = this.importedColumns.filter(
      (column) => column.index !== columnIndex,
    );
  }

  addColumn(fieldKey: string): void {
    const importField = this.availableFields.find((field) => field.key === fieldKey)!;
    this.importedColumns.push({
      index: this.importedColumns.length + 1,
      key: fieldKey,
      label: importField.label,
      inputType: importField.inputType,
      inputValues: importField.inputValues,
    });
  }

  toggleRowSelection(event: Event, rowIndex: number): void {
    const isSelected = (event.target as HTMLInputElement).checked;

    if (isSelected && !this.selectedRowIndexes.includes(rowIndex)) {
      this.selectedRowIndexes.push(rowIndex);
      return;
    }

    if (!isSelected) {
      this.selectedRowIndexes = this.selectedRowIndexes.filter(
        (index) => index !== rowIndex,
      );
    }
  }

  startColumnDrag(columnIndex: number): void {
    this.draggedColumnIndex = columnIndex;
  }

  dragOverColumn(event: DragEvent, columnIndex: number): void {
    event.preventDefault();
    this.dragOverColumnIndex = columnIndex;
  }

  dropColumn(targetIndex: number): void {
    if (this.draggedColumnIndex === null) return;

    const draggedColumn = this.importedColumns[this.draggedColumnIndex];
    this.importedColumns.splice(this.draggedColumnIndex, 1);
    this.importedColumns.splice(targetIndex, 0, draggedColumn);
    this.draggedColumnIndex = null;
    this.dragOverColumnIndex = null;
  }

  importCollaborators(): void {
    this.validationSummary = { total: 0, errors: 0 };
    const mappedRows = this.mapRowsToSystemFields(true);
    this.isImportLoading = true;

    const importRequest = {
      data: mappedRows,
      mode: this.importConfiguration.mode,
      identifyBy: this.importConfiguration.identifyBy,
    };

    this.collaboratorService.importCollaborators(importRequest).pipe(
      takeUntil(this.destroy$),
      withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
      finalize(() => (this.isImportLoading = false)),
    ).subscribe({
      next: (response: {
        message: string;
        created: number;
        updated: number;
        ignored: number;
      }) => {
        this.validationSucceeded = true;
        this.dataValidationErrors = { data: [] };
        toastr.success(response.message);
      },
      error: (httpError) => {
        const error = httpError.error;
        toastr.error(error.message || '¡Error desconocido!');

        if (error.validation) {
          this.dataValidationErrors = error.validation;
        }

        this.validationSummary.total = this.dataValidationErrors.total[0];
        this.validationSummary.errors = this.dataValidationErrors.errors[0];
      },
    });
  }

  mapSystemField(event: Event, fieldKey: string): void {
    const columnLabel = (event.target as HTMLSelectElement).value;
    const column = this.importedColumns.find((item) => item.label === columnLabel)!;
    const field = this.availableFields.find((item) => item.key === fieldKey)!;
    this.applyFieldToColumn(column, field);
  }

  exportCollaborators(): void {
    const mappedRows = this.mapRowsToSystemFields(false);
    ExportCollaboratorsXlsxUtil(mappedRows, {
      fileName: 'EXP-COLLABORATORS',
      sheetName: 'COLLABORATORS',
    });
  }

  private applyFieldToColumn(
    column: ImportColumn,
    field: (typeof this.availableFields)[number],
  ): void {
    column.key = field.key;
    const mappedColumn = this.importedColumns.find((item) => item.key === field.key)!;
    mappedColumn.inputType = field.inputType;
    mappedColumn.inputValues = field.inputValues;
  }

  private mapRowsToSystemFields(includeRowIndex: boolean): any[] {
    return this.importedRows.map((row) =>
      Object.fromEntries(
        Object.entries(row)
          .map(([columnLabel, value]) => {
            if (includeRowIndex && columnLabel === 'index') {
              return [columnLabel, value];
            }

            const mappedColumn = this.importedColumns.find(
              (column) => column.label === columnLabel && column.key,
            );
            return mappedColumn ? [mappedColumn.key, value] : null;
          })
          .filter(Boolean) as [string, any][],
      ),
    );
  }
}