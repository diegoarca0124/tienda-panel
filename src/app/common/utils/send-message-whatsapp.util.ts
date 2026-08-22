export const sendWhatsAppMessageWithObject = (object: any) => {
	const message = `
    Nombres: ${object.names || 'No disponible'}
    Apellidos: ${object.surname || 'No disponible'}
    Correo Electrónico: ${object.email || 'No disponible'}
    Rol: ${object.role || 'No disponible'}
    Estado: ${object.status ? 'Activo' : 'Inactivo'}
      `;

	const formattedMessage = message
		.replace(/^\s+|\s+$/g, '')
		.replace(/\n\s+/g, '\n')
		.trim();
	const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(formattedMessage)}`;

	// Abrimos la ventana para compartir por WhatsApp
	window.open(whatsappUrl, '_blank');
};
