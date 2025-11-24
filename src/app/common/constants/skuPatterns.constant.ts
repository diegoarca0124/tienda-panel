export const skuPatterns = [
  // ---------- 4 CAMPOS ----------
  {
    name: 'Título (4) + Categoría (3) + Subcategoría (3) + Marca (3)',
    fields: [
      { key: 'title',       chars: 4 },
      { key: 'categoryId',    chars: 3 },
      { key: 'subcategoryId', chars: 3 },
      { key: 'brand',       chars: 3 }
    ],
    example: 'POLO-ROP-POL-NIK'
  },
  {
    name: 'Título (4) + Categoría (3) + Subcategoría (3) + Unidad (2)',
    fields: [
      { key: 'title',       chars: 4 },
      { key: 'categoryId',    chars: 3 },
      { key: 'subcategoryId', chars: 3 },
      { key: 'unit',        chars: 2 }
    ],
    example: 'POLO-ROP-POL-UN'
  },
  {
    name: 'Título (4) + Categoría (3) + Marca (3) + Condición (2)',
    fields: [
      { key: 'title',       chars: 4 },
      { key: 'categoryId',    chars: 3 },
      { key: 'brand',       chars: 3 },
      { key: 'condition',   chars: 2 }
    ],
    example: 'POLO-ROP-NIK-NU'
  },

  // ---------- 5 CAMPOS ----------
  {
    name: 'Título (4) + Categoría (3) + Subcategoría (3) + Marca (3) + Unidad (2)',
    fields: [
      { key: 'title',       chars: 4 },
      { key: 'categoryId',    chars: 3 },
      { key: 'subcategoryId', chars: 3 },
      { key: 'brand',       chars: 3 },
      { key: 'unit',        chars: 2 }
    ],
    example: 'POLO-ROP-POL-NIK-UN'
  },
  {
    name: 'Título (4) + Categoría (3) + Subcategoría (3) + Marca (3) + Condición (2)',
    fields: [
      { key: 'title',       chars: 4 },
      { key: 'categoryId',    chars: 3 },
      { key: 'subcategoryId', chars: 3 },
      { key: 'brand',       chars: 3 },
      { key: 'condition',   chars: 2 }
    ],
    example: 'POLO-ROP-POL-NIK-NU'
  },
  {
    name: 'Título (4) + Categoría (3) + Subcategoría (3) + Unidad (2) + Condición (2)',
    fields: [
      { key: 'title',       chars: 4 },
      { key: 'categoryId',    chars: 3 },
      { key: 'subcategoryId', chars: 3 },
      { key: 'unit',        chars: 2 },
      { key: 'condition',   chars: 2 }
    ],
    example: 'POLO-ROP-POL-UN-NU'
  },

  // ---------- 6 CAMPOS (FULL) ----------
  {
    name: 'Título (4) + Categoría (3) + Subcategoría (3) + Marca (3) + Unidad (2) + Condición (2)',
    fields: [
      { key: 'title',       chars: 4 },
      { key: 'categoryId',    chars: 3 },
      { key: 'subcategoryId', chars: 3 },
      { key: 'brand',       chars: 3 },
      { key: 'unit',        chars: 2 },
      { key: 'condition',   chars: 2 }
    ],
    example: 'POLO-ROP-POL-NIK-UN-NU'
  }
];
