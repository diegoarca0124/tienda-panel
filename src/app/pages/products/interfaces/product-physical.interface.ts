export interface PhysicalProductInterface {
  weightUnit: any | undefined;
  dimensionUnit: any | undefined;

  height: number | string;
  width: number | string;
  length: number | string;
  weight: number | string;

  isFragile: boolean;
  isPerishable: boolean;
  isEcoFriendly: boolean;
  isBiodegradable: boolean;
  isHazardous: boolean;
  isRequiresRefrigeration: boolean; 
  isFlammable: boolean;
  isRequiresAssembly: boolean;

  material: string | undefined;

  storageTempUnit: any | undefined;
  minStorageTemp?: number | string;
  maxStorageTemp?: number | string;
}
