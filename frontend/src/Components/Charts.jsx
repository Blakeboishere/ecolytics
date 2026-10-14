import { useMemo, useState } from 'react';
import { buildChartBuckets, chartPeriods } from './chartData.js';

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

export function Charts({ entries, category }) {
  const [period, setPeriod] = useState('weekly');
  const buckets = useMemo(() => buildChartBuckets(entries, period), [entries, period]);
  const total = buckets.reduce((sum, bucket) => sum + bucket.weight, 0);
  const entryCount = buckets.reduce((sum, bucket) => sum + bucket.entries, 0);

  const width = 840;
  const height = 286;
  const left = 54;
  const right = 14;
  const top = 18;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxWeight = Math.max(0, ...buckets.map((bucket) => bucket.weight));
  const scaleMax = maxWeight > 0 ? maxWeight * 1.18 : 1;
  const slotWidth = plotWidth / buckets.length;
  const barWidth = Math.min(38, slotWidth * 0.58);

  return (
    <section className="history-chart-card" aria-labelledby="history-chart-title">
      <div className="history-chart-heading">
        <div>
          <p className="home-section-kicker">WEIGHT TREND</p>
          <h2 id="history-chart-title">{category} over time</h2>
          <p>Recorded weight grouped by time period</p>
        </div>
        <div className="history-chart-total">
          <strong>{total.toFixed(2)} kg</strong>
          <span>{entryCount} {entryCount === 1 ? 'entry' : 'entries'} in range</span>
        </div>
      </div>

      <div className="chart-period-control" role="group" aria-label="Chart time range">
        {Object.keys(chartPeriods).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={period === value}
            className={period === value ? 'is-selected' : ''}
            onClick={() => setPeriod(value)}
          >
            {value[0].toUpperCase() + value.slice(1)}
          </button>
        ))}
      </div>

      <div className="history-chart-scroll">
        <svg className="history-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="history-chart-title history-chart-description">
          <desc id="history-chart-description">{entryCount} {chartPeriods[period].label}-based entries totaling {total.toFixed(2)} kilograms for {category} during the selected recent range.</desc>
          {[0, 0.5, 1].map((fraction) => {
            const y = top + plotHeight * (1 - fraction);
            const value = scaleMax * fraction;
            return (
              <g key={fraction}>
                <line x1={left} x2={width - right} y1={y} y2={y} className="chart-grid-line" />
                <text x={left - 10} y={y + 4} textAnchor="end" className="chart-axis-label">{numberFormat.format(value)}</text>
              </g>
            );
          })}
          {buckets.map((bucket, index) => {
            const barHeight = bucket.weight > 0 ? (bucket.weight / scaleMax) * plotHeight : 0;
            const x = left + slotWidth * index + (slotWidth - barWidth) / 2;
            const y = top + plotHeight - barHeight;
            return (
              <g key={bucket.key}>
                {barHeight > 0 && <rect x={x} y={y} width={barWidth} height={barHeight} rx="7" className="chart-bar">
                  <title>{`${bucket.label}: ${bucket.weight.toFixed(2)} kg (${bucket.entries} ${bucket.entries === 1 ? 'entry' : 'entries'})`}</title>
                </rect>}
                <text x={left + slotWidth * index + slotWidth / 2} y={height - 13} textAnchor="middle" className="chart-axis-label">{bucket.label}</text>
              </g>
            );
          })}
          {entryCount === 0 && <text x={left + plotWidth / 2} y={top + plotHeight / 2} textAnchor="middle" className="chart-empty-label">No entries in this period</text>}
        </svg>
      </div>
      <p className="history-chart-note">Showing the most recent {chartPeriods[period].buckets} {chartPeriods[period].label}{chartPeriods[period].buckets === 1 ? '' : 's'}.</p>
    </section>
  );
}
