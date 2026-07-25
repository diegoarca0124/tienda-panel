import { ActivatedRoute, Router } from "@angular/router";

export const validateCategoriesQueryParams= (
    route: ActivatedRoute,
    params: any,
    router: Router,
    sortArray?: Array<string>,
    configurationsArray?: Array<string>,
): boolean => {
    //filter: string, page: number, status: string, limit: number, subcategoryIds
    let page = Number(params['page']);
    let limit = Number(params['limit']);
    let status = params['status'];
    let sort = params['sort'];
    let configurations = params['configurations'] ?? 'Predeterminado';

    const validStatusValues = ['Todos','Activos','Inactivos'];
    const validLimitVales = [10,20,25];
    const validSort = sortArray ?? [];
    const validConfigurations = configurationsArray ?? [];

    //corregir page
    if (isNaN(page) || page < 1) {
        page = 1;
    }

    if (isNaN(limit) || !validLimitVales.includes(limit)) {
        limit = 10;
    }

    //corregir status
    if(!validStatusValues.includes(status)){
        status = 'Todos';
    }

    if (validSort.length > 0 && !validSort.includes(sort)) {
        sort = validSort[0];
    }
    console.log(configurations);
    if (configurations !== 'Predeterminado') {
        console.log('aca');
        
        const configurationsList = Array.isArray(configurations)
            ? configurations
            : configurations
                .split(',')
                .map((item: string) => item.trim())
                .filter(Boolean);

        const validConfigurationsList = configurationsList.filter((item: string) =>
            validConfigurations.includes(item)
        );

        configurations = validConfigurationsList.length > 0
            ? validConfigurationsList
            : 'Predeterminado';
    }

    const configurationsQP = Array.isArray(configurations)
        ? configurations.join(',')
        : configurations;

    const configurationsChanged = configurationsQP !== (params['configurations'] ?? 'Predeterminado');
    console.log(configurationsQP);
    
    if(
        page !== Number(params['page']) ||
        limit !== Number(params['limit']) ||
        status !== params['status'] ||
        sort !== params['sort'] ||
        configurationsChanged
    ){
        router.navigate([], {
            relativeTo: route,
            queryParams: {...params, page, limit, status, sort, configurations: configurationsQP},
            queryParamsHandling: 'merge',
            replaceUrl:true
        });
        return false;
    }
    return true;
}