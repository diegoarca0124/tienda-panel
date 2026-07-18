export function buildShowErrors<T extends Record<string, boolean>>(
	showErrors: T,
	errors: Record<string, any>,
): T {
	const result = { ...showErrors };

	for (const key in result) {
		result[key as keyof T] = !!errors?.[key]?.length as T[keyof T];
	}

	return result;
}