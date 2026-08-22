export function buildShowErrors<T extends object>(fields: T, validationErrors: object): T {
	const updatedFields = { ...fields };

	for (const key of Object.keys(updatedFields) as Array<keyof T>) {
		updatedFields[key] = Boolean(Object.prototype.hasOwnProperty.call(validationErrors, key)) as T[keyof T];
	}

	return updatedFields;
}
