// Resolves the dashboard's range/from/to query params into a concrete
// { start, end } Date pair. "custom" requires explicit from/to; the named
// ranges (daily/weekly/monthly/yearly) are relative to "now".
function resolveDateRange({ range, from, to }) {
  const now = new Date();
  const end = to ? new Date(to) : now;
  end.setHours(23, 59, 59, 999);

  if (range === 'custom' && from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  const start = new Date(end);
  switch (range) {
    case 'daily':
      start.setDate(start.getDate() - 1);
      break;
    case 'weekly':
      start.setDate(start.getDate() - 7);
      break;
    case 'yearly':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'monthly':
    default:
      start.setMonth(start.getMonth() - 1);
      break;
  }
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

module.exports = { resolveDateRange };
