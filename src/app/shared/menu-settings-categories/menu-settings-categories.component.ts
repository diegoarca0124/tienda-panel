import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { configurationsFilters } from '@app/pages/categories/constants/configurations-filters.constant';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-menu-settings-categories',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    NgbTooltipModule
  ],
  templateUrl: './menu-settings-categories.component.html',
  styleUrl: './menu-settings-categories.component.css'
})
export class MenuSettingsCategoriesComponent {
  @ViewChild('trigger') trigger!: ElementRef;

  @Input() title : string = '';
  @Input() placeholder : string = '';
  @Input() selectedData: any = '';
  @Input() sizeClass : 'sm' | 'lg' = 'sm';

  @Output() applyData = new EventEmitter();

  private destroy$ = new Subject<void>();
  public filter: string = '';

  public data: any[] = [];
  public displayData: any[] = [];   
  public errorMsmSeverListData: string = '';

  constructor(
    
  ){

  }


  ngOnInit(){
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedData']) {
      console.log(this.selectedData);
      this.syncSelectedData();
    }
  }

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

  initData() {
    this.data = configurationsFilters;
    this.displayData = this.data;
    this.syncSelectedData();
  }

  private syncSelectedData() {
     this.displayData = this.displayData.map(item => ({
        ...item,
        checked: this.selectedData.includes(item.value),
     }));
    this.data = this.displayData;
  }

  onCategoryChecked(category: any): void {
    category.subcategories.forEach((sub: any) => {
      sub.checked = category.checked;
    });
  }

  onSubcategoryChecked(category: any): void {
    category.checked = category.subcategories.every(
      (sub: any) => sub.checked
    );
  }

  get selectedItems(): any[] {
      return this.data.filter(sub => sub.checked);
  }

  getSelectedNames(): string {
    return this.selectedItems.map(item => item.name).join(', ');
  }


  private closeMenu(): void {
    const element = this.trigger.nativeElement;
    const dropdown = (window as any).bootstrap.Dropdown.getInstance(element)
      ?? new (window as any).bootstrap.Dropdown(element);

    dropdown.hide();
  }

  clearSelection(){
    this.data.forEach(category => {
      category.checked = false;
      category.subcategories.forEach((sub: any) => sub.checked = false);
    });
    this.selectedData = [];
    this.applyData.emit([]);
    this.closeMenu();
  }

  confirmSelection(){
    console.log(this.selectedItems);
    
    const selectedIds = this.selectedItems.map(item => item.value);
    this.selectedData = selectedIds;
    console.log(selectedIds);
    
    this.applyData.emit(selectedIds);
    this.closeMenu();
  }
}
