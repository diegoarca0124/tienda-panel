import { Injectable } from '@angular/core';
declare const $: any;

@Injectable({
	providedIn: 'root',
})
export class NavigatorService {
	private resolver?: (value: boolean) => void;

	open(): Promise<boolean> {
		const modal = document.getElementById('modal-exit');

		if (modal) {
			modal.classList.add('show');
			modal.style.display = 'block';
			document.body.classList.add('modal-open');

			const backdrop = document.createElement('div');

			backdrop.className = 'modal-backdrop fade show';
			backdrop.id = 'modal-exit-backdrop';

			document.body.appendChild(backdrop);
		}

		return new Promise<boolean>((resolve) => {
			this.resolver = resolve;
		});
	}

	confirm() {
		this.closeModal();
		this.resolver?.(true);
	}

	cancel() {
		this.closeModal();
		this.resolver?.(false);
	}

	private closeModal() {
		const modal = document.getElementById('modal-exit');

		if (modal) {
			modal.classList.remove('show');
			modal.style.display = 'none';
		}

		document.body.classList.remove('modal-open');

		const backdrop = document.getElementById('modal-exit-backdrop');

		backdrop?.remove();
	}
}
