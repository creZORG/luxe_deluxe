
'use client';

import { useEffect, useState } from 'react';
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
import ImageUploader from './image-uploader';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.enum(['Shower Gels', 'Fabric Softeners', 'Dishwash']),
  fragrance: z.string().min(1, 'Fragrance is required'),
  shortDescription: z.string().min(1, 'A short description is required.'),
  longDescription: z.string().min(1, 'A long description is required.'),
  imageId: z.string().min(1, 'Image is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormProps = {
  product: Product | null;
  onSave: (data: Omit<Product, 'id' | 'sizes' | 'status' | 'viewCount' | 'ratings' | 'reviewCount' | 'averageRating'>) => void;
  onCancel: () => void;
};

const fragranceOptions = {
    'Shower Gels': [
        'Laid Back Lavender',
        'Sweet Raspberry',
        'Cocoa Butter',
        'Zingy Lime',
        'Tingly Mint',
        'Zesty Lemon',
        'Ocean Breeze',
        'Creamy Vanilla',
        'Juicy Mango'
    ],
    'Fabric Softeners': ['Apricot Peach', 'Cool Lavender'],
    'Dishwash': ['Limeglow', 'Citrus Bloom'],
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
        shortDescription: product.shortDescription,
        longDescription: product.longDescription,
        imageId: product.imageId,
    } : {
      name: '',
      category: 'Shower Gels',
      fragrance: '',
      shortDescription: '',
      longDescription: '',
      imageId: '',
    },
  });

  const [imageUrl, setImageUrl] = useState(product?.imageId || '');
  const selectedCategory = form.watch('category');

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        category: product.category,
        fragrance: product.fragrance,
        shortDescription: product.shortDescription,
        longDescription: product.longDescription,
        imageId: product.imageId,
      });
      setImageUrl(product.imageId);
    } else {
      form.reset({
        name: '',
        category: 'Shower Gels',
        fragrance: '',
        shortDescription: '',
        longDescription: '',
        imageId: '',
      });
      setImageUrl('');
    }
  }, [product, form]);

  // Reset fragrance when category changes
  useEffect(() => {
    form.setValue('fragrance', '');
  }, [selectedCategory, form]);

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    form.setValue('imageId', url, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
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
                 <FormField
                    control={form.control}
                    name="fragrance"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Fragrance</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a fragrance" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {fragranceOptions[selectedCategory].map(fragrance => (
                                    <SelectItem key={fragrance} value={fragrance}>
                                        {fragrance}
                                    </SelectItem>
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
              name="imageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <ImageUploader 
                      currentImageUrl={imageUrl} 
                      onUploadSuccess={handleImageUpload} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
         <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description (One-liner)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. An indulgent shower experience that softens skin." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="longDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Long Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={5} placeholder="Provide the full, detailed description that will appear on the product page."/>
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
