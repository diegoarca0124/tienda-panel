import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { BrandService } from '@app/services/brand.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-menu-select-brands',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    NgbTooltipModule
  ],
  templateUrl: './menu-select-brands.component.html',
  styleUrl: './menu-select-brands.component.css'
})
export class MenuSelectBrandsComponent {
  @ViewChild('trigger') trigger!: ElementRef;
  private destroy$ = new Subject<void>();
  public filter: string = '';
  public brands: any[] = [];
  @Output() applyBrands = new EventEmitter();
  @Input() title : string = '';
  @Input() placeholder : string = '';
  public displayBrands: any[] = [];   // ← lo que se muestra
  private constBrands: any[] = [];    // ← copia original
  public errorMsmSeverListBrands: string = '';
  public loadingBrands: boolean = true;
	@Input() selectedBrands: any = '';
  @Input() sizeClass : 'sm' | 'lg' = 'sm';

  constructor(
    private brandService: BrandService
  ){

  }

  ngOnInit(){
    this.init_brands();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedBrands']) {
       console.log('selectedBrands',this.selectedBrands);
      this.applySelectedBrands();
    }
  }

  init_brands() {
    this.loadingBrands = true;
    this.errorMsmSeverListBrands = '';
    this.brandService
      .get_brands_by_select()
      .pipe(
        takeUntil(this.destroy$),
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loadingBrands = false))
      )
      .subscribe({
        next: (next) => {
          console.log(next);
          this.brands = next;
          const transformed = this.brands.map(item => ({
            id: item.id,           // OJO: antes usabas item.icon.id
            name: item.name,       // OJO: antes usabas item.icon.name
            logoUrl: item.logoUrl,
            checked: false,
          }));

          this.constBrands = [...transformed];
          this.displayBrands = [...transformed];

          this.applySelectedBrands();
        },
        error: (err) => {
          const error = err.error;
          this.errorMsmSeverListBrands = error;
        },
      });
  }

  onFilterOrStatusChange() {
    const value = this.filter.trim().toLowerCase();

    if (value) {
      this.displayBrands = this.constBrands.filter(item =>
        item.name.toLowerCase().includes(value)
      );
    } else {
      this.displayBrands = [...this.constBrands];
    }
  }

  onRemoveBrands(){
    this.displayBrands = this.displayBrands.map((prev)=>({
      ...prev,
      checked: false,
    }));
  }

  onApplyBrands(): void {
    this.applyBrands.emit(this.displayBrands); 
  }

  closeMenu(){
    const triggerEl = this.trigger.nativeElement;
    const dropdown = (window as any).bootstrap.Dropdown.getInstance(triggerEl)
      || new (window as any).bootstrap.Dropdown(triggerEl);
    dropdown.hide();
  }

  private applySelectedBrands() {
    /* if (!this.selectedBrands || this.selectedBrands.length === 0) return; */
    this.displayBrands = this.displayBrands.map(item => ({
      ...item,
      checked: this.selectedBrands.includes(item.id)
    }));
  }

  get selectedNames(): string {
      return this.displayBrands
      .filter(item => item.checked)
      .map(item => item.name)
      .join(', ');
  }
}
