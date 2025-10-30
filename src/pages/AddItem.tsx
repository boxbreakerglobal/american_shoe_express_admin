import { useState } from "react";
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
import { Plus, Upload, X } from "lucide-react";
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
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

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
      if (image) {
        formData.append('image', image);
      }

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
        setImage(null);
        setImagePreview("");
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
                  <Label htmlFor="image">Image</Label>
                  {!imagePreview ? (
                    <div className="flex flex-col gap-2">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          required
                        />
                        <Label htmlFor="image" className="cursor-pointer flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload shoe image
                          </span>
                          <span className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP up to 10MB
                          </span>
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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
