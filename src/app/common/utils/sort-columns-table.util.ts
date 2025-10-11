export function sortColumnsTable<T extends Record<string, any>>(
	data: T[],
	column: string,
	sortColumn: string,
	sortDirection: 'asc' | 'desc'
): { sortedData: T[]; sortColumn: string; sortDirection: 'asc' | 'desc' } {
	let newDirection: 'asc' | 'desc' = 'asc';

	if (sortColumn === column) {
		newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
	}

	const sortedData = [...data].sort((a, b) => {
		const A = (a[column] ?? '').toString().toLowerCase();
		const B = (b[column] ?? '').toString().toLowerCase();

		if (A < B) return newDirection === 'asc' ? -1 : 1;
		if (A > B) return newDirection === 'asc' ? 1 : -1;
		return 0;
	});

	return {
		sortedData,
		sortColumn: column,
		sortDirection: newDirection,
	};
}
