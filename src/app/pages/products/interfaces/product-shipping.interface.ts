export interface ShippingProductInterface {
	packageType: string | undefined;
	freeShipping: boolean;
	pickupInStore: boolean;
	specialInstructions: string;
	handlingDays: string | number;
}
