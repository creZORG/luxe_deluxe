'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/products';
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
import { MoreHorizontal, PlusCircle, Trash } from 'lucide-react';
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
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function ProductList({ products, onEdit, onAdd, onDelete }: { products: Product[], onEdit: (product: Product) => void, onAdd: () => void, onDelete: (product: Product) => void }) {
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
                            <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{product.fragrance}</TableCell>
                        <TableCell className='max-w-xs truncate'>{product.description}</TableCell>
                        <TableCell>
                            <AlertDialog>
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
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the product
                                    &quot;{product.name}&quot;.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(product)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
    const productsCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productsCollection);
    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    setProducts(productList);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductSave = async (productData: Omit<Product, 'id'> & { id?: string }) => {
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
            await addDoc(productsCollection, dataToSave);
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

  const handleDelete = async (product: Product) => {
    if (!product.id) return;
    try {
      await deleteDoc(doc(db, "products", product.id));
      toast({
        title: "Product Deleted",
        description: `"${product.name}" has been deleted.`,
      });
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Error deleting product: ", error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
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
            <ProductList products={products} onEdit={handleEdit} onAdd={handleCreateNew} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="pricing">
            <ProductPricing products={products} onSave={(product) => handleProductSave(product)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
