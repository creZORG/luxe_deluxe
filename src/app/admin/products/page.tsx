'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { products as initialProducts, Product } from '@/lib/products';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFieldArray, useForm } from 'react-hook-form';

function ProductList({ products, onEdit, onAdd, onSave }: { products: Product[], onEdit: (product: Product) => void, onAdd: () => void, onSave: (product: Product) => void }) {
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
                                <DropdownMenuItem>Delete</DropdownMenuItem>
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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductSave = (product: Product) => {
    if (selectedProduct) {
      setProducts(
        products.map((p) => (p.id === product.id ? product : p))
      );
    } else {
      setProducts([...products, { ...product, id: `prod-${Date.now()}` }]);
    }
    setSelectedProduct(null);
    setFormOpen(false);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };
  
  const handleCreateNew = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  return (
    <div>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle>
                </DialogHeader>
                <ProductForm
                    product={selectedProduct}
                    onSave={handleProductSave}
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
            <ProductList products={products} onEdit={handleEdit} onAdd={handleCreateNew} onSave={handleProductSave} />
        </TabsContent>
        <TabsContent value="pricing">
            <ProductPricing products={products} onSave={handleProductSave} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
