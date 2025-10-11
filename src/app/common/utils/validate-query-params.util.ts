import { ActivatedRoute, Router } from "@angular/router";

export const ValidateQueryParams = (
    route: ActivatedRoute,
    params: any,
    router: Router
): boolean => {
    let page = Number(params['page']);
    let limit = Number(params['limit']);
    let status = params['status'];

    const validStatusValues = ['Todos','Activos','Inactivos'];
    const validLimitVales = [10,20,25];

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

    // si alguno cambio, redirecciona
    if(
        page !== Number(params['page']) ||
        limit !== Number(params['limit']) ||
        status !== params['status']
    ){
        router.navigate([], {
            relativeTo: route,
            queryParams: {...params, page, limit, status},
            queryParamsHandling: 'merge',
            replaceUrl:true
        });
        return false;
    }
    return true;
}