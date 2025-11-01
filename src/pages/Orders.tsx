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
  Package,
  Clock,
  DollarSign,
  Calendar,
} from "lucide-react";
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
}

// Dummy orders
const dummyOrders: Order[] = [
  {
    _id: "1",
    id: "ORD-001",
    name: "John Doe",
    phone: "0244000000",
    items: [
      { itemNumber: "1", name: "Running Shoes", quantity: 2, price: 250 },
      { itemNumber: "2", name: "Socks", quantity: 5, price: 20 },
      { itemNumber: "3", name: "T-Shirt", quantity: 1, price: 50 },
    ],
    total: 250 * 2 + 5 * 20 + 50,
    location: "Accra",
    orderMode: "Delivery",
    date: new Date().toISOString(),
    status: "Pending",
  },
  {
    _id: "2",
    id: "ORD-002",
    name: "Jane Smith",
    phone: "0244111111",
    items: [
      { itemNumber: "1", name: "Sneakers", quantity: 1, price: 300 },
      { itemNumber: "2", name: "Laces", quantity: 2, price: 10 },
    ],
    total: 300 + 2 * 10,
    location: "Kumasi",
    orderMode: "Pickup",
    date: new Date().toISOString(),
    status: "Packaged",
  },
];

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setOrders(dummyOrders);

    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://api.exchangerate.host/latest?base=GHS&symbols=USD"
        );
        const data = await response.json();
        setExchangeRate(data.rates.USD);
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        setExchangeRate(0);
      }
    };
    fetchExchangeRate();
  }, []);

  const convertToUSD = (value: number) =>
    exchangeRate ? (value * exchangeRate).toFixed(2) : "0.00";

  const getStatusBadge = (status: Order["status"]) => {
    const variants: Record<string, string> = {
      Completed: "default",
      Pending: "secondary",
      Cancelled: "destructive",
      Packaged: "outline",
      Shipped: "success",
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  const todayTotal = 1000;
  const todayOrdersCount = 5;
  const monthTotal = 4000;
  const monthOrdersCount = 20;

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
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
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
                <td>${i.price.toFixed(2)}</td>
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

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Orders Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">Track and manage customer orders</p>
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
              ₵{todayTotal} (~<span className="text-red-700">${convertToUSD(todayTotal)}</span>)
            </div>
            <p className="text-xs text-muted-foreground mt-1">{todayOrdersCount} orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{monthTotal} (~<span className="text-red-700">${convertToUSD(monthTotal)}</span>)
            </div>
            <p className="text-xs text-muted-foreground mt-1">{monthOrdersCount} orders this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrdersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthOrdersCount}</div>
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
                  <TableHead>Order #</TableHead>
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
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.items.map((i) => i.itemNumber).join(", ")}</TableCell>
                    <TableCell>{order.items.map((i) => i.name).join(", ")}</TableCell>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>{order.location}</TableCell>
                    <TableCell>₵{order.total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="flex gap-2">
                      <Select
                        onValueChange={(val) =>
                          updateOrderStatus(order.id, val as Order["status"])
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
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => setSelectedOrder(order)}>
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePrint(order)}>
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
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
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
                  <span>{new Date(selectedOrder.date).toLocaleString()}</span>
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
                        <TableCell>₵{(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

export default OrdersPage;
