import { ActivatedRoute, Router } from "@angular/router";

export const ValidateQPBrands= (
    route: ActivatedRoute,
    params: any,
    router: Router,
    sortArray: Array<string>,
    countriesArray: Array<string>,
): boolean => {
    //filter: string, page: number, status: string, limit: number, subcategoryIds
    let page = Number(params['page']);
    let limit = Number(params['limit']);
    let status = params['status'];
    let sort = params['sort'];
    let countries = params['countries'] ?? 'Todos';

    const validStatusValues = ['Todos','Activos','Inactivos'];
    const validLimitVales = [10,20,25];
    
    const validSort = sortArray ?? [];
    const validCountries = countriesArray ?? [];
    
    //corregir page
    if(!page || page < 1){
        page = 1;
    }

    //corregir limit
    if(!validLimitVales.includes(limit)){
        limit = 10;
    }

    //corregir status
    if(!validStatusValues.includes(status)){
        status = 'Todos';
    }

    if(!validSort.includes(sort)){
        sort = "Predeterminado";
    }

    if (countries !== 'Todos') {

        const countriesList = Array.isArray(countries)
            ? countries
            : countries
                .split(',')
                .map((country: string) => country.trim())
                .filter(Boolean);

        const validCountriesList = countriesList.filter((country: string) =>
            validCountries.includes(country)
        );

        countries = validCountriesList.length > 0
            ? validCountriesList
            : 'Todos';
    }

    const countriesQP = Array.isArray(countries)
        ? countries.join(',')
        : countries;

    const countriesChanged = countriesQP !== (params['countries'] ?? 'Todos');
    
    if(
        page !== Number(params['page']) ||
        limit !== Number(params['limit']) ||
        status !== params['status'] ||
        sort !== params['sort'] || 
        countriesChanged
    ){
        router.navigate([], {
            relativeTo: route,
            queryParams: {...params, page, limit, status, sort, countries: countriesQP},
            queryParamsHandling: 'merge',
            replaceUrl:true
        });
        return false;
    }
    return true;
}