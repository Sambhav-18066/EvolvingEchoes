"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "../ui/skeleton";

const defaultData = [
  { date: "05-01", uniqueWords: 120 },
  { date: "05-02", uniqueWords: 140 },
  { date: "05-03", uniqueWords: 110 },
  { date: "05-04", uniqueWords: 160 },
  { date: "05-05", uniqueWords: 150 },
  { date: "05-06", uniqueWords: 175 },
]

const chartConfig = {
  uniqueWords: {
    label: "Unique Words",
    color: "hsl(var(--secondary-foreground))",
  },
} satisfies ChartConfig

interface LexicalRichnessChartProps {
  data?: { date: string; uniqueWords: number }[];
  isLoading?: boolean;
}

export function LexicalRichnessChart({ data = defaultData, isLoading }: LexicalRichnessChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[100px] w-full" />;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[100px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{top: 0, right: 0, bottom: 0, left: 0}}>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={[0, 'dataMax + 50']} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="uniqueWords" fill="hsl(var(--secondary))" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
