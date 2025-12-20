/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
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
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function SellerAnalyticsChart() {
  const [timeRange, setTimeRange] = useState<"daily" | "monthly">("daily");
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;

  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["seller-analytics", timeRange],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/summery/seller-analytics-chart?type=${timeRange}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      return res.json();
    },
  });

  // Format data for chart
  const chartData =
    analyticsData?.salesData?.map((sale: any, index: number) => ({
      date: sale.date,
      sales: sale.value,
      revenue: analyticsData.revenueData[index]?.value || 0,
    })) || [];

  // Calculate statistics
  const totalSales = chartData.reduce(
    (sum: number, item: any) => sum + item.sales,
    0
  );
  const totalRevenue = chartData.reduce(
    (sum: number, item: any) => sum + item.revenue,
    0
  );

  // Calculate trend (comparing first half vs second half)
  const midPoint = Math.floor(chartData.length / 2);
  const firstHalfRevenue = chartData
    .slice(0, midPoint)
    .reduce((sum: number, item: any) => sum + item.revenue, 0);
  const secondHalfRevenue = chartData
    .slice(midPoint)
    .reduce((sum: number, item: any) => sum + item.revenue, 0);
  const trendPercentage =
    firstHalfRevenue > 0
      ? (
          ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) *
          100
        ).toFixed(1)
      : 0;
  const isPositiveTrend = Number(trendPercentage) >= 0;

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (timeRange === "daily") {
      const [year, month, day] = dateStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      const [year, month] = dateStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
            <AlertCircle className="text-red-600 w-6 h-6" />
            <div>
              <h3 className="text-red-900 font-semibold">
                Failed to load analytics data
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
    <Card className="col-span-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
        <div>
          <CardTitle className="text-2xl font-bold">Sales Analytics</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            {timeRange === "daily" ? "Daily" : "Monthly"} sales and revenue
            overview
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setTimeRange("daily")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeRange === "daily"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setTimeRange("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              timeRange === "monthly"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-700 font-medium">Total Sales</p>
                <p className="text-2xl font-bold text-blue-900">{totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-green-700 font-medium">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-green-900">
                  ৳{totalRevenue.toLocaleString("en-BD")}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`bg-gradient-to-br ${
              isPositiveTrend
                ? "from-purple-50 to-purple-100 border-purple-200"
                : "from-orange-50 to-orange-100 border-orange-200"
            } rounded-lg p-4 border`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`${
                  isPositiveTrend ? "bg-purple-500" : "bg-orange-500"
                } p-2 rounded-lg`}
              >
                {isPositiveTrend ? (
                  <TrendingUp className="w-5 h-5 text-white" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <p
                  className={`text-xs ${
                    isPositiveTrend ? "text-purple-700" : "text-orange-700"
                  } font-medium`}
                >
                  Trend
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isPositiveTrend ? "text-purple-900" : "text-orange-900"
                  }`}
                >
                  {isPositiveTrend ? "+" : ""}
                  {trendPercentage}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatDate}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{
                  stroke: "#94a3b8",
                  strokeWidth: 1,
                  strokeDasharray: "5 5",
                }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => formatDate(label)}
                    formatter={(value, name) => {
                      if (name === "revenue") {
                        return [
                          `৳${Number(value).toLocaleString("en-BD")}`,
                          "Revenue",
                        ];
                      }
                      return [value, "Sales"];
                    }}
                  />
                }
              />
              <Line
                dataKey="sales"
                type="monotone"
                stroke="var(--color-sales)"
                strokeWidth={3}
                dot={{ fill: "var(--color-sales)", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                strokeWidth={3}
                dot={{ fill: "var(--color-revenue)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium text-foreground">
              {isPositiveTrend ? (
                <>
                  Trending up by {Math.abs(Number(trendPercentage))}%
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </>
              ) : (
                <>
                  Trending down by {Math.abs(Number(trendPercentage))}%
                  <TrendingDown className="h-4 w-4 text-orange-600" />
                </>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none text-xs">
              <Calendar className="h-3 w-3" />
              Showing {timeRange === "daily" ? "daily" : "monthly"} performance
              data
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default SellerAnalyticsChart;
