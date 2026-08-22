import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { countries } from '@app/common/constants/countries.constant';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

interface CountryOption {
	code: string;
	name: string;
	flag: string;
	checked: boolean;
}

@Component({
	selector: 'app-menu-countries',
	imports: [RouterModule, CommonModule, FormsModule, NgbTooltipModule],
	templateUrl: './menu-countries.component.html',
	styleUrl: './menu-countries.component.css',
})
export class MenuCountriesComponent {
	@ViewChild('trigger') trigger!: ElementRef;

	@Input() title = '';
	@Input() placeholder = '';
	@Input() sizeClass: 'sm' | 'lg' = 'sm';
	@Input() selectedCountries: string[] = [];

	@Output() applyCountries = new EventEmitter<string[]>();

	public filter = '';
	public loadingCountries = false;
	public errorMsmSeverListCountries = '';

	private countries: CountryOption[] = [];
	public displayCountries: CountryOption[] = [];

	get selectedItems(): CountryOption[] {
		return this.countries.filter((country) => country.checked);
	}

	ngOnInit(): void {
		this.loadCountries();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['selectedCountries']) this.syncSelectedCountries();
	}

	private loadCountries(): void {
		this.countries = countries.map((country) => ({
			code: country.code,
			name: country.name,
			flag: country.flag,
			checked: false,
		}));

		this.displayCountries = [...this.countries];
		this.syncSelectedCountries();
	}

	private syncSelectedCountries(): void {
		this.countries.forEach((country) => (country.checked = this.selectedCountries.includes(country.code)));
		this.onFilterCountries();
	}

	onFilterCountries(): void {
		const search = this.filter.trim().toLowerCase();

		this.displayCountries = this.countries.filter((country) => !search || country.name.toLowerCase().includes(search) || country.code.toLowerCase().includes(search));
	}

	clearSelection(): void {
		this.countries.forEach((country) => (country.checked = false));
	}

	confirmSelection(): void {
		const selectedCodes = this.selectedItems.map((item) => item.code);
		this.selectedCountries = selectedCodes;

		this.applyCountries.emit(selectedCodes);
		this.closeMenu();
	}

	getSelectedNames(): string {
		return this.selectedItems.map((item) => item.code).join(', ');
	}

	private closeMenu(): void {
		const element = this.trigger.nativeElement;
		const dropdown = (window as any).bootstrap.Dropdown.getInstance(element) ?? new (window as any).bootstrap.Dropdown(element);

		dropdown.hide();
	}
}
