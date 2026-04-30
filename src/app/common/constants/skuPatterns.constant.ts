export const skuPatterns = [
  // ---------- 4 CAMPOS ----------
  {
    name: 'Título + Categoría + Subcategoría + Marca',
    fields: [
      { key: 'title',       chars: 4 },
      { key: 'categoryId',    chars: 3 },
      { key: 'subcategoryId', chars: 3 },
      { key: 'brand',       chars: 3 }
    ],
    example: 'POLO-ROP-POL-NIK'
  },
  {
    name: 'Título + Categoría + Subcategoría + Unidad',
    fields: [
      { key: 'title',       chars: 4 },
      { key: 'categoryId',    chars: 3 },
      { key: 'subcategoryId', chars: 3 },
      { key: 'unit',        chars: 2 }
    ],
    example: 'POLO-ROP-POL-UN'
  },
  {
    name: 'Título + Categoría + Marca + Condición',
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
    name: 'Título + Categoría + Subcategoría + Marca + Unidad',
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
    name: 'Título + Categoría + Subcategoría + Marca + Condición',
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
    name: 'Título + Categoría + Subcategoría + Unidad + Condición',
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
    name: 'Título + Categoría + Subcategoría + Marca + Unidad + Condición',
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
