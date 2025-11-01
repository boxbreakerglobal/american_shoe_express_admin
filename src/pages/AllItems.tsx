import React, { useEffect, useState, useRef } from "react";
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
import { Package, Pencil, Trash2, Upload, X, ChevronDown } from "lucide-react";
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
  retailCost?: number;
  images: string | string[];
  size?: string;
  type?: string[];
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
  const [editRetailCost, setEditRetailCost] = useState(0);
  const [editSize, setEditSize] = useState("");
  const [editSelectedTypes, setEditSelectedTypes] = useState<string[]>([]);
  const [editTypeDropdownOpen, setEditTypeDropdownOpen] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<Array<{ file: File; preview: string }>>([]);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const typeOptions = [
    "Men",
    "Womens",
    "Unisex",
    "Children",
    "Teen",
    "Sneakers",
    "Dress",
    "Sandals",
    "Boots",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setEditTypeDropdownOpen(false);
      }
    };

    if (editTypeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editTypeDropdownOpen]);

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
    setEditRetailCost(item.retailCost || 0);
    setEditSize(item.size || "");
    setEditSelectedTypes(item.type || []);
    // Handle images - can be string or string array
    if (Array.isArray(item.images)) {
      setEditImages(item.images);
    } else {
      setEditImages([item.images]);
    }
    setEditImageFiles([]);
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      const imagePromises = fileArray.map((file) => {
        return new Promise<{ file: File; preview: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve({ file, preview: result });
          };
          reader.readAsDataURL(file);
        });
      });
      
      const newImages = await Promise.all(imagePromises);
      setEditImageFiles((prev) => [...prev, ...newImages]);
    }
  };

  const removeEditImage = (index: number, isFile: boolean = false) => {
    if (isFile) {
      setEditImageFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setEditImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const toggleEditType = (type: string) => {
    setEditSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    try {
      const formData = new FormData();
      const changedValues: any = {};
      
      if (editName !== editItem.name) {
        changedValues.name = editName;
        formData.append('name', editName);
      }
      if (editDescription !== editItem.description) {
        changedValues.description = editDescription;
        formData.append('description', editDescription);
      }
      if (editItemNumber !== editItem.itemNumber) {
        changedValues.itemNumber = editItemNumber;
        formData.append('itemNumber', editItemNumber);
      }
      if (editGender !== editItem.gender) {
        changedValues.Gender = editGender;
        formData.append('Gender', editGender);
      }
      if (editQuantity !== editItem.quantity) {
        changedValues.quantity = editQuantity;
        formData.append('quantity', String(editQuantity));
      }
      if (editCost !== editItem.cost) {
        changedValues.cost = editCost;
        formData.append('cost', String(editCost));
      }
      if (editRetailCost !== editItem.retailCost) {
        changedValues.retailCost = editRetailCost;
        formData.append('retailCost', String(editRetailCost));
      }
      if (editSize !== (editItem.size || "")) {
        changedValues.size = editSize;
        formData.append('size', editSize);
      }
      
      // Handle type array
      const currentTypes = editItem.type || [];
      const typesChanged = JSON.stringify(editSelectedTypes.sort()) !== JSON.stringify(currentTypes.sort());
      if (typesChanged) {
        changedValues.type = editSelectedTypes;
        formData.append('type', JSON.stringify(editSelectedTypes));
      }

      // Handle images - add new files if any
      if (editImageFiles.length > 0) {
        editImageFiles.forEach((img, index) => {
          formData.append(`images`, img.file);
        });
      }

      // If no new files but images changed, send the updated array
      const currentImages = Array.isArray(editItem.images) ? editItem.images : [editItem.images];
      const imagesChanged = JSON.stringify(editImages) !== JSON.stringify(currentImages);
      if (imagesChanged && editImageFiles.length === 0) {
        formData.append('images', JSON.stringify(editImages));
      }

      const response = await axiosInstance.put(`/update-shoe/${editItem._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        // Refresh items to get updated data from server
        const refreshResponse = await axiosInstance.get('/all-shoes');
        if (refreshResponse.data.success && refreshResponse.data.allItems) {
          setItems(refreshResponse.data.allItems);
        }
        
        toast({
          title: "Updated",
          description: "Item has been updated successfully.",
        });
        
        setEditItem(null);
        setEditImages([]);
        setEditImageFiles([]);
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
                  src={Array.isArray(item.images) ? (item.images[0] || "/placeholder.svg") : item.images}
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
                <Label htmlFor="edit-retailCost">Retail Cost ($)</Label>
                <Input
                  id="edit-retailCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editRetailCost}
                  onChange={(e) => setEditRetailCost(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-size">Size</Label>
                <Input
                  id="edit-size"
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value)}
                  placeholder="e.g., 9, 10, M, L, etc."
                />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <div className="relative" ref={typeDropdownRef}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setEditTypeDropdownOpen(!editTypeDropdownOpen)}
                  >
                    <span className="text-left">
                      {editSelectedTypes.length === 0
                        ? "Select types..."
                        : editSelectedTypes.join(", ")}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        editTypeDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                  {editTypeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {typeOptions.map((type) => (
                        <label
                          key={type}
                          className="flex items-center p-2 hover:bg-accent cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editSelectedTypes.includes(type)}
                            onChange={() => toggleEditType(type)}
                            className="mr-2 h-4 w-4"
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
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
                <Label htmlFor="edit-images">Images</Label>
                <div className="flex flex-col gap-4">
                  {/* Display existing images */}
                  {editImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {editImages.map((img, index) => (
                        <div
                          key={`existing-${index}`}
                          className="relative rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={img}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeEditImage(index, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Display new image files to be uploaded */}
                  {editImageFiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {editImageFiles.map((img, index) => (
                        <div
                          key={`new-${index}`}
                          className="relative rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={img.preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeEditImage(index, true)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Upload new images */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Input
                      id="edit-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                    <Label htmlFor="edit-images" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload additional images
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP up to 10MB each (multiple allowed)
                      </span>
                    </Label>
                  </div>
                </div>
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


