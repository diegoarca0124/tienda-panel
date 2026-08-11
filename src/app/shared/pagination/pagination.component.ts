import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output
} from '@angular/core';

type PaginationItem = number | '...';

@Component({
	selector: 'app-pagination',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './pagination.component.html',
	styleUrls: ['./pagination.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
	@Input() currentPage = 1;
	@Input() totalPages = 1;

	@Output() pageChanged = new EventEmitter<number>();

	changePage(page: number): void {
		if (
			page < 1 ||
			page > this.totalPages ||
			page === this.currentPage
		) {
			return;
		}

		this.pageChanged.emit(page);
	}

	changePageIfNumber(page: PaginationItem): void {
		if (typeof page === 'number') {
			this.changePage(page);
		}
	}

	get pages(): PaginationItem[] {
		const total = Math.max(0, this.totalPages);
		const current = Math.min(
			Math.max(1, this.currentPage),
			Math.max(1, total)
		);

		if (total === 0) {
			return [];
		}

		if (total <= 7) {
			return Array.from(
				{ length: total },
				(_, index) => index + 1
			);
		}

		/*
		 * Cerca del inicio:
		 * 1 2 3 4 5 ... 20
		 */
		if (current <= 4) {
			return [1, 2, 3, 4, 5, '...', total];
		}

		/*
		 * Cerca del final:
		 * 1 ... 16 17 18 19 20
		 */
		if (current >= total - 3) {
			return [
				1,
				'...',
				total - 4,
				total - 3,
				total - 2,
				total - 1,
				total
			];
		}

		/*
		 * Zona central:
		 * 1 ... 9 10 11 ... 20
		 */
		return [
			1,
			'...',
			current - 1,
			current,
			current + 1,
			'...',
			total
		];
	}

	trackByPage(
		index: number,
		page: PaginationItem
	): string {
		return `${page}-${index}`;
	}
}