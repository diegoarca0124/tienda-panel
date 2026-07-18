import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { SubcategoryInterface } from '@app/pages/categories/interfaces/subcategory.interface';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-menu-select-subcategories',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    NgbTooltipModule
  ],
  templateUrl: './menu-select-subcategories.component.html',
  styleUrl: './menu-select-subcategories.component.css'
})
export class MenuSelectSubcategoriesComponent {
  @ViewChild('trigger') trigger!: ElementRef;

  @Input() title : string = '';
  @Input() categoryId : string = '';
  @Input() placeholder : string = '';
  @Input() selectedSubcategories: any = '';
  @Input() sizeClass : 'sm' | 'lg' = 'sm';

  @Output() applySubcategories = new EventEmitter();

  private destroy$ = new Subject<void>();
  public filter: string = '';
  public loadingSubcategories: boolean = true;

  public subcategories: any[] = [];
  public displaySubcategories: any[] = [];   
  public errorMsmSeverListCategories: string = '';
  
	

  constructor(
    private categoryService:CategoryService, 
  ){

  }

  ngOnInit(){
    this.initSubcategories();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedSubcategories']) {
      console.log(this.selectedSubcategories);
      this.syncSelectedCategories();
    }
  }

  private syncSelectedCategories() {
    this.displaySubcategories = this.displaySubcategories.map(item => ({
      ...item,
      checked: this.selectedSubcategories.includes(item.id)
    }));

    this.subcategories.forEach(sub => sub.checked = this.selectedSubcategories.includes(sub.id));
    this.onFilterSubcategories();
  }

  initSubcategories() {
		this.loadingSubcategories = true;
		this.errorMsmSeverListCategories = '';
    this.displaySubcategories = [];
    this.subcategories = [];
    this.filter = '';
		this.categoryService
			.get_subcategories_by_select(this.categoryId)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadingSubcategories = false))
			)
			.subscribe({
				next: (next: {data: SubcategoryInterface[], message: string}) => {
          console.log(next);
          
					this.subcategories = next.data;
          const transformed = this.subcategories.map(item => ({
            id: item.id,          
            name: item.name,       
            totalProducts: item.totalProducts,
            prefix: item.prefix,
            checked: false,
          }));
          this.displaySubcategories = [...transformed];
          this.syncSelectedCategories();
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmSeverListCategories = error;
				},
			});
	}

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

  onFilterSubcategories(): void {
    const search = this.filter.trim().toLowerCase();

    this.displaySubcategories = this.subcategories.filter(sub =>
      !search ||
      sub.name.toLowerCase().includes(search)
    );
  }

  clearSelection(): void {
    this.subcategories.forEach(sub => sub.checked = false);
    this.selectedSubcategories = [];
    this.applySubcategories.emit([]);
    this.closeMenu();
  }

  confirmSelection(): void {
    console.log(this.selectedItems);
    
    const selectedIds = this.selectedItems.map(item => item.id);
    this.selectedSubcategories = selectedIds;
    
    this.applySubcategories.emit(selectedIds);
    this.closeMenu();
  }

  get selectedItems(): any[] {
      return this.subcategories.filter(sub => sub.checked);
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
}
