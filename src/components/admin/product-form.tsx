'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/lib/products';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.enum(['Shower Gels', 'Fabric Softeners', 'Dishwash']),
  fragrance: z.string().min(1, 'Fragrance is required'),
  description: z.string().min(1, 'Description is required'),
  imageId: z.string().min(1, 'Image is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormProps = {
  product: Product | null;
  onSave: (data: Omit<Product, 'id' | 'sizes'>) => void;
  onCancel: () => void;
};

export default function ProductForm({
  product,
  onSave,
  onCancel,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
        name: product.name,
        category: product.category,
        fragrance: product.fragrance,
        description: product.description,
        imageId: product.imageId,
    } : {
      name: '',
      category: 'Shower Gels',
      fragrance: '',
      description: '',
      imageId: '',
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        category: product.category,
        fragrance: product.fragrance,
        description: product.description,
        imageId: product.imageId,
      });
    } else {
      form.reset({
        name: '',
        category: 'Shower Gels',
        fragrance: '',
        description: '',
        imageId: '',
      })
    }
  }, [product, form]);

  const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                >
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Shower Gels">Shower Gels</SelectItem>
                        <SelectItem value="Fabric Softeners">
                            Fabric Softeners
                        </SelectItem>
                        <SelectItem value="Dishwash">Dishwash</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="fragrance"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fragrance</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="imageId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Image</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an image" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {PlaceHolderImages.map(img => (
                            <SelectItem key={img.id} value={img.id}>{img.id}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Product</Button>
        </div>
      </form>
    </Form>
  );
}
