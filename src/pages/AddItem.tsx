import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Upload, X, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";

const AddItem = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [itemNumber, setItemNumber] = useState("");
  const [gender, setGender] = useState("unisex");
  const [quantity, setQuantity] = useState(0);
  const [cost, setCost] = useState(0);
  const [size, setSize] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const { toast } = useToast();
  const typeDropdownRef = useRef<HTMLDivElement>(null);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Revoke object URLs to prevent memory leaks
      return updated;
    });
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setTypeDropdownOpen(false);
      }
    };

    if (typeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [typeDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('itemNumber', itemNumber);
      formData.append('Gender', gender);
      formData.append('quantity', String(quantity));
      formData.append('cost', String(cost));
      formData.append('size', size);
      formData.append('type', JSON.stringify(selectedTypes));
      images.forEach((img, index) => {
        formData.append(`images`, img.file);
      });

      const response = await axiosInstance.post('/add-shoe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast({
          title: "Success!",
          description: "Item has been added to your inventory.",
        });

        setName("");
        setDescription("");
        setItemNumber("");
        setGender("unisex");
        setQuantity(0);
        setCost(0);
        setSize("");
        setSelectedTypes([]);
        setImages([]);
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to add item.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Add New Item</h1>
        <p className="text-sm md:text-base text-muted-foreground mb-8">Add a new shoe to your inventory</p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full md:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              Add New Shoe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Shoe</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new shoe item. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Air Max 90"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the shoe..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="itemNumber">Item Number</Label>
                  <Input
                    id="itemNumber"
                    value={itemNumber}
                    onChange={(e) => setItemNumber(e.target.value)}
                    placeholder="e.g., SKU-001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity Available</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    placeholder="e.g., 50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 99.99"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g., 9, 10, M, L, etc."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <div className="relative" ref={typeDropdownRef}>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                    >
                      <span className="text-left">
                        {selectedTypes.length === 0
                          ? "Select types..."
                          : `${selectedTypes.length} type${selectedTypes.length !== 1 ? "s" : ""} selected`}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          typeDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                    {typeDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {typeOptions.map((type) => (
                          <label
                            key={type}
                            className="flex items-center p-2 hover:bg-accent cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTypes.includes(type)}
                              onChange={() => toggleType(type)}
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
                  <RadioGroup value={gender} onValueChange={setGender}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unisex" id="unisex" />
                      <Label htmlFor="unisex" className="font-normal cursor-pointer">Unisex</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Images</Label>
                  <div className="flex flex-col gap-4">
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden border border-border"
                          >
                            <img
                              src={img.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label htmlFor="image" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload shoe images
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
                <Button type="submit">Save Item</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AddItem;
