import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const allMonthlyData = [
  { month: "Jan", earnings: 4500 },
  { month: "Feb", earnings: 5200 },
  { month: "Mar", earnings: 4800 },
  { month: "Apr", earnings: 6100 },
  { month: "May", earnings: 7200 },
  { month: "Jun", earnings: 6800 },
  { month: "Jul", earnings: 7500 },
  { month: "Aug", earnings: 8100 },
  { month: "Sep", earnings: 7800 },
  { month: "Oct", earnings: 8900 },
  { month: "Nov", earnings: 9200 },
  { month: "Dec", earnings: 10500 },
];

const Revenue = () => {
  const [selectedMonths, setSelectedMonths] = useState("6");
  
  const monthlyData = allMonthlyData.slice(-parseInt(selectedMonths));
  const todayEarnings = 1250;
  const monthTotal = monthlyData.reduce((sum, item) => sum + item.earnings, 0);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Revenue Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">Track your shoe sales performance</p>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${todayEarnings.toLocaleString()}</div>
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
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${monthTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 6 months average
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Monthly Earnings</CardTitle>
            <Select value={selectedMonths} onValueChange={setSelectedMonths}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="9">Last 9 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
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
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Revenue;
