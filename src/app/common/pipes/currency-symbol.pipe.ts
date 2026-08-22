import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'currencySymbol',
	standalone: true,
})
export class CurrencySymbolPipe implements PipeTransform {
	transform(country: string): string {
		switch (country) {
			case 'PE':
				return 'S/';

			case 'US':
				return '$';

			case 'MX':
				return '$';

			case 'CL':
				return '$';

			case 'CO':
				return '$';

			case 'AR':
				return '$';

			case 'ES':
				return '€';

			default:
				return '$';
		}
	}
}
