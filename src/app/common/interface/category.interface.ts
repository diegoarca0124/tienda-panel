export interface Category {
	id?: string;
	name: string;
	slug?: string;
	icon: string;
	description: string;
	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
