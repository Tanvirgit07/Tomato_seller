/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useSession } from "next-auth/react";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

function SellerRevenueChart() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;

  const {
    data: revenueData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["seller-revenue-chart"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/summery/seller-revenue-chart`,{
            method : "GET",
            headers :{
                 Authorization: `Bearer ${token}`,
            }
        }
      );
      if (!res.ok) throw new Error("Failed to fetch revenue data");
      return res.json();
    },
  });

  // Format data for chart
  const chartData =
    revenueData?.revenueData?.map((item: any) => ({
      month: item.month,
      revenue: item.value,
    })) || [];

  // Calculate statistics
  const totalRevenue = chartData.reduce(
    (sum: number, item: any) => sum + item.revenue,
    0
  );
  const averageRevenue =
    chartData.length > 0 ? totalRevenue / chartData.length : 0;
  const maxRevenue = Math.max(...chartData.map((item: any) => item.revenue), 0);
  const maxRevenueMonth =
    chartData.find((item: any) => item.revenue === maxRevenue)?.month || "N/A";

  // Calculate trend (last 3 months vs previous 3 months)
  const recentMonths = chartData.slice(-3);
  const previousMonths = chartData.slice(-6, -3);
  const recentTotal = recentMonths.reduce(
    (sum: number, item: any) => sum + item.revenue,
    0
  );
  const previousTotal = previousMonths.reduce(
    (sum: number, item: any) => sum + item.revenue,
    0
  );

  const trendPercentage =
    previousTotal > 0
      ? (((recentTotal - previousTotal) / previousTotal) * 100).toFixed(1)
      : recentTotal > 0
      ? 100
      : 0;
  const isPositiveTrend = Number(trendPercentage) >= 0;

  // Get current month and year for description
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const months = chartData.map((item: any) => item.month);
  const dateRange =
    months.length > 0
      ? `${months[0]} - ${months[months.length - 1]}`
      : `Jan ${currentYear} - Dec ${currentYear}`;

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardContent className="pt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
            <AlertCircle className="text-red-600 w-6 h-6" />
            <div>
              <h3 className="text-red-900 font-semibold">
                Failed to load revenue data
              </h3>
              <p className="text-red-700 text-sm">
                Please try refreshing the page
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Monthly Revenue
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {dateRange}
            </CardDescription>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-700 font-medium mb-1">
              Total Revenue
            </p>
            <p className="text-xl font-bold text-blue-900">
              ৳{totalRevenue.toLocaleString("en-BD")}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-purple-700 font-medium mb-1">
              Average/Month
            </p>
            <p className="text-xl font-bold text-purple-900">
              ৳
              {averageRevenue.toLocaleString("en-BD", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <p className="text-xs text-orange-700 font-medium mb-1">
              Peak Month
            </p>
            <p className="text-xl font-bold text-orange-900">
              {maxRevenue > 0
                ? `৳${maxRevenue.toLocaleString("en-BD")}`
                : "N/A"}
            </p>
            {maxRevenue > 0 && (
              <p className="text-xs text-orange-600 mt-0.5">
                {maxRevenueMonth}
              </p>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) => `৳${value}`}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                content={
                  <ChartTooltipContent
                    formatter={(value) => [
                      `৳${Number(value).toLocaleString("en-BD")}`,
                      "Revenue",
                    ]}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm border-t pt-4">
        <div className="flex items-center gap-2 leading-none font-medium text-foreground">
          {isPositiveTrend ? (
            <>
              <span className="text-green-600">
                Trending up by {Math.abs(Number(trendPercentage))}%
              </span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </>
          ) : (
            <>
              <span className="text-orange-600">
                Trending down by {Math.abs(Number(trendPercentage))}%
              </span>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none flex items-center gap-2 text-xs">
          <Calendar className="h-3 w-3" />
          Comparing last 3 months with previous period
        </div>
        {totalRevenue === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2 w-full">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> No revenue data available yet. Start making
              sales to see your revenue growth!
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default SellerRevenueChart;
