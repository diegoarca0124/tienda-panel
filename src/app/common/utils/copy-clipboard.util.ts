export const copyToClipboard = (object: any) =>{
    // Crear una representación más legible y formateada
    const textToCopy = `
    Nombres: ${object.names || 'No disponible'}
    Apellidos: ${object.surname || 'No disponible'}
    Correo Electrónico: ${object.email || 'No disponible'}
    Rol: ${object.role || 'No disponible'}
    Estado: ${object.status ? 'Activo' : 'Inactivo'}
    `;
  
    // Eliminar saltos de línea al principio y al final
    const formattedText = textToCopy.replace(/^\s+|\s+$/g, '').replace(/\n\s+/g, '\n').trim();
  
    if (navigator.clipboard) {
      // Usamos la API moderna si está disponible
      return navigator.clipboard.writeText(formattedText)
        .then(() => true)
        .catch((err) => {
          console.error('Error al copiar al portapapeles', err);
          return false;
        });
    } else {
      // Fallback para navegadores antiguos
      const textarea = document.createElement('textarea');
      textarea.value = formattedText;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve(successful);
      } catch (err) {
        console.error('Error al copiar al portapapeles', err);
        document.body.removeChild(textarea);
        return Promise.resolve(false);
      }
    }
  }
  