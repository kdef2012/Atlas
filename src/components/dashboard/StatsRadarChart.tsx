"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CATEGORY_COLORS, CATEGORY_ICONS, type SkillCategory, type User } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { Sparkles } from "lucide-react";

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
    icon: CATEGORY_ICONS.Social  
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
  const firestore = useFirestore();
  const { user } = useUser();
  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData, isLoading } = useDoc<User>(userRef);

  if (isLoading || !userData) {
    return <StatsRadarChartSkeleton />;
  }

  const chartData = [
    { category: "Physical", value: userData.physicalStat, fill: CATEGORY_COLORS.Physical },
    { category: "Mental", value: userData.mentalStat, fill: CATEGORY_COLORS.Mental },
    { category: "Social", value: userData.socialStat, fill: CATEGORY_COLORS.Social },
    { category: "Practical", value: userData.practicalStat, fill: CATEGORY_COLORS.Practical },
    { category: "Creative", value: userData.creativeStat, fill: CATEGORY_COLORS.Creative },
  ];

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
            const Icon = CATEGORY_ICONS[category] || Sparkles;
            const color = CATEGORY_COLORS[category] || 'hsl(var(--primary))';

            return (
                <g transform={`translate(${x},${y})`}>
                    <foreignObject x={-12} y={-30} width={24} height={24}>
                        <div style={{ color }}>
                            <Icon className="h-6 w-6" />
                        </div>
                    </foreignObject>
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
