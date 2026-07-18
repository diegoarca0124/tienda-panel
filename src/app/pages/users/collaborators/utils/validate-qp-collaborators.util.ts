import { ActivatedRoute, Router } from "@angular/router";

export const ValidateQPCollaborators= (
    route: ActivatedRoute,
    params: any,
    router: Router,
    sortArray?: Array<string>
): boolean => {
    //filter: string, page: number, status: string, limit: number, subcategoryIds
    let page = Number(params['page']);
    let limit = Number(params['limit']);
    let status = params['status'];
    let sort = params['sort'];

    const validStatusValues = ['Todos','Activos','Inactivos'];
    const validLimitVales = [10,20,25];
    const validSort = sortArray ?? [];

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

    if(
        page !== Number(params['page']) ||
        limit !== Number(params['limit']) ||
        status !== params['status'] ||
        sort !== params['sort']
    ){
        router.navigate([], {
            relativeTo: route,
            queryParams: {...params, page, limit, status, sort},
            queryParamsHandling: 'merge',
            replaceUrl:true
        });
        return false;
    }
    return true;
}