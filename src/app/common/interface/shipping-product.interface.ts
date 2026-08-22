export interface ShippingProduct {
	packageType: string | undefined;
	freeShipping: boolean;
	pickupInStore: boolean;
	specialInstructions: string;
	handlingDays: string | number;
}
