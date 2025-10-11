import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChanged = new EventEmitter<number>();

  /** Cambia de página solo si es un número */
  changePageIfNumber(page: number | string) {
    if (typeof page === 'number') {
      this.changePage(page);
    }
  }

  /** Cambia de página */
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChanged.emit(page);
    }
  }

  /** Genera el arreglo de páginas con ... */
  get pages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      // 3 primeras páginas
      pages.push(1, 2, 3);

      // separador antes del bloque central
      if (current > 5) pages.push('...');

      // bloque central alrededor de la página actual
      const start = Math.max(4, current - 1);
      const end = Math.min(total - 3, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      // separador después del bloque central
      if (current < total - 4) pages.push('...');

      // 3 últimas páginas
      pages.push(total - 2, total - 1, total);
    }

    // elimina duplicados y mantiene orden
    return Array.from(new Set(pages));
  }
}
