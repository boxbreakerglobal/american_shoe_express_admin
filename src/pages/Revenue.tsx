import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import axios from "axios";

const Revenue = () => {
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; earnings: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch today's earnings and orders
        const dailyResponse = await axios.get("/daily-earnings-and-orders");
        if (dailyResponse.data) {
          setTodayEarnings(dailyResponse.data.totalEarnings || 0);
          setTodayOrders(dailyResponse.data.totalOrders || 0);
        }

        // Fetch monthly earnings
        const monthlyResponse = await axios.get("/monthly-earnings-and-orders");
        if (monthlyResponse.data) {
          setMonthlyEarnings(monthlyResponse.data.totalEarnings || 0);
        }

        // Fetch month-by-month earnings for graph
        const chartResponse = await axios.get("/month-by-month-earnings");
        if (chartResponse.data && chartResponse.data.data) {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          
          // Transform the API data to match the expected format
          const apiData = chartResponse.data.data;
          
          // Create a map of all 12 months with default 0 earnings
          const fullYearData = monthNames.map((month, index) => {
            // Try to find matching data from API by index
            const apiItem = apiData[index];
            return {
              month: month,
              earnings: apiItem?.earnings || apiItem?.totalEarnings || apiItem || 0
            };
          });
          
          setMonthlyData(fullYearData);
        }
      } catch (error) {
        console.error("Failed to fetch revenue data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Revenue Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">Track your shoe sales performance</p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "Loading..." : `₵${todayEarnings.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-primary flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12.5% from yesterday
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "Loading..." : todayOrders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Orders placed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? "Loading..." : `₵${monthlyEarnings.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month's earnings
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px] md:h-[350px]">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300} className="md:h-[350px]">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₵${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: any) => [`₵${value.toLocaleString()}`, 'Earnings']}
                />
                <Line 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Revenue;
