import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";

const AddItem = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [itemNumber, setItemNumber] = useState("");
  const [gender, setGender] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(0);
  const [cost, setCost] = useState(0);
  const [retailCost, setRetailCost] = useState(0);
  const [size, setSize] = useState("");
  const [GhanaSize, setGhanaSize] = useState("");
  const [shoeStatus, setShoeStatus] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [images, setImages] = useState<Array<{ file: File; preview: string }>>([]);
  const { toast } = useToast();

  const genderOptions = ["Men", "Womens", "Unisex", "Children", "Teen"];
  const shoeStatusOptions = ["Brand New", "Slightly Used", "Used"];
  const typeOptions = ["Sneakers", "Dress", "Boots", "Sandals", "Sliders"];

  // image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const imagePromises = fileArray.map(
        (file) =>
          new Promise<{ file: File; preview: string }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ file, preview: reader.result as string });
            reader.readAsDataURL(file);
          })
      );
      const newImages = await Promise.all(imagePromises);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // toggles
  const toggleGender = (genderValue: string) => {
    setGender((prev) =>
      prev.includes(genderValue) ? prev.filter((g) => g !== genderValue) : [...prev, genderValue]
    );
  };

  // radios but still store as array
  const selectShoeStatus = (status: string) => {
    setShoeStatus([status]);
  };

  const selectType = (type: string) => {
    setSelectedTypes([type]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("itemNumber", itemNumber);
      formData.append("Gender", JSON.stringify(gender));
      formData.append("quantity", String(quantity));
      formData.append("cost", String(cost));
      formData.append("retailCost", String(retailCost));
      formData.append("size", size);
      formData.append("GhanaianSize", GhanaSize);
      formData.append("shoeStatus", JSON.stringify(shoeStatus));
      formData.append("type", JSON.stringify(selectedTypes));
      images.forEach((img) => formData.append("images", img.file));

      const response = await axiosInstance.post("/add-shoe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast({
          title: "Success!",
          description: "Item has been added to your inventory.",
        });

        // reset form
        setName("");
        setDescription("");
        setItemNumber("");
        setGender([]);
        setQuantity(0);
        setCost(0);
        setRetailCost(0);
        setSize("");
        setGhanaSize("");
        setShoeStatus([]);
        setSelectedTypes([]);
        setImages([]);
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
        description: error.response?.data?.message || "Failed to add item.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Add New Item</h1>
      <p className="text-sm md:text-base text-muted-foreground mb-8">
        Add a new shoe to your inventory
      </p>

      {/* Two-column layout */}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="itemNumber">Item Number</Label>
            <Input
              id="itemNumber"
              value={itemNumber}
              onChange={(e) => setItemNumber(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2">
          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="retailCost">Retail Cost (₵)</Label>
            <Input
              id="retailCost"
              type="text"
              value={retailCost}
              onChange={(e) => setRetailCost(parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cost">Cost (₵)</Label>
            <Input
              id="cost"
              type="text"
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          </div>
        <div className="flex gap-2">
          <div className="grid gap-2">
            <Label htmlFor="size">American Size</Label>
            <Input
              id="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              required
              placeholder="e.g., 9, 10, M, L"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="GhanaSize">Ghana Size</Label>
            <Input
              id="GhanaSize"
              value={GhanaSize}
              onChange={(e) => setGhanaSize(e.target.value)}
              placeholder="e.g., 42, 43"
            />
          </div>
        </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Shoe Status (Radio) */}
          <div className="grid gap-2">
            <Label>Shoe Status</Label>
            {shoeStatusOptions.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`status-${status}`}
                  name="shoeStatus"
                  checked={shoeStatus.includes(status)}
                  onChange={() => selectShoeStatus(status)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`status-${status}`} className="cursor-pointer">
                  {status}
                </Label>
              </div>
            ))}
          </div>

          {/* Type (Radio) */}
          <div className="grid gap-2">
            <Label>Type</Label>
            {typeOptions.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`type-${type}`}
                  name="type"
                  checked={selectedTypes.includes(type)}
                  onChange={() => selectType(type)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`type-${type}`} className="cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>

          {/* Gender (checkboxes) */}
          <div className="grid gap-2">
            <Label>Gender</Label>
            {genderOptions.map((genderValue) => (
              <div key={genderValue} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`gender-${genderValue}`}
                  checked={gender.includes(genderValue)}
                  onChange={() => toggleGender(genderValue)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`gender-${genderValue}`} className="cursor-pointer">
                  {genderValue}
                </Label>
              </div>
            ))}
          </div>

          {/* Images */}
          <div></div>
          <div className="grid gap-2">
            <Label htmlFor="image">Images</Label>
            <div className="flex flex-col gap-4">
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border">
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

              <div className="border-2 border-dashed rounded-lg p-3 text-center hover:border-primary/50 transition-colors">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  required
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Label
                  htmlFor="image"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload shoe images
                  </span>
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full">
            Save Item
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;