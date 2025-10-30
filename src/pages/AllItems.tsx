import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Pencil, Trash2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";

interface ShoeItem {
  _id: string;
  name: string;
  description: string;
  itemNumber: string;
  gender?: string;
  quantity?: number;
  cost?: number;
  image: string;
  createdAt: string;
}

const AllItems = () => {
  const [items, setItems] = useState<ShoeItem[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<ShoeItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editItemNumber, setEditItemNumber] = useState("");
  const [editGender, setEditGender] = useState("unisex");
  const [editQuantity, setEditQuantity] = useState(0);
  const [editCost, setEditCost] = useState(0);
  const [editImage, setEditImage] = useState("");
  const [editImagePreview, setEditImagePreview] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axiosInstance.get('/all-shoes');
        if (response.data.success && response.data.allItems) {
          setItems(response.data.allItems);
        }
      } catch (error) {
        console.error("Failed to fetch items:", error);
        toast({
          title: "Error",
          description: "Failed to load items.",
          variant: "destructive",
        });
      }
    };

    fetchItems();
  }, [toast]);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await axiosInstance.delete(`/delete-shoe/${deleteId}`);
      
      if (response.data.success) {
        const updatedItems = items.filter((item) => item._id !== deleteId);
        setItems(updatedItems);
        
        toast({
          title: "Deleted",
          description: "Item has been removed from your inventory.",
        });
        
        setDeleteId(null);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete item.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (item: ShoeItem) => {
    setEditItem(item);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditItemNumber(item.itemNumber);
    setEditGender(item.gender || "unisex");
    setEditQuantity(item.quantity || 0);
    setEditCost(item.cost || 0);
    setEditImage(item.image);
    setEditImagePreview(item.image);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditImage(result);
        setEditImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditImage = () => {
    setEditImage("");
    setEditImagePreview("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    const changedValues: any = {};
    
    if (editName !== editItem.name) changedValues.name = editName;
    if (editDescription !== editItem.description) changedValues.description = editDescription;
    if (editItemNumber !== editItem.itemNumber) changedValues.itemNumber = editItemNumber;
    if (editGender !== editItem.gender) changedValues.Gender = editGender;
    if (editQuantity !== editItem.quantity) changedValues.quantity = editQuantity;
    if (editCost !== editItem.cost) changedValues.cost = editCost;
    if (editImage !== editItem.image) changedValues.image = editImage;

    try {
      const response = await axiosInstance.put(`/update-shoe/${editItem._id}`, changedValues);

      if (response.data.success) {
        const updatedItems = items.map((item) =>
          item._id === editItem._id
            ? { ...item, ...changedValues, gender: changedValues.Gender || item.gender, cost: changedValues.cost !== undefined ? changedValues.cost : item.cost }
            : item
        );

        setItems(updatedItems);
        
        toast({
          title: "Updated",
          description: "Item has been updated successfully.",
        });
        
        setEditItem(null);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update item.",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">All Items</h1>
        <p className="text-sm md:text-base text-muted-foreground mb-8">Manage your shoe inventory</p>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No items yet</h3>
          <p className="text-muted-foreground">Add your first shoe to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">All Items</h1>
      <p className="text-sm md:text-base text-muted-foreground mb-8">
        Manage your shoe inventory ({items.length} {items.length === 1 ? "item" : "items"})
      </p>

      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item._id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="aspect-square overflow-hidden bg-muted relative group">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleEditClick(item)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setDeleteId(item._id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg text-foreground mb-2">{item.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {item.description}
              </p>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">{item.itemNumber}</Badge>
                {item.cost !== undefined && item.cost !== null && (
                  <span className="text-sm font-semibold text-foreground">${Number(item.cost).toFixed(2)}</span>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">
                Added {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item
              from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Shoe</DialogTitle>
              <DialogDescription>
                Update the details for this shoe item. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-itemNumber">Item Number</Label>
                <Input
                  id="edit-itemNumber"
                  value={editItemNumber}
                  onChange={(e) => setEditItemNumber(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity Available</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cost">Cost ($)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editCost}
                  onChange={(e) => setEditCost(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Gender</Label>
                <RadioGroup value={editGender} onValueChange={setEditGender}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="edit-male" />
                    <Label htmlFor="edit-male" className="font-normal cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="edit-female" />
                    <Label htmlFor="edit-female" className="font-normal cursor-pointer">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unisex" id="edit-unisex" />
                    <Label htmlFor="edit-unisex" className="font-normal cursor-pointer">Unisex</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Image</Label>
                {!editImagePreview ? (
                  <div className="flex flex-col gap-2">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="hidden"
                      />
                      <Label htmlFor="edit-image" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload a new image
                        </span>
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={editImagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeEditImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Input
                      id="edit-image-replace"
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                    <Label 
                      htmlFor="edit-image-replace"
                      className="absolute bottom-2 right-2 cursor-pointer"
                    >
                      <Button type="button" size="sm" variant="secondary" asChild>
                        <span className="flex items-center gap-2">
                          <Upload className="h-3 w-3" />
                          Replace
                        </span>
                      </Button>
                    </Label>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllItems;
