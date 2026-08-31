import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { configurationsOptions } from '@app/pages/categories/constants/selectors.constant';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-menu-settings-categories',
	imports: [RouterModule, CommonModule, FormsModule, NgbTooltipModule],
	templateUrl: './menu-settings-categories.component.html',
	styleUrl: './menu-settings-categories.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MenuSettingsCategoriesComponent {
	@ViewChild('trigger') trigger!: ElementRef;

	@Input() title: string = 'Configuraciones';
	@Input() placeholder: string = 'Seleccionar configuraciones';
	@Input() selectedData: string | string[] = [];
	@Input() sizeClass: 'sm' | 'lg' = 'sm';

	@Output() applyData = new EventEmitter<string[]>();

	private destroy$ = new Subject<void>();

	public filter: string = '';
	public data: any[] = [];
	public displayData: any[] = [];
	public errorMsmSeverListData: string = '';

	ngOnInit(): void {
		this.initData();
	}

	ngOnChanges(changes: SimpleChanges): void {
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

	private closeMenu(): void {
		if (!this.trigger?.nativeElement) {
			return;
		}

		const element = this.trigger.nativeElement;

		const dropdown = (window as any).bootstrap.Dropdown.getInstance(element) ?? new (window as any).bootstrap.Dropdown(element);

		dropdown.hide();
	}

	clearSelection(): void {
		this.displayData.forEach((item) => {
			item.checked = false;
		});

		this.selectedData = [];
		this.applyData.emit([]);
		this.closeMenu();
	}

	confirmSelection(): void {
		const selectedIds = this.selectedItems.map((item) => item.value);

		this.selectedData = selectedIds;
		this.applyData.emit(selectedIds);
		this.closeMenu();
	}
}
