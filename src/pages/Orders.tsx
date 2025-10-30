import { useState } from "react";
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
import { Package, TrendingUp, Clock, Eye, CheckCircle2 } from "lucide-react";
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
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  date: string;
}

const mockOrders: Order[] = [
  { id: "ORD-001", customerName: "John Doe", phoneNumber: "+1234567890", items: [{ name: "Air Jordan 1 Retro High", quantity: 1, price: 180 }], total: 180, status: "completed", date: "2025-10-29T09:30:00Z" },
  { id: "ORD-002", customerName: "Jane Smith", phoneNumber: "+1234567891", items: [{ name: "Nike Air Max 90", quantity: 2, price: 140 }], total: 280, status: "completed", date: "2025-10-29T11:15:00Z" },
  { id: "ORD-003", customerName: "Mike Johnson", phoneNumber: "+1234567892", items: [{ name: "Adidas Ultraboost 22", quantity: 1, price: 190 }], total: 190, status: "pending", date: "2025-10-29T14:20:00Z" },
  { id: "ORD-004", customerName: "Sarah Williams", phoneNumber: "+1234567893", items: [{ name: "New Balance 574", quantity: 1, price: 90 }], total: 90, status: "completed", date: "2025-10-28T16:45:00Z" },
  { id: "ORD-005", customerName: "Chris Brown", phoneNumber: "+1234567894", items: [{ name: "Converse Chuck Taylor", quantity: 3, price: 70 }], total: 210, status: "completed", date: "2025-10-27T10:30:00Z" },
  { id: "ORD-006", customerName: "Emily Davis", phoneNumber: "+1234567895", items: [{ name: "Vans Old Skool", quantity: 2, price: 70 }], total: 140, status: "completed", date: "2025-10-26T13:20:00Z" },
  { id: "ORD-007", customerName: "David Wilson", phoneNumber: "+1234567896", items: [{ name: "Air Jordan 1 Retro High", quantity: 1, price: 180 }], total: 180, status: "cancelled", date: "2025-10-25T15:10:00Z" },
  { id: "ORD-008", customerName: "Lisa Anderson", phoneNumber: "+1234567897", items: [{ name: "Nike Air Max 90", quantity: 1, price: 140 }], total: 140, status: "completed", date: "2025-10-24T09:00:00Z" },
  { id: "ORD-009", customerName: "Tom Martinez", phoneNumber: "+1234567898", items: [{ name: "Adidas Ultraboost 22", quantity: 2, price: 190 }], total: 380, status: "completed", date: "2025-10-23T11:30:00Z" },
  { id: "ORD-010", customerName: "Nancy Taylor", phoneNumber: "+1234567899", items: [{ name: "New Balance 574", quantity: 1, price: 90 }], total: 90, status: "completed", date: "2025-10-22T14:00:00Z" },
];

const Orders = () => {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  
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

  const handleStatusToggle = (orderId: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const newStatus: Order["status"] = order.status === "completed" ? "cancelled" : "completed";
        return { ...order, status: newStatus };
      }
      return order;
    });
    setOrders(updatedOrders);
    
    const order = orders.find(o => o.id === orderId);
    const newStatus = order?.status === "completed" ? "cancelled" : "completed";
    toast({
      title: "Status updated",
      description: `Order status changed to ${newStatus}.`,
    });
  };

  const getStatusBadge = (status: Order["status"], orderId: string) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      cancelled: "destructive",
    };
    return (
      <Badge 
        variant={variants[status] as any}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          handleStatusToggle(orderId);
        }}
      >
        {status}
      </Badge>
    );
  };

  const handleMarkAsCompleted = (orderId: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: "completed" as const } : order
    );
    setOrders(updatedOrders);
    toast({
      title: "Order completed",
      description: "Order has been marked as completed.",
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Orders Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">Track and manage customer orders</p>
      </div>

      {/* Today & This Week Stats */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{todayOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue: ${todayRevenue.toLocaleString()}
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
            <div className="text-2xl font-bold text-foreground">{weekOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue: ${weekRevenue.toLocaleString()}
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
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="hidden lg:table-cell">{order.phoneNumber}</TableCell>
                      <TableCell className="text-right">${order.total}</TableCell>
                      <TableCell>{getStatusBadge(order.status, order.id)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(order.date).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsCompleted(order.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders found for the selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="hidden lg:table-cell">{order.phoneNumber}</TableCell>
                      <TableCell className="text-right">${order.total}</TableCell>
                      <TableCell>{getStatusBadge(order.status, order.id)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsCompleted(order.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Complete order information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span>{selectedOrder.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(selectedOrder.status, selectedOrder.id)}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span>{new Date(selectedOrder.date).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Items Ordered:</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-medium">${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold">${selectedOrder.total}</span>
              </div>

              {selectedOrder.status === "pending" && (
                <Button 
                  className="w-full"
                  onClick={() => {
                    handleMarkAsCompleted(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Completed
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
