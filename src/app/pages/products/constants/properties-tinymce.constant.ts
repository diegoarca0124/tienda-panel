export const full_properties = {
	selector: '#kt_docs_tinymce_plugins',
	height: 200,
	menubar: 'file edit view insert format tools table help',
	language_url: '/plugins/tinymce/langs/es.js',
	language: 'es',
	branding: false,
	statusbar: true,

	skin_url: 'plugins/custom/tinymce/skins/ui/oxide',

	// ⭐ Estilos del contenido interno del editor
	content_css: 'plugins/custom/tinymce/skins/content/default/content.css',

	// 🔌 Plugins necesarios
	plugins: [
		'advlist',
		'autolink',
		'lists',
		'link',
		'image',
		'charmap',
		'preview',
		'anchor',
		'searchreplace',
		'visualblocks',
		'code',
		'fullscreen',
		'insertdatetime',
		'media',
		'table',
		'emoticons',
		'paste',
		'wordcount',
		'autoresize',
		'codesample',
		'hr',
		'pagebreak',
		'quickbars',
		'directionality',
		'nonbreaking',
		'help',
	],

	toolbar:
		'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | ' +
		'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
		'link image media table | emoticons hr pagebreak | removeformat | code fullscreen preview | help',

	// ✨ Estilo interno del contenido
	content_style: `
    body { font-family: Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.6; }
    h1,h2,h3,h4,h5,h6 { margin-top: 20px; color: #222; }
    img { max-width: 100%; border-radius: 6px; }
    table { border-collapse: collapse; width: 100%; }
    table, td, th { border: 1px solid #ddd; padding: 8px; }
  `,

	// 🖼 Subida de imágenes y medios
	automatic_uploads: true,
	file_picker_types: 'image media',

	file_picker_callback: (callback: any, value: any, meta: any) => {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		if (meta.filetype === 'image') input.setAttribute('accept', 'image/*');
		if (meta.filetype === 'media') input.setAttribute('accept', 'video/*');

		input.onchange = function (e: any) {
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.onload = function () {
				const base64 = reader.result as string;
				callback(base64, { title: file.name });
			};
			reader.readAsDataURL(file);
		};
		input.click();
	},

	// 🧩 Permitir pegar imágenes directamente
	paste_data_images: true,

	// 🧠 Opcional: autoguardado
	autosave_ask_before_unload: true,
	autosave_interval: '30s',

	// 🧰 Quickbars
	quickbars_insert_toolbar: 'quickimage quicktable hr pagebreak',
	quickbars_selection_toolbar: 'bold italic underline | link h2 h3 blockquote',
};

// properties-tinymce.const.ts
export const basic_properties = {
	height: 500,
	menubar: true,
	branding: false, // 🔹 quita el "Powered by Tiny"
	statusbar: true,

	// ✅ Solo plugins gratuitos
	plugins: [
		'advlist', // listas avanzadas
		'autolink', // convierte links automáticamente
		'lists', // listas
		'link', // manejo de enlaces
		'image', // imágenes base64 o por URL
		'charmap', // caracteres especiales
		'preview', // vista previa
		'anchor', // anclas internas
		'searchreplace', // buscar y reemplazar
		'visualblocks', // mostrar bloques HTML
		'code', // vista de código fuente
		'fullscreen', // pantalla completa
		'insertdatetime', // insertar fecha/hora
		'media', // videos locales o embebidos
		'table', // tablas
		'emoticons', // emojis
		'wordcount', // contador de palabras
	],

	// ✅ Barra de herramientas completa (solo gratis)
	toolbar:
		'undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | ' +
		'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
		'link image media table | emoticons charmap | removeformat | code fullscreen preview',

	// ✅ Estilos internos del editor
	content_style: `
    body { 
      font-family: Helvetica, Arial, sans-serif; 
      font-size: 15px; 
      color: #333; 
      line-height: 1.6; 
    }
    h1,h2,h3,h4,h5,h6 { margin-top: 20px; color: #222; }
    img, video { max-width: 100%; border-radius: 6px; }
    table { border-collapse: collapse; width: 100%; }
    table, td, th { border: 1px solid #ddd; padding: 8px; }
  `,

	// ✅ Subida local (base64, sin backend)
	automatic_uploads: true,
	paste_data_images: true,
	file_picker_types: 'image media',
	file_picker_callback: (callback: any, value: any, meta: any) => {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		if (meta.filetype === 'image') input.setAttribute('accept', 'image/*');
		if (meta.filetype === 'media') input.setAttribute('accept', 'video/*');

		input.onchange = function (e: any) {
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.onload = function () {
				const base64 = reader.result as string;
				callback(base64, { title: file.name });
			};
			reader.readAsDataURL(file);
		};
		input.click();
	},

	// ✅ Idioma español (copia local)
	language_url: '/plugins/tinymce/langs/es.js',
	language: 'es',
};
