import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

export interface ExportExcelOptions {
	fileName?: string;
	sheetName?: string;
}

type ExportRow = Record<string, unknown>;

const formatCellValue = (value: unknown): unknown => {
	if (typeof value === 'boolean') return value ? 'ACTIVO' : 'INACTIVO';
	if (value instanceof Date) return value.toLocaleString();
	if (value && typeof value === 'object') return JSON.stringify(value);
	return value ?? '';
};

const calculateColumnWidth = (rows: ExportRow[], column: string): XLSX.ColInfo => {
	const contentLength = rows.reduce((maximum, row) => {
		const value = String(row[column] ?? '');
		return Math.max(maximum, value.length);
	}, column.length);

	return {
		wch: Math.min(Math.max(contentLength + 2, 10), 60),
	};
};

const sanitizeSheetName = (name: string): string => name.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'DATA';

export const ExportCollaboratorsXlsxUtil = (data: ExportRow[], options: ExportExcelOptions = {}): void => {
	if (!data.length) return;

	const { fileName = 'EXPORT', sheetName = 'DATA' } = options;

	const formattedData = data.map((row) => Object.fromEntries(Object.entries(row).map(([column, value]) => [column, column === 'status' ? formatCellValue(value) : (value ?? '')])));

	const columns = [...new Set(formattedData.flatMap((row) => Object.keys(row)))];

	const worksheet = XLSX.utils.json_to_sheet(formattedData, {
		header: columns,
	});

	worksheet['!cols'] = columns.map((column) => calculateColumnWidth(formattedData, column));

	if (worksheet['!ref']) {
		worksheet['!autofilter'] = {
			ref: worksheet['!ref'],
		};
	}

	const workbook = XLSX.utils.book_new();

	XLSX.utils.book_append_sheet(workbook, worksheet, sanitizeSheetName(sheetName));

	const excelBuffer = XLSX.write(workbook, {
		bookType: 'xlsx',
		type: 'array',
	});

	const blob = new Blob([excelBuffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	});

	saveAs(blob, `${fileName}-${Date.now()}.xlsx`);
};
