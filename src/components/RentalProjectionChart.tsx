import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import type { RentalCollection } from '@/types';

interface Props {
  collections: RentalCollection[];
  expectedMonthly: number;
  targetMonths: number;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RentalProjectionChart({ collections, expectedMonthly, targetMonths }: Props) {
  const data = useMemo(() => {
    // Build a chronological lookup of actual collections
    const actualMap = new Map<string, number>();
    collections.forEach(c => {
      actualMap.set(`${c.year}-${c.month}`, Number(c.amount));
    });

    // Determine start month: earliest collection or current month
    const sorted = [...collections].sort((a, b) => a.year - b.year || a.month - b.month);
    const now = new Date();
    let startYear = sorted[0]?.year ?? now.getFullYear();
    let startMonth = sorted[0]?.month ?? (now.getMonth() + 1);

    let cumulativeActual = 0;
    let cumulativeExpected = 0;
    const rows: any[] = [];

    for (let i = 0; i < targetMonths; i++) {
      const m = ((startMonth - 1 + i) % 12) + 1;
      const y = startYear + Math.floor((startMonth - 1 + i) / 12);
      const key = `${y}-${m}`;
      const actual = actualMap.get(key) ?? null;
      cumulativeExpected += expectedMonthly;
      if (actual !== null) cumulativeActual += actual;

      // Determine if this month is in the past/current
      const isFuture = y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth() + 1);

      rows.push({
        label: `${MONTHS_SHORT[m - 1]} '${String(y).slice(-2)}`,
        actual: actual ?? 0,
        expected: expectedMonthly,
        cumulativeActual: actual !== null || !isFuture ? cumulativeActual : null,
        projection: cumulativeExpected,
      });
    }
    return rows;
  }, [collections, expectedMonthly, targetMonths]);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">📈 {targetMonths} মাসের প্রজেকশন চার্ট</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            actual: { label: 'প্রকৃত আয়', color: 'hsl(var(--success))' },
            expected: { label: 'প্রত্যাশিত', color: 'hsl(var(--muted-foreground))' },
            cumulativeActual: { label: 'মোট সংগৃহীত', color: 'hsl(var(--primary))' },
            projection: { label: 'লক্ষ্য মোট', color: 'hsl(var(--warning))' },
          }}
          className="h-[320px] w-full"
        >
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(data.length / 12) - 1)} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${v / 1000}k` : String(v)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="actual" fill="hsl(var(--success))" name="প্রকৃত মাসিক" radius={[4, 4, 0, 0]} />
            <ReferenceLine y={expectedMonthly} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: 'Target', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Line type="monotone" dataKey="cumulativeActual" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="মোট সংগৃহীত" />
            <Line type="monotone" dataKey="projection" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="লক্ষ্য মোট" />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
