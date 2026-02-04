import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { countries } from '@app/common/constants/countries.constant';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-menu-select-countries',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    NgbTooltipModule
  ],
  templateUrl: './menu-select-countries.component.html',
  styleUrl: './menu-select-countries.component.css'
})
export class MenuSelectCountriesComponent {

  @ViewChild('trigger') trigger!: ElementRef;
  private destroy$ = new Subject<void>();
  public filter: string = '';
  public countries: any[] = [];
  @Output() applyCountries = new EventEmitter();
  @Input() title : string = '';
  @Input() placeholder : string = '';
  public displayCountries: any[] = [];   // ← lo que se muestra
  private constCountries: any[] = [];    // ← copia original
  public errorMsmSeverListCountries: string = '';
  public loadingCountries: boolean = false;
	@Input() selectedCountries: any = '';
  @Input() sizeClass : 'sm' | 'lg' = 'sm';

  ngOnInit(){
    this.init_countries();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedCountries']) {
      this.applySelectedCountries();
    }
  }


  init_countries(){
    this.countries = countries;
    const transformed = this.countries.map(item => ({
      code: item.code,           // OJO: antes usabas item.icon.id
      name: item.name,       // OJO: antes usabas item.icon.name
      flag: item.flag,
      checked: false,
    }));

    this.constCountries = [...transformed];
    this.displayCountries = [...transformed];

    this.applySelectedCountries();
  }

  onFilterOrStatusChange() {
    const value = this.filter.trim().toLowerCase();

    if (value) {
      this.displayCountries = this.constCountries.filter(item =>
        item.name.toLowerCase().includes(value)
      );
    } else {
      this.displayCountries = [...this.constCountries];
    }
  }

  onRemoveCountries(){
    this.displayCountries = this.displayCountries.map((prev)=>({
      ...prev,
      checked: false,
    }));
    this.applyCountries.emit(this.displayCountries); 
  }

  onApplyCountries(): void {
    this.applyCountries.emit(this.displayCountries); 
  }

  closeMenu(){
    const triggerEl = this.trigger.nativeElement;
    const dropdown = (window as any).bootstrap.Dropdown.getInstance(triggerEl)
      || new (window as any).bootstrap.Dropdown(triggerEl);
    dropdown.hide();
  }

  private applySelectedCountries() {
   /*  if (!this.selectedCountries || this.selectedCountries.length === 0) return; */

    this.displayCountries = this.displayCountries.map(item => ({
      ...item,
      checked: this.selectedCountries.includes(item.code)
    }));
    console.log(this.displayCountries);
    
  }

  get selectedNames(): string {
      return this.displayCountries
      .filter(item => item.checked)
      .map(item => item.code)
      .join(', ');
  }
}
