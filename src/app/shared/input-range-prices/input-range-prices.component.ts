import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import noUiSlider from 'nouislider';

@Component({
	selector: 'app-input-range-prices',
	imports: [CommonModule],
	templateUrl: './input-range-prices.component.html',
	styleUrl: './input-range-prices.component.css',
})
export class InputRangePricesComponent {
	@ViewChild('priceSlider', { static: false })
	priceSlider!: ElementRef;

	slider: any = null;

	minPrice = 0;
	maxPrice = 10000;

	readonly MIN = 0;
	readonly MAX = 10000;

	@Output() applyPricesRange = new EventEmitter<{ min: number; max: number }>();

	ngOnDestroy(): void {
		this.slider?.destroy();
	}

	ngAfterViewInit(): void {
		this.slider = noUiSlider.create(this.priceSlider.nativeElement, {
			start: [this.minPrice, this.maxPrice],
			connect: true,
			range: {
				min: this.MIN,
				max: this.MAX,
			},
			step: 10,
			/* tooltips: [
        {
          to: (value: number) => `S/ ${Math.round(value)}`,
        },
        {
          to: (value: number) => `S/ ${Math.round(value)}`,
        },
      ], */
			format: {
				to: (value: number) => Math.round(value),
				from: (value: string) => Number(value),
			},
		});

		this.slider.on('update', (values: any[]) => {
			this.minPrice = Number(values[0]);
			this.maxPrice = Number(values[1]);
		});
	}

	onApplyPricesRange(): void {
		this.applyPricesRange.emit({
			min: this.minPrice,
			max: this.maxPrice,
		});
	}
}
