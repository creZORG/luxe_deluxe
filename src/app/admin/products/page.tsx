
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Product, getAllProducts } from '@/lib/products';
import Image from 'next/image';
import { PlusCircle, BarChart2, Loader2, ChevronRight, Trash2 } from 'lucide-react';
import ProductForm from '@/components/admin/product-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { createProduct, updateProduct, updateProductPricing } from './actions';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';


function ProductList({ products, onAdd }: { products: Product[], onAdd: () => void }) {
    const router = useRouter();

    const handleManageClick = (productId: string) => {
        router.push(`/admin/products/${productId}/manage`);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Products</h1>
                <Button onClick={onAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                        <CardHeader className="p-0">
                            <div className="relative aspect-video w-full">
                                {product.imageId ? (
                                    <Image
                                        alt={product.name}
                                        className="object-cover"
                                        layout="fill"
                                        src={product.imageId}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-secondary">
                                        <BarChart2 className="h-10 w-10 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                            <div className="mt-2">
                                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                    {product.status === 'active' ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end">
                             <Button variant="outline" size="sm" onClick={() => handleManageClick(product.id)}>
                                Manage
                                <ChevronRight className="ml-2 h-4 w-4"/>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function PricingForm({ product, onSave }: { product: Product, onSave: (productId: string, sizes: any[]) => void }) {
    const { register, control, handleSubmit } = useForm({
        defaultValues: {
            sizes: product.sizes && product.sizes.length > 0 
                ? product.sizes.map(s => ({ size: s.size, price: s.price, quantityAvailable: s.quantityAvailable || 0 })) 
                : [{ size: '', price: 0, quantityAvailable: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "sizes"
    });
    const [isPending, startTransition] = useTransition();

    const onSubmit = (data: { sizes: { size: string, price: number, quantityAvailable: number }[] }) => {
        startTransition(async () => {
            const validSizes = data.sizes.filter(s => s.size && s.price > 0);
            await onSave(product.id, validSizes.map(s => ({...s, price: Number(s.price), quantityAvailable: Number(s.quantityAvailable) })));
        });
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,auto] items-end gap-4">
                            <div>
                                {index === 0 && <label className="text-sm font-medium">Size</label>}
                                <Input {...register(`sizes.${index}.size` as const, { required: true })} placeholder="e.g. 500ml" />
                            </div>
                            <div>
                                {index === 0 && <label className="text-sm font-medium">Price (KES)</label>}
                                <Input {...register(`sizes.${index}.price` as const, { required: true, valueAsNumber: true })} type="number" step="0.01" placeholder="e.g. 2500" />
                            </div>
                             <div>
                                {index === 0 && <label className="text-sm font-medium">Quantity Available</label>}
                                <Input {...register(`sizes.${index}.quantityAvailable` as const, { required: true, valueAsNumber: true })} type="number" placeholder="e.g. 100" />
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" className="mt-4" onClick={() => append({ size: '', price: 0, quantityAvailable: 0 })}>Add Size</Button>
            </CardContent>
            <div className="flex justify-end p-6 pt-0">
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Pricing
                </Button>
            </div>
        </form>
    );
}

function ProductPricing({ products, onSave }: { products: Product[], onSave: (productId: string, sizes: any[]) => void }) {
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
  const [isSaving, startSaving] = useTransition();

  const fetchProducts = async () => {
    setLoading(true);
    const productList = await getAllProducts();
    setProducts(productList);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductSave = (productData: Omit<Product, 'id' | 'sizes' | 'status'> & { id?: string }) => {
    startSaving(async () => {
        try {
            const { id, ...dataToSave } = productData;
            if (id) {
                await updateProduct(id, dataToSave);
                toast({ title: "Success", description: "Product updated successfully." });
            } else {
                await createProduct(dataToSave);
                toast({ title: "Success", description: "Product created successfully." });
            }
            await fetchProducts(); // Force a refetch
        } catch (error) {
            console.error("Error saving product: ", error);
            toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
        } finally {
            setSelectedProduct(null);
            setFormOpen(false);
        }
    });
  };

  const handlePricingSave = (productId: string, sizes: any[]) => {
    startSaving(async () => {
        try {
          await updateProductPricing(productId, sizes);
          toast({ title: "Success", description: `Pricing updated.` });
          await fetchProducts(); // Force a refetch
        } catch (error) {
          console.error("Error saving pricing: ", error);
          toast({ title: "Error", description: "Failed to save pricing.", variant: "destructive" });
        }
    });
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
            <ProductList products={products} onAdd={handleCreateNew} />
        </TabsContent>
        <TabsContent value="pricing">
            <ProductPricing products={products} onSave={handlePricingSave} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
