export const PAGINATION_LIMITS: number[] = [10, 25, 50];

export const pageLimit = PAGINATION_LIMITS.map((value) => ({
	name: String(value),
	value,
}));
