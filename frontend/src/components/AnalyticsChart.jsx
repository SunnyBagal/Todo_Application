import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target, Flame, CheckCircle2, TrendingUp } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

const RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
];

function StatCard({ icon: Icon, label, value, hint, accentClass }) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardDescription>{label}</CardDescription>
        <Icon className={`h-4 w-4 ${accentClass ?? 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const created = payload.find((p) => p.dataKey === 'created')?.value ?? 0;
  const completed = payload.find((p) => p.dataKey === 'completed')?.value ?? 0;
  const dateLabel = new Date(label).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm px-3 py-2 text-xs space-y-1 min-w-[160px]">
      <div className="font-medium">{dateLabel}</div>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: 'var(--primary)', opacity: 0.3 }}
          />
          Total Todos
        </span>
        <span className="font-medium tabular-nums">{created}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: 'var(--primary)' }}
          />
          Completed
        </span>
        <span className="font-medium tabular-nums">{completed}</span>
      </div>
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="flex items-center justify-center gap-6 text-xs pt-3">
      <span className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{ background: 'var(--primary)', opacity: 0.3 }}
        />
        <span className="text-muted-foreground">Total Todos</span>
      </span>
      <span className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-sm"
          style={{ background: 'var(--primary)' }}
        />
        <span className="text-muted-foreground">Completed</span>
      </span>
    </div>
  );
}

function AnalyticsChart() {
  const [range, setRange] = useState('30');
  const days = Number(range);
  const { data, isLoading, isError } = useAnalytics(days);

  const rangeLabel =
    RANGES.find((r) => r.value === range)?.label.toLowerCase() ?? `last ${days} days`;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load analytics.</p>;
  }

  if (!data) return null;

  const series = data.dailySeries ?? [];
  const hasActivity = series.some((d) => d.created > 0 || d.completed > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Target}
          label="Completion Rate"
          value={`${data.completionRate}%`}
          hint={`${data.completedTodos} of ${data.totalTodos} todos`}
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${data.currentStreak} ${data.currentStreak === 1 ? 'day' : 'days'}`}
          hint={data.currentStreak > 0 ? 'Keep it up!' : 'Complete a todo to start'}
          accentClass={data.currentStreak > 0 ? 'text-orange-500' : undefined}
        />
        <StatCard
          icon={CheckCircle2}
          label="Total Completed"
          value={data.completedTodos}
          hint="All time"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Activity
              </CardTitle>
              <CardDescription>
                Showing total todos vs completed for the {rangeLabel}
              </CardDescription>
            </div>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[160px]" aria-label="Select time range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!hasActivity ? (
            <div className="py-16 text-center space-y-1.5">
              <p className="text-sm font-medium">No activity in the {rangeLabel}</p>
              <p className="text-xs text-muted-foreground">
                Add and complete some todos to see your trends here.
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={series}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="created-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="completed-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={32}
                    tickMargin={8}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        timeZone: 'UTC',
                      })
                    }
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                    content={<ChartTooltip />}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stroke="var(--primary)"
                    strokeOpacity={0.35}
                    strokeWidth={1.5}
                    fill="url(#created-fill)"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#completed-fill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <ChartLegend />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsChart;
