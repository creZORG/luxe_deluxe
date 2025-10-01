'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Product, getAllProducts } from '@/lib/products';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MoreHorizontal, PlusCircle, Trash, BarChart2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProductForm from '@/components/admin/product-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFieldArray, useForm } from 'react-hook-form';
import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


function ProductList({ products, onEdit, onAdd, onToggleStatus }: { products: Product[], onEdit: (product: Product) => void, onAdd: () => void, onToggleStatus: (product: Product) => void }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Products</h1>
                <Button onClick={onAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                        Image
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Fragrance</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => {
                    const image = PlaceHolderImages.find(
                        (img) => img.id === product.imageId
                    );
                    return (
                        <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                            {image && (
                            <Image
                                alt={product.name}
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={image.imageUrl}
                                width="64"
                            />
                            )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                {product.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.fragrance}</TableCell>
                        <TableCell className='max-w-xs truncate'>{product.description}</TableCell>
                        <TableCell>
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                                >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onEdit(product)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem>
                                    <BarChart2 className="mr-2 h-4 w-4" />
                                    Analytics
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onToggleStatus(product)}>
                                    {product.status === 'active' ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    );
                    })}
                </TableBody>
                </Table>
            </div>
        </div>
    );
}

function PricingForm({ product, onSave }: { product: Product, onSave: (product: Product) => void }) {
    const { register, control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            sizes: product.sizes || [{ size: '', price: 0 }]
        }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "sizes"
    });

    const onSubmit = (data: { sizes: { size: string, price: number }[] }) => {
        onSave({ ...product, sizes: data.sizes.map(s => ({...s, price: Number(s.price)})) });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium">Size</label>
                                <Input {...register(`sizes.${index}.size` as const, { required: true })} placeholder="e.g. 400ml" />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium">Price (KES)</label>
                                <Input {...register(`sizes.${index}.price` as const, { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder="e.g. 2500" />
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" className="mt-4" onClick={() => append({ size: '', price: 0 })}>Add Size</Button>
            </CardContent>
            <div className="flex justify-end p-6 pt-0">
                <Button type="submit">Save Pricing</Button>
            </div>
        </form>
    );
}

function ProductPricing({ products, onSave }: { products: Product[], onSave: (product: Product) => void }) {
    return (
        <div>
             <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Product Pricing</h1>
            </div>
            <div className="space-y-4">
                {products.map(product => (
                    <Card key={product.id}>
                        <CardHeader>
                            <CardTitle>{product.name}</CardTitle>
                            <CardDescription>{product.category} - {product.fragrance}</CardDescription>
                        </CardHeader>
                        <PricingForm product={product} onSave={onSave} />
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const productList = await getAllProducts();
    setProducts(productList);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductSave = async (productData: Omit<Product, 'id' | 'sizes' | 'status'> & { id?: string }) => {
    try {
        const { id, ...dataToSave } = productData;
        if (id) {
            // Update existing product
            const productRef = doc(db, 'products', id);
            await setDoc(productRef, dataToSave, { merge: true });
            toast({ title: "Success", description: "Product updated successfully." });
        } else {
            // Create new product
            const productsCollection = collection(db, 'products');
            await addDoc(productsCollection, { ...dataToSave, status: 'active', sizes: [] });
            toast({ title: "Success", description: "Product created successfully." });
        }
        await fetchProducts(); // Refetch products to update the list
    } catch (error) {
        console.error("Error saving product: ", error);
        toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
    } finally {
        setSelectedProduct(null);
        setFormOpen(false);
    }
  };

  const handlePricingSave = async (product: Product) => {
    try {
      const productRef = doc(db, 'products', product.id);
      await setDoc(productRef, { sizes: product.sizes }, { merge: true });
      toast({ title: "Success", description: `Pricing for ${product.name} updated.` });
      await fetchProducts();
    } catch (error) {
      console.error("Error saving pricing: ", error);
      toast({ title: "Error", description: "Failed to save pricing.", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (product: Product) => {
    if (!product.id) return;
    try {
        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        const productRef = doc(db, 'products', product.id);
        await setDoc(productRef, { status: newStatus }, { merge: true });
        toast({
            title: "Product Status Updated",
            description: `"${product.name}" has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
        });
        fetchProducts(); // Refresh the list
    } catch (error) {
        console.error("Error updating product status: ", error);
        toast({
            title: "Error",
            description: "Failed to update product status.",
            variant: "destructive",
        });
    }
  };


  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };
  
  const handleCreateNew = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  if (loading) {
    return <div>Loading products...</div>
  }

  return (
    <div>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
                </DialogHeader>
                <ProductForm
                    product={selectedProduct}
                    onSave={(data) => handleProductSave(selectedProduct ? { ...data, id: selectedProduct.id } : data)}
                    onCancel={() => { setSelectedProduct(null); setFormOpen(false); }}
                />
            </DialogContent>
        </Dialog>

      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
            <ProductList products={products} onEdit={handleEdit} onAdd={handleCreateNew} onToggleStatus={handleToggleStatus} />
        </TabsContent>
        <TabsContent value="pricing">
            <ProductPricing products={products} onSave={handlePricingSave} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
