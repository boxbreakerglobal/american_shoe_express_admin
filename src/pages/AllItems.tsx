import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  gender?: string | string[];
  Gender?: string[];
  quantity?: number;
  cost?: number;
  retailCost?: number;
  images: string | string[];
  size?: string;
  type?: string[];
  shoeStatus?: string[];
  AmericanSize?: string;
  GhanaianSize?: string;
  createdAt: string;
}

const AllItems = () => {
  const [items, setItems] = useState<ShoeItem[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<ShoeItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editItemNumber, setEditItemNumber] = useState("");
  const [editGender, setEditGender] = useState<string[]>([]);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editCost, setEditCost] = useState(0);
  const [editRetailCost, setEditRetailCost] = useState(0);
  const [editSize, setEditSize] = useState("");
  const [editSelectedTypes, setEditSelectedTypes] = useState<string[]>([]);
  const [editShoeStatus, setEditShoeStatus] = useState<string[]>([]);
  const [editAmericanSize, setEditAmericanSize] = useState("");
  const [editGhanaianSize, setEditGhanaianSize] = useState("");
  const [editTypeDropdownOpen, setEditTypeDropdownOpen] = useState(false);
  const [editShoeStatusDropdownOpen, setEditShoeStatusDropdownOpen] = useState(false);
  const [editGenderDropdownOpen, setEditGenderDropdownOpen] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<Array<{ file: File; preview: string }>>([]);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const shoeStatusDropdownRef = useRef<HTMLDivElement>(null);
  const genderDropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [conversionRate, setConversionRate] = useState<number>(0);

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
  const genderOptions = ["Men", "Womens", "Unisex", "Children", "Teen"];
  const shoeStatusOptions = ["Brand New", "Slightly Used", "Used"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setEditTypeDropdownOpen(false);
      }
      if (
        shoeStatusDropdownRef.current &&
        !shoeStatusDropdownRef.current.contains(event.target as Node)
      ) {
        setEditShoeStatusDropdownOpen(false);
      }
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target as Node)
      ) {
        setEditGenderDropdownOpen(false);
      }
    };

    if (editTypeDropdownOpen || editShoeStatusDropdownOpen || editGenderDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editTypeDropdownOpen, editShoeStatusDropdownOpen, editGenderDropdownOpen]);

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

    const fetchConversionRate = async () => {
      try {
        const response = await axiosInstance.get('/conversion-rate');
        if (response.data.success && response.data.rate) {
          setConversionRate(response.data.rate);
        } else if (response.data?.rate) {
          setConversionRate(response.data.rate);
        }
      } catch (error) {
        console.error("Failed to fetch conversion rate:", error);
        // Try alternative endpoint
        try {
          const altResponse = await axiosInstance.get('/exchange-rate');
          if (altResponse.data?.rate) {
            setConversionRate(altResponse.data.rate);
          }
        } catch (altError) {
          console.error("Failed to fetch exchange rate:", altError);
          // Use a default rate if API fails (GHS to USD, approximate)
          setConversionRate(12.0);
        }
      }
    };

    fetchItems();
    fetchConversionRate();
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
    // Handle Gender - can be string, string[], or in Gender field
    if (item.Gender && Array.isArray(item.Gender)) {
      setEditGender(item.Gender);
    } else if (Array.isArray(item.gender)) {
      setEditGender(item.gender);
    } else if (typeof item.gender === 'string') {
      setEditGender([item.gender]);
    } else {
      setEditGender([]);
    }
    setEditQuantity(item.quantity || 0);
    setEditCost(item.cost || 0);
    setEditRetailCost(item.retailCost || 0);
    setEditSize(item.size || "");
    setEditSelectedTypes(item.type || []);
    setEditShoeStatus(item.shoeStatus || []);
    // setEditAmericanSize(item.size || "");
    setEditGhanaianSize(item.GhanaianSize || "");
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
      const fileArray = Array.from(files) as File[];
      
      const imagePromises = fileArray.map((file: File) => {
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

  const toggleEditGender = (genderValue: string) => {
    setEditGender((prev) =>
      prev.includes(genderValue)
        ? prev.filter((g) => g !== genderValue)
        : [...prev, genderValue]
    );
  };

  const toggleEditShoeStatus = (status: string) => {
    setEditShoeStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
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
      // Handle Gender array
      const currentGender = editItem.Gender || (Array.isArray(editItem.gender) ? editItem.gender : (editItem.gender ? [editItem.gender] : []));
      const genderChanged = JSON.stringify(editGender.sort()) !== JSON.stringify(currentGender.sort());
      if (genderChanged) {
        changedValues.Gender = editGender;
        formData.append('Gender', JSON.stringify(editGender));
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
      if (editAmericanSize !== (editItem.AmericanSize || "")) {
        changedValues.AmericanSize = editAmericanSize;
        formData.append('americanSize', editAmericanSize);
      }
      if (editGhanaianSize !== (editItem.GhanaianSize || "")) {
        changedValues.GhanaianSize = editGhanaianSize;
        formData.append('GhanaianSize', editGhanaianSize);
      }
      
      // Handle shoeStatus array
      const currentShoeStatus = editItem.shoeStatus || [];
      const shoeStatusChanged = JSON.stringify(editShoeStatus.sort()) !== JSON.stringify(currentShoeStatus.sort());
      if (shoeStatusChanged) {
        changedValues.shoeStatus = editShoeStatus;
        formData.append('shoeStatus', JSON.stringify(editShoeStatus));
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
        setEditGender([]);
        setEditShoeStatus([]);
        setEditAmericanSize("");
        setEditGhanaianSize("");
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

    <div className="overflow-x-auto mt-6">
  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
    <thead className="bg-gray-500 text-white">
      <tr>
        <th className="px-4 py-2 text-left font-light">Image</th>
        <th className="px-4 py-2 text-left font-light">Item No.</th>
        <th className="px-7 py-2 text-left font-light">Name</th>
        <th className="px-4 py-2 text-left font-light">Gender</th>
        <th className="px-4 py-2 text-left font-light">Type</th>
        <th className="px-4 py-2 text-left font-light">Size</th>
        <th className="px-4 py-2 text-left font-light">Price</th>
        <th className="px-1 py-2 text-left font-light">Date Added</th>
        <th className="px-4 py-2 text-center font-light">Actions</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr
          key={item._id}
          className="border-t hover:bg-[#F5F5DC]/50 transition"
        >
          {/* Image column */}
          <td className="px-4 py-3 text-left">
            <img
              src={
                Array.isArray(item.images)
                  ? item.images[0] || "/placeholder.svg"
                  : item.images || "/placeholder.svg"
              }
              alt={item.name}
              className="w-16 h-16 object-cover rounded-md border border-gray-200"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </td>

          {/* Name */}
          <td className="px-4 py-3 text-left">
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
              {item.itemNumber}
            </span>
          </td>
          <td className="px-4 py-3 font-medium text-[#8B4513] text-left">
            {item.name}
          </td>
          
          <td className="px-4 py-3 font-medium text-[#8B4513]">
            {item.Gender.map((item)=>{
              return(
                <p className="mr-1">{item}</p>
              )
            })}
          </td>

          {/* Item number */}
          <td className="px-4 py-3 font-medium text-[#8B4513]">
            {item.type[0]}
          </td>
          <td className="px-4 py-3 font-medium text-[#8B4513]">
           {`US ${item.size} GH ${item.GhanaianSize}`}
          </td>
          {/* Cost */}
          <td className="px-4 py-3 text-sm flex gap-3 mt-5">
            <div>{item.cost !== undefined && conversionRate > 0
              ? `$${(Number(item.cost) / conversionRate).toFixed(2)}`
              : "-"}
              </div>
              <div>{`₵${item.cost}`}</div>
          </td>

          {/* Date */}
          <td className="px-1 py-3 text-sm text-gray-600">
            {new Date(item.createdAt).toLocaleDateString()}
          </td>
         

        

         

          {/* Action buttons */}
          <td className="px-4 py-3 text-center">
            <div className="flex justify-center gap-2">
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
          </td>
        </tr>
      ))}
    </tbody>
  </table>
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
                <Label htmlFor="edit-cost">Cost (₵)</Label>
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
                <Label htmlFor="edit-retailCost">Retail Cost (₵)</Label>
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
                <Label htmlFor="edit-size">American Size</Label>
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
                <div className="relative" ref={genderDropdownRef}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setEditGenderDropdownOpen(!editGenderDropdownOpen)}
                  >
                    <span className="text-left">
                      {editGender.length === 0
                        ? "Select gender..."
                        : editGender.join(", ")}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        editGenderDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                  {editGenderDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {genderOptions.map((genderValue) => (
                        <label
                          key={genderValue}
                          className="flex items-center p-2 hover:bg-accent cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editGender.includes(genderValue)}
                            onChange={() => toggleEditGender(genderValue)}
                            className="mr-2 h-4 w-4"
                          />
                          <span className="text-sm">{genderValue}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Shoe Status</Label>
                <div className="relative" ref={shoeStatusDropdownRef}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setEditShoeStatusDropdownOpen(!editShoeStatusDropdownOpen)}
                  >
                    <span className="text-left">
                      {editShoeStatus.length === 0
                        ? "Select shoe status..."
                        : editShoeStatus.join(", ")}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        editShoeStatusDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                  {editShoeStatusDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {shoeStatusOptions.map((status) => (
                        <label
                          key={status}
                          className="flex items-center p-2 hover:bg-accent cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={editShoeStatus.includes(status)}
                            onChange={() => toggleEditShoeStatus(status)}
                            className="mr-2 h-4 w-4"
                          />
                          <span className="text-sm">{status}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-ghanaianSize">Ghanaian Size</Label>
                <Input
                  id="edit-ghanaianSize"
                  value={editGhanaianSize}
                  onChange={(e) => setEditGhanaianSize(e.target.value)}
                  placeholder="e.g., 42, 43, etc."
                />
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


