import { Product } from "@app/common/interface/product.interface";
import { statusProduct } from "../constants/statusProduct.contant";
import { visibilities } from "../constants/visibilities.constant";

export const productMock: Product = {
  visibility: visibilities[0].value,
  status: statusProduct[0].value,

  name: 'Camiseta Deportiva Premium',
  type: 'Fisico',
  slug: 'camiseta-deportiva-premium',
  description: 'Camiseta deportiva de alta resistencia, ideal para entrenamientos.',
  extract: 'Camiseta de calidad premium con tejido transpirable.',
  priceRegular: 129.90,
  priceDiscount: 99.90,

  cover: '',
  miniature: undefined as File | undefined,

 /*  mainAttribute: {
    id: "ee158a2d-7ee7-401a-8bc3-70cbc949a24d",
    name: "Almacenamiento",
    status: true
  }, */
  unitOfMeasure: "Unidad",
  condition: "Nuevo",
  warranty: "Sin garantía",
  countryOfOrigin: {
    code: "US",
    flag: "media/flags/united-states.svg",
    name: "Estados Unidos"
  },

  tags: ['deporte', 'premium', 'camiseta'],

  brandId: "8efbc59f-238b-4575-bc20-5abd9a5709a3",
  categoryId: 'c2469122-3d6a-41ea-a3f3-e07202c9769a',
  subcategoryId: 'bf532720-46a1-4924-9922-7a59fd0011ba',

  isBestSeller: false,
  isNewArrival: true,
  isFeatured: false,
  isLimitedEdition: false,
  isPreOrder: false,
  isExportable: false,
  allowBackorder: false,
  productGroupId: undefined
};
