"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CATEGORY_COLORS, CATEGORY_ICONS, type SkillCategory } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

const chartData = [
  { category: "Physical", value: 85, fill: CATEGORY_COLORS.Physical },
  { category: "Mental", value: 90, fill: CATEGORY_COLORS.Mental },
  { category: "Social", value: 60, fill: CATEGORY_COLORS.Social },
  { category: "Practical", value: 75, fill: CATEGORY_COLORS.Practical },
  { category: "Creative", value: 50, fill: CATEGORY_COLORS.Creative },
];

const chartConfig = {
  value: {
    label: "Value",
  },
  Physical: {
    label: "Physical",
    color: CATEGORY_COLORS.Physical,
    icon: CATEGORY_ICONS.Physical,
  },
  Mental: {
    label: "Mental",
    color: CATEGORY_COLORS.Mental,
    icon: CATEGORY_ICONS.Mental,
  },
  Social: {
    label: "Social",
    color: CATEGORY_COLORS.Social,
    icon: CATEGORY_ICONS.Social,
  },
  Practical: {
    label: "Practical",
    color: CATEGORY_COLORS.Practical,
    icon: CATEGORY_ICONS.Practical,
  },
  Creative: {
    label: "Creative",
    color: CATEGORY_COLORS.Creative,
    icon: CATEGORY_ICONS.Creative,
  },
} satisfies ChartConfig;

export function StatsRadarChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <PolarAngleAxis dataKey="category" tick={(props) => {
            const { x, y, payload } = props;
            const category = payload.value as SkillCategory;
            const Icon = CATEGORY_ICONS[category];
            const color = CATEGORY_COLORS[category];

            return (
                <g transform={`translate(${x},${y})`}>
                    <Icon style={{ fill: color, color: color }} className="h-6 w-6 text-white translate-x-[-12px] translate-y-[-30px]" />
                    <text
                        x={0}
                        y={0}
                        dy={16}
                        textAnchor="middle"
                        fill="hsl(var(--foreground))"
                        className="text-sm font-medium"
                    >
                        {payload.value}
                    </text>
                </g>
            );
        }}/>
        <PolarGrid gridType="polygon" />
        <Radar
          dataKey="value"
          fill="hsl(var(--primary))"
          fillOpacity={0.4}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{
            r: 4,
            fillOpacity: 1,
          }}
        />
      </RadarChart>
    </ChartContainer>
  );
}

export function StatsRadarChartSkeleton() {
    return <Skeleton className="mx-auto aspect-square h-[300px] rounded-full" />;
}
