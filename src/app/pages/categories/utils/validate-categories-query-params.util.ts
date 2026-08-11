import { ActivatedRoute, Params, Router } from '@angular/router';

export const validateCategoriesQueryParams = (
  route: ActivatedRoute,
  params: Params,
  router: Router,
  sortArray: string[] = [],
  configurationsArray: string[] = [],
): boolean => {
  const filter = params['filter'] ?? '';

  let page = Number(params['page']);
  let limit = Number(params['limit']);
  let status = params['status'];
  let sort = params['sort'];
  let configurations = params['configurations'] ?? 'Predeterminado';

  const validStatusValues = ['Todos', 'Activos', 'Inactivos'];
  const validLimitValues = [10, 20, 25];

  // Validar página
  if (!Number.isInteger(page) || page < 1) {
    page = 1;
  }

  // Validar límite
  if (!validLimitValues.includes(limit)) {
    limit = 10;
  }

  // Validar estado
  if (!validStatusValues.includes(status)) {
    status = 'Todos';
  }

  // Validar orden
  if (!sortArray.includes(sort)) {
    sort = sortArray[0] ?? 'Predeterminado';
  }

  // Validar configuraciones
  if (configurations !== 'Predeterminado') {
    const configurationsList = Array.isArray(configurations)
      ? configurations
      : String(configurations)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    const validConfigurationsList = [
      ...new Set(
        configurationsList.filter((item) =>
          configurationsArray.includes(item),
        ),
      ),
    ];

    configurations =
      validConfigurationsList.length > 0
        ? validConfigurationsList.join(',')
        : 'Predeterminado';
  }

  const sanitizedParams = {
    filter,
    page,
    limit,
    status,
    sort,
    configurations,
  };

  const allowedKeys = Object.keys(sanitizedParams);

  const hasUnknownParams = Object.keys(params).some(
    (key) => !allowedKeys.includes(key),
  );

  const hasInvalidValues =
    filter !== (params['filter'] ?? '') ||
    page !== Number(params['page']) ||
    limit !== Number(params['limit']) ||
    status !== params['status'] ||
    sort !== params['sort'] ||
    configurations !==
      (params['configurations'] ?? 'Predeterminado');

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