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
  },
  Mental: {
    label: "Mental",
    color: CATEGORY_COLORS.Mental,
  },
  Social: {
    label: "Social",
    color: CATEGORY_COLORS.Social,
  },
  Practical: {
    label: "Practical",
    color: CATEGORY_COLORS.Practical,
  },
  Creative: {
    label: "Creative",
    color: CATEGORY_COLORS.Creative,
  },
} satisfies ChartConfig;

/**
 * Custom Tick component for the Radar Chart.
 * Refactored to handle React instantiation gracefully and prevent Error #130.
 */
function CustomTick(props: any) {
  const { x, y, payload } = props;
  const category = payload?.value as SkillCategory;
  
  if (!x || !y || !payload) return null;

  const Icon = (category && CATEGORY_ICONS[category]) ? CATEGORY_ICONS[category] : Sparkles;
  const color = (category && CATEGORY_COLORS[category]) ? CATEGORY_COLORS[category] : 'hsl(var(--primary))';

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-12} y={-35} width={24} height={24}>
        <div style={{ color }} className="flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
      </foreignObject>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
        className="fill-muted-foreground tracking-tighter"
      >
        {payload.value}
      </text>
    </g>
  );
}

export function StatsRadarChart() {
  const firestore = useFirestore();
  const { user } = useUser();
  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData, isLoading } = useDoc<User>(userRef);

  if (isLoading || !userData) {
    return <StatsRadarChartSkeleton />;
  }

  const chartData = [
    { category: "Physical", value: userData.physicalStat || 5, fill: CATEGORY_COLORS.Physical },
    { category: "Mental", value: userData.mentalStat || 5, fill: CATEGORY_COLORS.Mental },
    { category: "Social", value: userData.socialStat || 5, fill: CATEGORY_COLORS.Social },
    { category: "Practical", value: userData.practicalStat || 5, fill: CATEGORY_COLORS.Practical },
    { category: "Creative", value: userData.creativeStat || 5, fill: CATEGORY_COLORS.Creative },
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
        {/* tick component passed by reference to let Recharts handle props injection */}
        <PolarAngleAxis dataKey="category" tick={CustomTick} />
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
