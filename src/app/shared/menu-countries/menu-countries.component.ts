import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { countries } from '@app/common/constants/countries.constant';
import { NgbDropdown, NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Options } from '@popperjs/core';

interface CountryOption {
	code: string;
	name: string;
	flag: string;
	checked: boolean;
}

@Component({
	selector: 'app-menu-countries',
	imports: [RouterModule, CommonModule, FormsModule, NgbTooltipModule, NgbDropdownModule],
	templateUrl: './menu-countries.component.html',
	styleUrl: './menu-countries.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MenuCountriesComponent {
	@ViewChild('menuDropdown') menuDropdown?: NgbDropdown;

	@Input() title = '';
	@Input() placeholder = '';
	@Input() sizeClass: 'sm' | 'lg' = 'sm';
	@Input() selectedCountries: string[] = [];
	@Input({ transform: booleanAttribute }) disabled = false;

	@Output() applyCountries = new EventEmitter<string[]>();

	public filter = '';
	public loadingCountries = false;
	public errorMsmSeverListCountries = '';
	public countries: CountryOption[] = [];
	public displayCountries: CountryOption[] = [];
	public readonly popperOptions = (options: Partial<Options>): Partial<Options> => ({
		...options,
		modifiers: [...(options.modifiers ?? []), { name: 'offset', options: { offset: [0, 8] } }],
	});

	get selectedItems(): CountryOption[] {
		return this.countries.filter((country) => country.checked);
	}

	ngOnInit(): void {
		this.loadCountries();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['disabled']?.currentValue) {
			this.closeMenu();
		}

		if (changes['selectedCountries']) {
			this.syncSelectedCountries();
		}
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
		this.countries.forEach((country) => {
			country.checked = this.selectedCountries.includes(country.code);
		});

		this.onFilterCountries();
	}

	onFilterCountries(): void {
		const search = this.filter.trim().toLowerCase();

		this.displayCountries = this.countries.filter((country) => !search || country.name.toLowerCase().includes(search) || country.code.toLowerCase().includes(search));
	}

	clearSelection(): void {
		if (this.disabled || this.loadingCountries) return;
		this.countries.forEach((country) => {
			country.checked = false;
		});
	}

	confirmSelection(): void {
		if (this.disabled || this.loadingCountries) return;
		const selectedCodes = this.selectedItems.map((item) => item.code);

		this.selectedCountries = selectedCodes;
		this.applyCountries.emit(selectedCodes);
		this.closeMenu();
	}

	getSelectedNames(): string {
		return this.selectedItems.map((item) => item.code).join(', ');
	}

	toggleMenu(event: Event): void {
		event.preventDefault();
		event.stopPropagation();
		if (this.disabled || this.loadingCountries) return;

		this.menuDropdown?.toggle();
	}

	private closeMenu(): void {
		this.menuDropdown?.close();
	}
}
