import { PhysicalProduct } from "@app/common/interface/physical-product.interface";

export const PhysicalMock: PhysicalProduct = {
  weightUnit: undefined,
  dimensionUnit: undefined,

  height: '',        // cm
  width: '',         // cm
  length: '',        // cm
  weight: '',       // kg

  isFragile: true,
  isPerishable: false,
  isEcoFriendly: true,
  isBiodegradable: false,
  isHazardous: false,
  isRequiresRefrigeration: false,
  isFlammable: false,
  isRequiresAssembly: false,

  material: 'Plástico ABS',
  
  storageTempUnit: { group: 'Temperatura', name: 'Celsius', abbr: '°C' },
  minStorageTemp: '0',
  maxStorageTemp: '40'
};
