"use client"

import { Line, LineChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartTooltipContent, ChartContainer, ChartConfig } from "@/components/ui/chart"

const chartData = [
  { week: "Week 1", wpm: 25 },
  { week: "Week 2", wpm: 28 },
  { week: "Week 3", wpm: 27 },
  { week: "Week 4", wpm: 32 },
  { week: "Week 5", wpm: 35 },
  { week: "Week 6", wpm: 38 },
  { week: "Week 7", wpm: 42 },
  { week: "Week 8", wpm: 45 },
]

const chartConfig = {
  wpm: {
    label: "WPM",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function FluencyChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 6)}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <defs>
             <linearGradient id="fillWpm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <Line
            dataKey="wpm"
            type="monotone"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{
              fill: "hsl(var(--primary))",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
