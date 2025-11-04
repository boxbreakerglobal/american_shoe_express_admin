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
import { Package, Clock, DollarSign, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import axios from "axios";

interface OrderItem {
  itemNumber: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  id: string;
  name: string;
  phone: string;
  items: OrderItem[];
  total: number;
  location?: string;
  orderMode?: string;
  date: string;
  status: "Pending" | "Completed" | "Cancelled" | "Packaged" | "Shipped";
  createdAt:Date
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [todaysEarnings, setTodaysEarnings] = useState<number>(0);
  const [todaysOrders, setTodaysOrders] = useState<number>(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(0);
  const [monthlyOrders, setMonthlyOrders] = useState<number>(0);
  const [weeklyOrders, setWeeklyOrders] = useState<number>(0);




  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/all-orders");
        const allOrders = response?.data?.allOrders ?? [];

        // Normalize if necessary
        const formattedOrders = allOrders.map((order: any) => ({
          _id: order._id ?? "",
          id: order.orderId ?? "",
          name: order.name ?? "",
          phone: order.phone ?? "",
          items: order.items ?? [],
          total: order.total ?? 0,
          location: order.location ?? "",
          orderMode: order.orderMode ?? "",
          date: order.date ?? new Date().toISOString(),
          status: order.status ?? "Pending",
          createdAt:order.createdAt
        }));

        setOrders(formattedOrders);
        console.log(response)
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://api.exchangerate.host/latest?base=GHS&symbols=USD"
        );
        const data = await response.json();
        console.log(data)
        setExchangeRate(data.rates.USD);
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
      }
    };

    const fetchDailyEarnings = async () => {
    try {
      const response = await axios.get("/daily-earnings-and-orders");
      setTodaysEarnings(response.data.totalEarnings ?? 0);
      setTodaysOrders(response.data.totalOrders ?? 0);
    } catch (error) {
      console.error("Failed to fetch today's earnings:", error);
    }
  };

  const fetchMonthlyEarnings = async () => {
    try {
      const response = await axios.get("/monthly-earnings-and-orders");
      setMonthlyEarnings(response.data.totalEarnings ?? 0);
      setMonthlyOrders(response.data.totalOrders ?? 0);
    } catch (error) {
      console.error("Failed to fetch monthly earnings:", error);
    }
  };
  const fetchWeeklyOrders = async () => {
    try {
      const response = await axios.get("/weekly-orders");
      setWeeklyOrders(response.data.totalOrders ?? 0);
    } catch (error) {
      console.error("Failed to fetch weekly orders:", error);
    }
  };

  // fetchOrders();
  // fetchExchangeRate();
  
  fetchOrders();
  fetchExchangeRate();
  fetchDailyEarnings();
  fetchMonthlyEarnings();
  fetchWeeklyOrders();
  }, []);

  const convertToUSD = (value: number) =>
    exchangeRate ? (value * exchangeRate).toFixed(2) : "0.00";
    const getStatusBadge = (status: Order["status"]) => {
      const colorClasses: Record<string, string> = {
        Pending: "bg-yellow-400 text-black",
        Packaged: "bg-blue-500 text-white",
        Shipped: "bg-green-500 text-white",
      };

      return (
        <span
          className={`px-2 py-1 text-xs rounded-md font-semibold ${colorClasses[status]}`}
        >
          {status}
        </span>
      );
    };


  const handlePrint = (order: Order) => {
    const printContent = `
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; }
            h2 { font-size: 18px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid #000; }
            th, td { padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>American Shoe Express</h1>
          <h2>Invoice #: ${order.id}</h2>
          <p><strong>Customer:</strong> ${order.name}</p>
          <p><strong>Phone:</strong> ${order.phone}</p>
          <p><strong>Location:</strong> ${order.location || "N/A"}</p>
          <p><strong>Order Mode:</strong> ${order.orderMode || "N/A"}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Item #</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Price (GHS)</th>
                <th>Total (GHS)</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (i) => `
              <tr>
                <td>${i.itemNumber}</td>
                <td>${i.name}</td>
                <td>${i.quantity}</td>
                <td>${Number(i.price).toFixed(2)}</td>
                <td>${(i.price * i.quantity).toFixed(2)}</td>
              </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">Total: ₵${order.total.toFixed(
            2
          )} (~$${convertToUSD(order.total)})</div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };
  const handleDeliveryPrint = (order: Order) => {
    const printContent = `
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; }
            h2 { font-size: 18px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid #000; }
            th, td { padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>American Shoe Express</h1>
          <h2>Invoice #: ${order.id}</h2>
          <p><strong>Customer:</strong> ${order.name}</p>
          <p><strong>Phone:</strong> ${order.phone}</p>
          <p><strong>Location:</strong> ${order.location || "N/A"}</p>
          <p><strong>Order Mode:</strong> ${order.orderMode || "N/A"}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          
       
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
  try {
    // Update UI immediately
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status } : o))
    );

    // Send update to backend
    await axios.put(`/update-order-status/${orderId}/${status}`);

  } catch (error) {
    console.error("Failed to update status:", error);
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-medium text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Orders Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Track and manage customer orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{todaysEarnings.toFixed(2)} (~
              <span className="text-red-700">${convertToUSD(todaysEarnings)}</span>)
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todaysOrders} orders today
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{monthlyEarnings.toFixed(2)} (~
              <span className="text-red-700">${convertToUSD(monthlyEarnings)}</span>)
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyOrders} orders this month
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyOrders}</div>
          </CardContent>
        </Card>

      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead>Order #</TableHead> */}
                  <TableHead>Item #</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    {/* <TableCell>{order.id}</TableCell> */}
                    <TableCell>
                      {order.items.map((i) => i.itemNumber).join(", ")}
                    </TableCell>
                    <TableCell>
                      {order.items.map((i) => i.name).join(", ")}
                    </TableCell>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>{order.location}</TableCell>
                    <TableCell>₵{order.total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="flex gap-2">
                    <Select
                      onValueChange={(val) =>
                        updateOrderStatus(order._id, val as Order["status"])
                      }
                      defaultValue={order.status}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder={order.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Packaged">Packaged</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                      </SelectContent>
                    </Select>

                      <Button
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeliveryPrint(order)}
                      >
                        Delivery
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(order)}
                      >
                        Print
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              Order Details - {selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>Complete order information</DialogDescription>
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
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Items Ordered:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item #</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price (GHS)</TableHead>
                      <TableHead>Total (GHS)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.itemNumber}>
                        <TableCell>{item.itemNumber}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₵{item.price}</TableCell>
                        <TableCell>
                          ₵{(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold">
                  ₵{selectedOrder.total.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
