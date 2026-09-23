import { saveAs } from 'file-saver';

export interface ExportCsvOptions {
	fileName?: string;
}

const sanitizeCsvCell = (value: unknown): string => {
	const text = String(value ?? '');

	// Excel puede evaluar como fórmula el contenido de una celda CSV aunque esté
	// entre comillas. El apóstrofo fuerza su interpretación como texto.
	return /^(?:[\t\r\n]|\s*[=+\-@])/.test(text) ? `'${text}` : text;
};

export const ExportCollaboratorsCsvUtil = (data: any[], options?: ExportCsvOptions) => {
	if (!data?.length) {
		return;
	}

	const { fileName = 'EXPORT' } = options || {};

	const formattedData = data.map((item) => {
		const formattedItem = {
			...item,
		};

		if ('status' in item) {
			formattedItem.status = item.status === true ? 'ACTIVO' : item.status === false ? 'INACTIVO' : item.status;
		}

		return formattedItem;
	});

	const headers = Object.keys(formattedData[0]).map((header) => header.toUpperCase());

	const rows = formattedData.map((row) => {
		return Object.values(row)
			.map((value: unknown) => {
				if (value === null || value === undefined) {
					return '';
				}

				const escaped = sanitizeCsvCell(value).replace(/"/g, '""');

				return `"${escaped}"`;
			})
			.join(',');
	});

	const csvContent = [headers.join(','), ...rows].join('\n');

	const BOM = '\uFEFF';

	const blob = new Blob([BOM + csvContent], {
		type: 'text/csv;charset=utf-8;',
	});

	saveAs(blob, `${fileName}-${Date.now()}.csv`);
};
