'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
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
import { Trash } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.enum(['Shower Gels', 'Fabric Softeners', 'Dishwash']),
  fragrance: z.string().min(1, 'Fragrance is required'),
  description: z.string().min(1, 'Description is required'),
  imageId: z.string().min(1, 'Image is required'),
  sizes: z.array(z.object({
      size: z.string().min(1, 'Size is required'),
      price: z.preprocess(
        (a) => parseFloat(z.string().parse(a)),
        z.number().positive('Price must be positive')
      ),
    })).min(1, 'At least one size is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormProps = {
  product: Product | null;
  onSave: (data: Product) => void;
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
        ...product,
        sizes: product.sizes.map(s => ({...s, price: s.price as any}))
    } : {
      name: '',
      category: 'Shower Gels',
      fragrance: '',
      description: '',
      imageId: '',
      sizes: [{ size: '', price: 0 as any }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sizes',
  });
  
  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        sizes: product.sizes.map(s => ({...s, price: s.price as any}))
      });
    } else {
      form.reset({
        name: '',
        category: 'Shower Gels',
        fragrance: '',
        description: '',
        imageId: '',
        sizes: [{ size: '', price: 0 as any }],
      })
    }
  }, [product, form]);

  const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
    onSave({ ...data, id: product?.id || '' });
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
        
        <div>
          <FormLabel>Sizes & Prices</FormLabel>
          <div className="mt-2 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-4">
                <FormField
                  control={form.control}
                  name={`sizes.${index}.size`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                       <FormLabel className='text-xs'>Size</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 400ml" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`sizes.${index}.price`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className='text-xs'>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 2500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ size: '', price: 0 as any })}
            >
              Add Size
            </Button>
          </div>
           {form.formState.errors.sizes && (
              <p className="text-sm font-medium text-destructive mt-2">
                {form.formState.errors.sizes.message}
              </p>
           )}
        </div>


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
