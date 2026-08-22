import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'padCode',
	standalone: true,
})
export class PadCodePipe implements PipeTransform {
	transform(value: number | string, length: number = 6): string {
		return String(value).padStart(length, '0');
	}
}
