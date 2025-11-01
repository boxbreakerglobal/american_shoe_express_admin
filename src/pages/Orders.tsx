import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, TrendingUp, Clock, DollarSign, Calendar } from "lucide-react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  name?: string;
  quantity?: number;
  price?: number;
  [key: string]: any;
}

interface Order {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  items: OrderItem[];
  total: number;
  location?: string;
  orderMode?: string;
  date: string;
  status?: "pending" | "completed" | "cancelled";
}

const Orders = () => {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todayEarnings, setTodayEarnings] = useState<number>(0);
  const [todayOrdersCount, setTodayOrdersCount] = useState<number>(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(0);
  const [weeklyOrdersCount, setWeeklyOrdersCount] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/all-orders");
        if (response.data && response.data.allOrders) {
          // Map the API response to match our Order interface
          const mappedOrders: Order[] = response.data.allOrders.map((order: any) => ({
            _id: order._id,
            id: order._id || `ORD-${Math.random().toString(36).substr(2, 9)}`,
            name: order.name || "",
            phone: order.phone || "",
            items: Array.isArray(order.items) ? order.items : [],
            total: order.total || 0,
            location: order.location || "",
            orderMode: order.orderMode || "",
            date: order.date || new Date().toISOString(),
            status: "completed" as const, // Default status, adjust as needed
          }));
          setOrders(mappedOrders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDashboardData = async () => {
      try {
        // Fetch today's earnings and orders
        const dailyResponse = await axios.get("/daily-earnings-and-orders");
        if (dailyResponse.data) {
          setTodayEarnings(dailyResponse.data.totalEarnings || 0);
          setTodayOrdersCount(dailyResponse.data.totalOrders || 0);
        }

        // Fetch monthly earnings
        const monthlyResponse = await axios.get("/monthly-earnings-and-orders");
        if (monthlyResponse.data) {
          setMonthlyEarnings(monthlyResponse.data.totalEarnings || 0);
        }

        // Fetch weekly orders
        const weeklyResponse = await axios.get("/weekly-orders");
        if (weeklyResponse.data) {
          setWeeklyOrdersCount(weeklyResponse.data.totalOrders || 0);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchOrders();
    fetchDashboardData();
  }, [toast]);
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= todayStart;
  });

  const weekOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= weekStart;
  });

  const filteredOrders = selectedMonth === "all" 
    ? orders 
    : orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === parseInt(selectedMonth);
      });

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0);

  // Calculate monthly revenue
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= currentMonthStart;
  });
  const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);

  const getStatusBadge = (status: Order["status"]) => {
    const actualStatus = status || "completed";
    const variants = {
      completed: "default",
      pending: "secondary",
      cancelled: "destructive",
    };
    return (
      <Badge 
        variant={variants[actualStatus] as any}
      >
        {actualStatus}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Orders Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">Track and manage customer orders</p>
      </div>

      {/* Earnings Cards */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₵{todayEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayOrdersCount} orders today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₵{monthlyEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyOrders.length} orders this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today & This Week Stats */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayOrdersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue: ₵{todayEarnings.toLocaleString()}
            </p>
            <p className="text-xs text-primary flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              {todayOrders.filter(o => o.status === "completed").length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{weeklyOrdersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue: ₵{weekRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-primary flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              {weekOrders.filter(o => o.status === "completed").length} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Orders Details */}
      {todayOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayOrders.map((order) => (
                    <TableRow key={order.id || order._id}>
                      <TableCell className="font-medium">{order.id || order._id}</TableCell>
                      <TableCell>{order.name}</TableCell>
                      <TableCell className="hidden lg:table-cell">{order.phone}</TableCell>
                      <TableCell className="text-right">₵{order.total}</TableCell>
                      <TableCell>{getStatusBadge(order.status || "completed")}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(order.date).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table with Month Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Orders</CardTitle>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="9">October 2025</SelectItem>
                <SelectItem value="8">September 2025</SelectItem>
                <SelectItem value="7">August 2025</SelectItem>
                <SelectItem value="6">July 2025</SelectItem>
                <SelectItem value="5">June 2025</SelectItem>
                <SelectItem value="4">May 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders found for the selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id || order._id}>
                      <TableCell className="font-medium">{order.id || order._id}</TableCell>
                      <TableCell>{order.name}</TableCell>
                      <TableCell className="hidden lg:table-cell">{order.phone}</TableCell>
                      <TableCell className="text-right">₵{order.total}</TableCell>
                      <TableCell>{getStatusBadge(order.status || "completed")}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id || selectedOrder?._id}</DialogTitle>
            <DialogDescription>
              Complete order information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{selectedOrder.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span>{selectedOrder.phone}</span>
                </div>
                {selectedOrder.location && (
                  <div className="flex justify-between">
                    <span className="font-medium">Location:</span>
                    <span>{selectedOrder.location}</span>
                  </div>
                )}
                {selectedOrder.orderMode && (
                  <div className="flex justify-between">
                    <span className="font-medium">Order Mode:</span>
                    <span>{selectedOrder.orderMode}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(selectedOrder.status || "completed")}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{new Date(selectedOrder.date).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Items Ordered:</h4>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <div>
                          <p className="font-medium">{item.name || "Item"}</p>
                          {item.quantity && (
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          )}
                        </div>
                        {item.price && item.quantity && (
                          <span className="font-medium">₵{(item.price * item.quantity).toFixed(2)}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No items found</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold">₵{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
