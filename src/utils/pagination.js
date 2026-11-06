const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const AppError = require('./AppError');

// Lit ?page=1&limit=20 et refuse les valeurs invalides.
function parsePagination(query = {}) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? DEFAULT_LIMIT : Number(query.limit);
  const valid =
    Number.isInteger(page) && page >= 1 && Number.isInteger(limit) && limit >= 1 && limit <= MAX_LIMIT;
  if (!valid) {
    throw new AppError(400, 'Pagination invalide', [`page >= 1 et 1 <= limit <= ${MAX_LIMIT}`]);
  }
  return { page, limit, skip: (page - 1) * limit };
}

const buildPagination = ({ page, limit }, total) => ({ page, limit, total, pages: Math.ceil(total / limit) });

module.exports = { parsePagination, buildPagination };
