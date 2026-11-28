import { memo } from 'react';
import { useInsightsStats } from './insights-context';

const WIDTH = 320;
const CHART_HEIGHT = 100;
const TOP = 16;
const BOTTOM = 20;
const GAP = 8;

const shortDate = new Intl.DateTimeFormat('pl', { day: 'numeric', month: 'numeric' });
const longDate = new Intl.DateTimeFormat('pl', { day: 'numeric', month: 'long' });

function Timeline() {
  const stats = useInsightsStats();
  const max = Math.max(1, ...stats.days.map(({ count }) => count));
  const barWidth = (WIDTH - GAP * (stats.days.length - 1)) / stats.days.length;
  const summary = stats.days
    .map(({ day, count }) => `${longDate.format(day)}: ${count}`)
    .join(', ');

  return (
    <svg
      className="timeline"
      viewBox={`0 0 ${WIDTH} ${TOP + CHART_HEIGHT + BOTTOM}`}
      role="img"
      aria-label={`Liczba wiadomości w kolejnych dniach. ${summary}`}
    >
      {stats.days.map(({ day, count }, index) => {
        const height = (count / max) * CHART_HEIGHT;
        const x = index * (barWidth + GAP);
        const y = TOP + CHART_HEIGHT - height;
        return (
          <g key={day.getTime()}>
            <rect className="timeline__bar" x={x} y={y} width={barWidth} height={height} rx={2} />
            <text className="timeline__value" x={x + barWidth / 2} y={y - 4} textAnchor="middle">
              {count}
            </text>
            <text
              className="timeline__label"
              x={x + barWidth / 2}
              y={TOP + CHART_HEIGHT + 14}
              textAnchor="middle"
            >
              {shortDate.format(day)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default memo(Timeline);
