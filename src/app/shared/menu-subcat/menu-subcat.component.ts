import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { CategoryInterface } from '@app/pages/categories/interfaces/category.interface';
import { SubcategoryInterface } from '@app/pages/categories/interfaces/subcategory.interface';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-menu-subcat',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    NgbTooltipModule
  ],
  templateUrl: './menu-subcat.component.html',
  styleUrl: './menu-subcat.component.css'
})
export class MenuSubcatComponent {
  @ViewChild('trigger') trigger!: ElementRef;

  @Input() title : string = '';
  @Input() categoryId : string = '';
  @Input() placeholder : string = '';
  @Input() selectedData: any = '';
  @Input() sizeClass : 'sm' | 'lg' = 'sm';

  @Output() applyData = new EventEmitter();

  private destroy$ = new Subject<void>();
  public filter: string = '';
  public loadingData: boolean = true;

  public data: any[] = [];
  public displayData: any[] = [];   
  public errorMsmSeverListData: string = '';

  constructor(
    private categoryService: CategoryService
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
    this.loadingData = true;
    this.errorMsmSeverListData = '';
    this.displayData = [];
    this.data = [];
    this.filter = '';
    this.categoryService
      .get_subcat_by_select()
      .pipe(
        takeUntil(this.destroy$),
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loadingData = false))
      )
      .subscribe({
        next: (next: {data: CategoryInterface[], message: string}) => {
          console.log(next);
          
          this.data = next.data;
          this.displayData = this.data;
          this.syncSelectedData();
        },
        error: (err) => {
          const error = err.error;
          this.errorMsmSeverListData = error;
        },
      });
  }

  private syncSelectedData() {
     this.displayData = this.displayData.map(category => {
      category.subcategories = category.subcategories.map((sub:any) => ({
        ...sub,
        checked: this.selectedData.includes(sub.id),
      }));

      return {
        ...category,
        checked: category.subcategories.every((sub:any) => sub.checked),
      };
    });

    this.data = this.displayData;
    this.onFilterData();
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

  onFilterData(): void {
    const search = this.filter.trim().toLowerCase();
    if (!search) {
    this.displayData = [...this.data];
    return;
  }

  this.displayData = this.data
    .map(category => {
      const categoryMatch =
        category.name.toLowerCase().includes(search) ||
        category.prefix.toLowerCase().includes(search);

      if (categoryMatch) {
        return {
          ...category,
          subcategories: [...category.subcategories],
        };
      }

      const subcategories = category.subcategories.filter((sub: SubcategoryInterface) =>
        sub.name.toLowerCase().includes(search) ||
        sub.prefix.toLowerCase().includes(search)
      );

      if (subcategories.length > 0) {
        return {
          ...category,
          subcategories,
        };
      }

      return null;
    })
    .filter(category => category !== null);
  }

  get selectedItems(): any[] {
      return this.data
      .flatMap(category => category.subcategories)
      .filter(sub => sub.checked);
  }

  getSelectedNames(): string {
    return this.selectedItems.map(item => item.name).join(', ');
  }

  getCheckedCount(category: any): number {
    return category.subcategories.filter((sub: any) => sub.checked).length;
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
    const selectedIds = this.selectedItems.map(item => item.id);
    this.selectedData = selectedIds;
    
    this.applyData.emit(selectedIds);
    this.closeMenu();
  }

}
