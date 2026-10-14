const PERIODS = {
  daily: { buckets: 7, label: 'day' },
  weekly: { buckets: 8, label: 'week' },
  monthly: { buckets: 12, label: 'month' },
  yearly: { buckets: 5, label: 'year' },
};

function startOfPeriod(date, period) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (period === 'weekly') {
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);
  } else if (period === 'monthly') {
    start.setDate(1);
  } else if (period === 'yearly') {
    start.setMonth(0, 1);
  }
  return start;
}

function movePeriod(date, period, amount) {
  const next = new Date(date);
  if (period === 'daily') next.setDate(next.getDate() + amount);
  if (period === 'weekly') next.setDate(next.getDate() + amount * 7);
  if (period === 'monthly') next.setMonth(next.getMonth() + amount);
  if (period === 'yearly') next.setFullYear(next.getFullYear() + amount);
  return next;
}

function keyFor(date, period) {
  if (period === 'yearly') return String(date.getFullYear());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  if (period === 'monthly') return `${year}-${month}`;
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function labelFor(date, period) {
  if (period === 'yearly') return String(date.getFullYear());
  if (period === 'monthly') return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

/** Groups saved entry weights into recent calendar buckets for the selected range. */
export function buildChartBuckets(entries, period, today = new Date()) {
  const settings = PERIODS[period] ?? PERIODS.weekly;
  const currentStart = startOfPeriod(today, period);
  const firstStart = movePeriod(currentStart, period, -(settings.buckets - 1));
  const buckets = Array.from({ length: settings.buckets }, (_, index) => {
    const start = movePeriod(firstStart, period, index);
    return { key: keyFor(start, period), label: labelFor(start, period), weight: 0, entries: 0 };
  });
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  entries.forEach((entry) => {
    const createdAt = new Date(entry.createdAt);
    if (Number.isNaN(createdAt.getTime())) return;
    const bucket = byKey.get(keyFor(startOfPeriod(createdAt, period), period));
    if (bucket) {
      bucket.weight += Number(entry.weight) || 0;
      bucket.entries += 1;
    }
  });

  return buckets;
}

export const chartPeriods = PERIODS;
