"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "../ui/skeleton"

interface ConfidenceMeterProps {
  value?: number;
  isLoading?: boolean;
}

const defaultValue = 75;

export function ConfidenceMeter({ value = defaultValue, isLoading }: ConfidenceMeterProps) {
  const chartData = [
    { name: "Filled", value: value, fill: "hsl(var(--accent))" },
    { name: "Empty", value: 100 - value, fill: "hsl(var(--muted))" },
  ]

  if (isLoading) {
    return <Skeleton className="h-[150px] w-[150px] rounded-full mx-auto" />
  }

  return (
    <ChartContainer
      config={{}}
      className="mx-auto aspect-square h-[150px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={60}
          startAngle={90}
          endAngle={-270}
          cornerRadius={5}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {chartData[0].value.toLocaleString()}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground"
                    >
                      Confident
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
