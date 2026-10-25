import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TagifyInputComponent } from './tagify-input.component';

describe('TagifyInputComponent async options', () => {
	let fixture: ComponentFixture<TagifyInputComponent>;
	let categoryHost: HTMLElement | undefined;

	beforeEach(async () => {
		await TestBed.configureTestingModule({ imports: [TagifyInputComponent] })
			.overrideTemplate(TagifyInputComponent, '@if (placeholder !== "__hidden__") { <div #tagHost></div> }')
			.compileComponents();
		fixture = TestBed.createComponent(TagifyInputComponent);
	});

	afterEach(() => {
		fixture.destroy();
		categoryHost?.remove();
		categoryHost = undefined;
	});

	it('keeps the placeholder and field height while selected categories are loading', () => {
		// TestBed creates a div root; use the real host selector for the CSS checks.
		categoryHost = document.createElement('app-tagify-input');
		categoryHost.classList.add('category-tagify');
		fixture.nativeElement.parentElement.appendChild(categoryHost);
		categoryHost.appendChild(fixture.nativeElement);
		fixture.componentRef.setInput('enforceWhitelist', true);
		fixture.componentRef.setInput('placeholder', 'Buscar y seleccionar categorías');
		fixture.componentRef.setInput('whiteList', [{ value: 'category-1', name: 'Alimentos' }]);
		fixture.componentRef.setInput('selectedTags', ['category-1']);
		fixture.detectChanges();
		const scope = fixture.nativeElement.querySelector('.app-tagify') as HTMLElement;
		const input = scope.querySelector('.tagify__input') as HTMLElement;
		const initialHeight = scope.getBoundingClientRect().height;
		const tag = scope.querySelector('.tagify__tag') as HTMLElement;
		const initialTagSize = tag.getBoundingClientRect();

		fixture.componentRef.setInput('disabled', true);
		fixture.componentRef.setInput('loading', true);
		fixture.detectChanges();

		expect(getComputedStyle(input).visibility).toBe('visible');
		expect(getComputedStyle(input, '::before').content).toContain('Buscar y seleccionar categorías');
		expect(scope.getBoundingClientRect().height).toBe(initialHeight);
		expect(tag.getBoundingClientRect().height).toBe(initialTagSize.height);
		expect(tag.getBoundingClientRect().width).toBe(initialTagSize.width);
	});

	it('reserves enough space to show the placeholder when initially loading without categories', () => {
		categoryHost = document.createElement('app-tagify-input');
		categoryHost.classList.add('category-tagify');
		fixture.nativeElement.parentElement.appendChild(categoryHost);
		categoryHost.appendChild(fixture.nativeElement);
		fixture.componentRef.setInput('enforceWhitelist', true);
		fixture.componentRef.setInput('placeholder', 'Buscar y seleccionar categorías');
		fixture.componentRef.setInput('disabled', true);
		fixture.componentRef.setInput('loading', true);
		fixture.detectChanges();
		const input = fixture.nativeElement.querySelector('.tagify__input') as HTMLElement;
		const placeholder = getComputedStyle(input, '::before');
		const placeholderPosition = [placeholder.top, placeholder.height, placeholder.transform];
		const style = getComputedStyle(input);
		const height = fixture.nativeElement.querySelector('.app-tagify').getBoundingClientRect().height;
		expect(placeholder.content).toContain('Buscar y seleccionar categorías');
		expect(placeholder.opacity).toBe('1');
		expect(getComputedStyle(input).visibility).toBe('visible');
		expect(parseFloat(placeholder.top)).toBeCloseTo(input.clientHeight / 2, 0);
		expect(input.clientHeight).toBeGreaterThanOrEqual(Math.floor(parseFloat(placeholder.lineHeight) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)));
		fixture.componentRef.setInput('disabled', false);
		fixture.componentRef.setInput('loading', false);
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.app-tagify').getBoundingClientRect().height).toBe(height);
		const enabledPlaceholder = getComputedStyle(input, '::before');
		expect([enabledPlaceholder.top, enabledPlaceholder.height, enabledPlaceholder.transform]).toEqual(placeholderPosition);
	});

	it('opens category suggestions after the initially disabled field finishes loading', fakeAsync(() => {
		fixture.componentRef.setInput('enforceWhitelist', true);
		fixture.componentRef.setInput('disabled', true);
		fixture.componentRef.setInput('loading', true);
		fixture.detectChanges();

		fixture.componentRef.setInput('whiteList', [{ value: 'category-1', name: 'Alimentos' }]);
		fixture.componentRef.setInput('loading', false);
		fixture.componentRef.setInput('disabled', false);
		fixture.detectChanges();

		fixture.componentInstance.focus();
		tick();
		const dropdown = document.querySelector('.app-tagify-dropdown');
		expect(dropdown?.textContent).toContain('Alimentos');
		fixture.destroy();
		tick(500);
	}));

	it('recreates Tagify with its selected categories when Angular replaces the host', fakeAsync(() => {
		fixture.componentRef.setInput('enforceWhitelist', true);
		fixture.componentRef.setInput('whiteList', [
			{ value: 'category-1', name: 'Alimentos' },
			{ value: 'category-2', name: 'Frutas' },
		]);
		fixture.componentRef.setInput('selectedTags', ['category-1']);
		fixture.detectChanges();
		const oldScope = fixture.nativeElement.querySelector('.app-tagify');
		const changes = spyOn(fixture.componentInstance.tagsChange, 'emit');

		fixture.componentRef.setInput('placeholder', '__hidden__');
		fixture.detectChanges();
		fixture.componentRef.setInput('placeholder', 'Buscar categorías');
		fixture.detectChanges();

		const newScope = fixture.nativeElement.querySelector('.app-tagify');
		expect(newScope).toBeTruthy();
		expect(newScope).not.toBe(oldScope);
		expect(newScope.querySelector('.tagify__tag-text').textContent).toBe('Alimentos');
		expect(fixture.nativeElement.querySelectorAll('.app-tagify').length).toBe(1);
		expect(changes).not.toHaveBeenCalled();
		fixture.componentInstance.focus();
		tick();
		expect(document.querySelector('.app-tagify-dropdown')?.textContent).toContain('Frutas');
		fixture.destroy();
		tick(500);
	}));
});
