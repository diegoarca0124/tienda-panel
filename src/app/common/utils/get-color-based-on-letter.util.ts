export const getColorBasedOnLetter = (name: string) => {
	const firstLetter = name.charAt(0).toLowerCase();

	// Define un array con los colores disponibles
	const colors = [
		'bg-light-primary text-primary border-primary',
		'bg-light-secondary text-gray-500 border-secondary',
		'bg-light-success text-success  border-success',
		'bg-light-danger text-danger border-danger',
		'bg-light-warning text-warning  border-warning',
		'bg-light-info text-info border-info',
	];

	// Convertir la primera letra a su código ASCII y asignar un color basado en el rango
	const letterCode = firstLetter.charCodeAt(0);

	// Aquí definimos los rangos de letras para cada color
	if (letterCode >= 97 && letterCode <= 101) {
		// A - E
		return colors[0]; // bg-primary
	} else if (letterCode >= 102 && letterCode <= 106) {
		// F - J
		return colors[1]; // bg-secondary
	} else if (letterCode >= 107 && letterCode <= 111) {
		// K - O
		return colors[2]; // bg-success
	} else if (letterCode >= 112 && letterCode <= 116) {
		// P - T
		return colors[3]; // bg-danger
	} else if (letterCode >= 117 && letterCode <= 121) {
		// U - Y
		return colors[4]; // bg-warning
	} else {
		return colors[5]; // bg-info (para Z o caracteres especiales)
	}
};
