import { ShippingProduct } from '@app/common/interface/shipping-product.interface';
import { visibilities } from '../constants/visibilities.constant';
import { CharacteristicInterface } from '../interfaces/characteristic.interface';
import { PhysicalProductInterface } from '../interfaces/product-physical.interface';
import { ProductInterface } from '../interfaces/product.interface';
import { statusOptions } from '../constants/selectors.constant';

export function createEmptyProduct(): ProductInterface {
	return {
		visibility: visibilities[0].value,
		status: statusOptions[0].value,
		name: '',
		type: 'Fisico',
		quality: 0,
		slug: '',
		description: '',
		extract: '',
		cover: '',
		miniature: undefined,
		unitOfMeasure: undefined,
		condition: undefined,
		warranty: undefined,
		countryOfOrigin: undefined,
		priceRegular: 0,
		priceDiscount: 0,
		quality_label: '',
		tags: [],
		brandId: undefined,
		categoryId: undefined,
		subcategoryId: undefined,
		isBestSeller: false,
		isNewArrival: true,
		isFeatured: false,
		isLimitedEdition: false,
		isPreOrder: false,
		isExportable: false,
		allowBackorder: false,
		productGroupId: undefined,
	};
}

export function createEmptyCharacteristic(): CharacteristicInterface {
	return {
		attributeId: '',
		value: '',
		data: [],
		loading: false,
	};
}

export function createEmptyProductPhysical(): PhysicalProductInterface {
	return {
		weightUnit: undefined,
		dimensionUnit: undefined,
		height: '',
		width: '',
		length: '',
		weight: '',
		isFragile: false,
		isPerishable: false,
		isEcoFriendly: false,
		isBiodegradable: false,
		isHazardous: false,
		isRequiresRefrigeration: false,
		isFlammable: false,
		isRequiresAssembly: false,
		material: undefined,
		storageTempUnit: undefined,
		minStorageTemp: '',
		maxStorageTemp: '',
	};
}

export function createEmptyProductShipping(): ShippingProduct {
	return {
		packageType: undefined,
		freeShipping: false,
		pickupInStore: false,
		specialInstructions: '',
		handlingDays: '',
	};
}

export function createEmptyCurrencyOptions() {
	return {
		prefix: 'S/ ',
		thousands: ',',
		decimal: '.',
		precision: 2,
		align: 'left',
		allowNegative: false,
	};
}

export function createEmptyVariation() {
	return {
		id: '',
		name: '',
		productId: '',
		sku: '',
		status: false,
		stock: '',
	};
}
