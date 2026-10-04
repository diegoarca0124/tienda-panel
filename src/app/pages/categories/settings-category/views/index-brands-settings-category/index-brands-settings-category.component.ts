import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { BrandInterface } from '@app/pages/brands/interfaces/data.interface';
import { CategoryInterface } from '@app/pages/categories/interfaces/data.interface';
import { GetBrandsByCategoryRESI } from '@app/pages/categories/interfaces/response.interface';
import { createEmptyCategory } from '@app/pages/categories/utils/empties.util';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { environment } from 'environments/environment.dev';
import { finalize, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';

@Component({
	selector: 'app-index-brands-settings-category',
	imports: [FallbackImageDirective, NotFoundComponent, RouterLink],
	templateUrl: './index-brands-settings-category.component.html',
	styleUrl: './index-brands-settings-category.component.css',
})
export class IndexBrandsSettingsCategoryComponent {
	private readonly destroy$ = new Subject<void>();
	public route = inject(ActivatedRoute);
	public categoryService = inject(CategoryService);
	public id: string = '';
	public isGetCategoryLoading: boolean = false;
	public categoryLoadError: Record<string, any> | null = null;
	public category: CategoryInterface = createEmptyCategory();

	public isGetBrandsLoading: boolean = false;
	public brands: BrandInterface[] = [];
	public readonly loadingCards = [0, 1, 2, 3, 4, 5];

	ngOnInit() {
		(this.route.parent ?? this.route).paramMap
			.pipe(
				switchMap((params: any) => {
					this.id = params.get('id') ?? '';
					this.brands = [];
					this.isGetCategoryLoading = true;
					this.categoryLoadError = null;

					return this.categoryService.getCategory(this.id).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						finalize(() => (this.isGetCategoryLoading = false)),
						tap({
							next: (response: { data: CategoryInterface; message: string }) => {
								this.category = response.data;
							},
							error: (error: HttpErrorResponse) => {
								this.setLoadError(error);
							},
						})
					);
				}),
				switchMap(() => this.initBrands$(this.id)),
				takeUntil(this.destroy$)
			)
			.subscribe({ error: () => {} });
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	initBrands$(id: string): Observable<GetBrandsByCategoryRESI> {
		this.isGetBrandsLoading = true;
		this.categoryLoadError = null;

		return this.categoryService.getBrandsByCategory(id).pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.isGetBrandsLoading = false)),
			tap({
				next: (response: GetBrandsByCategoryRESI) => {
					this.brands = response.data.map((brand) => ({
						...brand,
						logoUrl: brand.logoUrl ? `${environment.s3_public_url}/brands/medium/${brand.logoUrl}` : 'images/svg/blank-image.svg',
					}));
				},
				error: (error: HttpErrorResponse) => {
					this.setLoadError(error);
				},
			})
		);
	}

	initBrands(id: string): void {
		this.initBrands$(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({ error: () => {} });
	}

	private setLoadError(error: HttpErrorResponse): void {
		this.categoryLoadError = {
			message: error.error?.message || 'No pudimos completar la solicitud.',
			statusCode: error.error?.statusCode ?? error.status,
		};
	}
}
