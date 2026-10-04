import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { configurationsOptions } from '@app/pages/categories/constants/selectors.constant';
import { NgbDropdown, NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Options } from '@popperjs/core';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-menu-settings-categories',
	imports: [RouterModule, CommonModule, FormsModule, NgbTooltipModule, NgbDropdownModule],
	templateUrl: './menu-settings-categories.component.html',
	styleUrl: './menu-settings-categories.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MenuSettingsCategoriesComponent {
	@ViewChild('menuDropdown') menuDropdown?: NgbDropdown;

	@Input() title: string = 'Configuraciones';
	@Input() placeholder: string = 'Seleccionar configuraciones';
	@Input() selectedData: string | string[] = [];
	@Input() sizeClass: 'sm' | 'lg' = 'sm';
	@Input({ transform: booleanAttribute }) disabled = false;

	@Output() applyData = new EventEmitter<string[]>();

	private destroy$ = new Subject<void>();

	public filter: string = '';
	public data: any[] = [];
	public displayData: any[] = [];
	public errorMsmSeverListData: string = '';
	public readonly popperOptions = (options: Partial<Options>): Partial<Options> => ({
		...options,
		modifiers: [...(options.modifiers ?? []), { name: 'offset', options: { offset: [0, 8] } }],
	});

	ngOnInit(): void {
		this.initData();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['disabled']?.currentValue) {
			this.closeMenu();
		}

		if (changes['selectedData']) {
			this.syncSelectedData();
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	initData(): void {
		this.data = configurationsOptions;
		this.displayData = this.data;
		this.syncSelectedData();
	}

	private syncSelectedData(): void {
		const selectedValues = Array.isArray(this.selectedData) ? this.selectedData : this.selectedData.split(',').filter(Boolean);

		this.displayData = this.data.map((item) => ({
			...item,
			checked: selectedValues.includes(item.value),
		}));
	}

	get selectedItems(): any[] {
		return this.displayData.filter((item) => item.checked);
	}

	getSelectedNames(): string {
		return this.selectedItems.map((item) => item.name).join(', ');
	}

	toggleMenu(event: Event): void {
		event.preventDefault();
		event.stopPropagation();
		if (this.disabled) return;

		this.menuDropdown?.toggle();
	}

	private closeMenu(): void {
		this.menuDropdown?.close();
	}

	clearSelection(): void {
		if (this.disabled) return;
		this.displayData.forEach((item) => {
			item.checked = false;
		});

		this.selectedData = [];
		this.applyData.emit([]);
		this.closeMenu();
	}

	confirmSelection(): void {
		if (this.disabled) return;
		const selectedIds = this.selectedItems.map((item) => item.value);

		this.selectedData = selectedIds;
		this.applyData.emit(selectedIds);
		this.closeMenu();
	}
}
