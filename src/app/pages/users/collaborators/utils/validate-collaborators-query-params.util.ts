import { ActivatedRoute, Router } from '@angular/router';

export const validateCollaboratorsQueryParams = (
  route: ActivatedRoute,
  params: Record<string, string>,
  router: Router,
  sortArray: string[],
): boolean => {
  let page = Number(params['page']);
  let limit = Number(params['limit']);
  let status = params['status'];
  let sort = params['sort'];
  const filter = params['filter'] ?? '';

  const validStatusValues = ['Todos', 'Activos', 'Inactivos'];
  const validLimitValues = [10, 20, 25];
  const validSortValues = sortArray ?? [];

  if (!Number.isInteger(page) || page < 1) {
    page = 1;
  }

  if (!validLimitValues.includes(limit)) {
    limit = 10;
  }

  if (!validStatusValues.includes(status)) {
    status = 'Todos';
  }

  if (!validSortValues.includes(sort)) {
    sort = validSortValues[0] ?? 'Predeterminado';
  }

  const sanitizedParams = {
    filter,
    page,
    limit,
    status,
    sort,
  };

  const currentKeys = Object.keys(params);
  const validKeys = Object.keys(sanitizedParams);

  const hasUnknownParams = currentKeys.some(
    (key) => !validKeys.includes(key),
  );

  const hasInvalidValues =
    filter !== (params['filter'] ?? '') ||
    page !== Number(params['page']) ||
    limit !== Number(params['limit']) ||
    status !== params['status'] ||
    sort !== params['sort'];

  if (hasUnknownParams || hasInvalidValues) {
    router.navigate([], {
      relativeTo: route,
      queryParams: sanitizedParams,
      replaceUrl: true,
    });

    return false;
  }

  return true;
};