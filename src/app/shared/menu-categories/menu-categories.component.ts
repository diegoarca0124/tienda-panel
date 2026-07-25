import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { CategoryInterface } from '@app/pages/categories/interfaces/category.interface';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-menu-categories',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    NgbTooltipModule
  ],
  templateUrl: './menu-categories.component.html',
  styleUrl: './menu-categories.component.css'
})
export class MenuCategoriesComponent {
  @ViewChild('trigger') trigger!: ElementRef;
  private destroy$ = new Subject<void>();
  public filter: string = '';
  public categories: any[] = [];
  @Output() applyCategories = new EventEmitter();
  @Input() title : string = '';
  @Input() placeholder : string = '';
  public displayCategories: any[] = [];   // ← lo que se muestra
  private constCategories: any[] = [];    // ← copia original
  public errorMsmSeverListCategories: string = '';
  public loadingCategories: boolean = true;
	@Input() selectedCategories: any = '';
  @Input() sizeClass : 'sm' | 'lg' = 'sm';

  constructor(
    private categoryService:CategoryService, 
  ){

  }

  ngOnInit(){
    this.init_categories();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedCategories']) {
      this.applySelectedCategories();
    }
  }

  private applySelectedCategories() {
    /* if (!this.selectedCategories || this.selectedCategories.length === 0) return; */
    this.displayCategories = this.displayCategories.map(item => ({
      ...item,
      checked: this.selectedCategories.includes(item.id)
    }));
  }

  init_categories() {
		this.loadingCategories = true;
		this.errorMsmSeverListCategories = '';
		this.categoryService
			.get_categories_by_select()
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadingCategories = false))
			)
			.subscribe({
				next: (next: { data: CategoryInterface[], message: string}) => {
					console.log(next);
					this.categories = next.data;
          const transformed = this.categories.map(item => ({
            id: item.id,         
            name: item.name,   
            prefix: item.prefix,   
            checked: false,
          }));

          this.constCategories = [...transformed];
          this.displayCategories = [...transformed];

          this.applySelectedCategories();
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

  onFilterOrStatusChange() {
    const value = this.filter.trim().toLowerCase();

    if (value) {
      this.displayCategories = this.constCategories.filter(item =>
        item.name.toLowerCase().includes(value)
      );
    } else {
      this.displayCategories = [...this.constCategories];
    }
  }

  onRemoveCategories(){
    this.displayCategories = this.displayCategories.map((prev)=>({
      ...prev,
      checked: false,
    }));
    this.applyCategories.emit(this.displayCategories)
  }

  onApplyCategories(): void {
    this.applyCategories.emit(this.displayCategories); 
    this.closeMenu();
  }

  closeMenu(){
    const triggerEl = this.trigger.nativeElement;
    const dropdown = (window as any).bootstrap.Dropdown.getInstance(triggerEl)
      || new (window as any).bootstrap.Dropdown(triggerEl);
    dropdown.hide();
  }

  get selectedNames(): string {
      return this.displayCategories
      .filter(item => item.checked)
      .map(item => item.name)
      .join(', ');
  }
}
