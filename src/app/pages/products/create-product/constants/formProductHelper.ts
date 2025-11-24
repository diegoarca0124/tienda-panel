export const productFormHelp = {
  name: "Nombre completo del producto tal como se mostrará al cliente. Debe ser claro y descriptivo.",
  type: "Tipo de producto: Físico, Digital o Servicio. Afecta inventario y envío.",
  slug: "Identificador único en la URL. No debe tener espacios. Se genera a partir del nombre.",
  description: "Descripción detallada que muestra todas las características del producto.",
  extract: "Resumen corto que se usa en listados, tarjetas o vistas previas.",
  cover: "Imagen principal o portada del producto. Debe ser atractiva y de buena calidad.",
  
  mainAttribute: "Propiedad del atributo principal que define el producto como unidad principal.",
  mainAttributeValue: "Valor del atributo principal (ej: rojo, M, algodón).",

  priceRegular: "Precio base o estándar de venta del producto.",
  priceDiscount: "Precio rebajado (opcional). Si existe, reemplaza el precio regular.",
  stockQuantity: "Cantidad total disponible en inventario.",
  unitOfMeasure: "Unidad de medida para la venta del producto.",

  condition: "Estado de como se vende el producto.",
  warranty: "Tiempo de garantía ofrecido al cliente (ej: 6 meses, 1 año).",

  tags: "Palabras clave para mejorar la búsqueda interna y SEO (ej: oferta, verano).",

  isBestSeller: "Marcar si este producto es de los más vendidos.",
  isNewArrival: "Indicar si es un producto recién agregado.",
  isFeatured: "Mostrar el producto como destacado en la página principal.",
  isLimitedEdition: "Producto de edición limitada o producción especial.",
  isPreOrder: "Disponible exclusivamente como preventa.",
  isExportable: "Indica si puede enviarse internacionalmente.",
  allowBackorder: "Permitir compras aunque no haya stock disponible.",
  
  viewsCount: "Número total de vistas del producto (solo lectura).",
  salesCount: "Cantidad total de ventas del producto (solo lectura).",

  countryOfOrigin: "País de fabricación del producto. Importante para aduanas y SEO.",
  
  reviewsCount: "Cantidad total de reseñas recibidas (solo lectura).",
  averageRating: "Promedio de calificación del producto (solo lectura).",

  brandId: "Marca del producto.",
  categoryId: "Categoría principal del producto.",
  subcategoryId: "Subcategoría específica dentro de su categoría.",

  productPhotos: "Galería de fotos adicionales del producto.",
  productSeo: "Información para motores de búsqueda: meta títulos, descripciones, keywords.",
  productShipping: "Información de envío: peso, dimensiones, métodos disponibles.",
  productPhisycal: "Detalles físicos: altura, ancho, profundidad, material.",
  productVariants: "Variantes del producto (ej: colores, tallas, modelos).",

  status: "Activo o inactivo para la gestion y venta.",
  visibility: "Visible en la tienda o privado con acceso por link.",
  statusAt: "Fecha en que el estado del producto fue modificado.",
  createdAt: "Fecha de creación del producto en el sistema.",
  updatedAt: "Fecha de última actualización del producto.",

    // ---------------------------------------------
  //          CAMPOS NUEVOS — PHYSICAL
  // ---------------------------------------------

  weight: "Peso del producto total.",
  weightUnit: "Unidad de peso (ej: gramos, kilogramos, libras).",
  
  height: "Altura total del producto.",
  width: "Ancho total del producto.",
  length: "Largo o profundidad del producto.",
  dimensionUnit: "Unidad de medida usada para las dimensiones (ej: cm, in).",

  isFragile: "Indica si el producto es frágil y requiere mayor cuidado en el envío.",
  isPerishable: "Marca si el producto se deteriora con el tiempo o requiere condiciones especiales.",
  isEcoFriendly: "Define si el producto es ecológico o reciclable.",
  isBiodegradable: "Indica si el material se degrada naturalmente.",
  isHazardous: "Marca si es un producto peligroso (químicos, corrosivos, tóxicos).",
  idRequiresRefrigeration: "Indica si requiere refrigeración para almacenarse.",
  isFlammable: "Especifica si el producto es inflamable o sensible al calor.",
  isRequiresAssembly: "Indica si el producto necesita ensamblaje por parte del cliente.",

  minStorageTemp: "Temperatura mínima recomendada para almacenar el producto.",
  maxStorageTemp: "Temperatura máxima recomendada para almacenar el producto.",
  storageTempUnit: "Unidad de medida para la temperatura (ej: °C, °F).",

  material: "Material principal con el que está fabricado el producto (ej: plástico, metal, madera).",

  // ----------------------------------------------------------------
  //               CAMPOS NUEVOS — PRODUCT SHIPPING
  // ----------------------------------------------------------------

  freeShipping: "Indica si el producto incluye envío gratuito para el cliente.",
  handlingDays: "Número de días necesarios para preparar el producto antes de ser enviado.",
  packageType: "Tipo de empaque utilizado para el envío del producto (ej: caja, sobre, tubo, palet).",
  pickupInStore: "Permite seleccionar si el cliente puede recoger el producto en tienda física.",
  specialInstructions: "Indicaciones especiales para el envío o manipulación del producto.",

};
