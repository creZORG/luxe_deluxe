'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Upload, Save, Loader2, Trash2, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getSiteContent, updateSiteContent, SiteContent, SocialLink, BlogPostContent, ImagePlaceholder } from '@/lib/content';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function SiteContentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!authLoading && user && !['admin', 'developer', 'digital_marketer'].includes(user.role)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchContent = async () => {
    setLoading(true);
    const siteContent = await getSiteContent();
    setContent(siteContent);
    setLoading(false);
  };
  
  useEffect(() => {
    if (user && ['admin', 'developer', 'digital_marketer'].includes(user.role)) {
      fetchContent();
    }
  }, [user]);

  if (authLoading || loading || !content) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading Site Content...</p>
        </div>
    );
  }
  
  if (!user || !['admin', 'developer', 'digital_marketer'].includes(user.role)) {
      return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section: keyof SiteContent, key?: string) => {
    const { name, value } = e.target;
    if (!content) return;

    if (section === 'contact') {
        setContent(prev => prev ? ({
            ...prev,
            contact: {
                ...prev.contact,
                [name]: value,
            }
        }) : null);
    }
  };

  const handleSocialChange = (index: number, field: keyof SocialLink, value: string) => {
    setContent(prev => {
        if (!prev) return null;
        const newSocialLinks = [...prev.socialMedia];
        newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
        return { ...prev, socialMedia: newSocialLinks };
    });
  };

  const addSocialLink = () => {
    setContent(prev => prev ? ({
        ...prev,
        socialMedia: [...prev.socialMedia, { platform: 'Instagram', url: '' }]
    }) : null);
  };

  const removeSocialLink = (index: number) => {
    setContent(prev => prev ? ({
        ...prev,
        socialMedia: prev.socialMedia.filter((_, i) => i !== index)
    }) : null);
  };
  
  const handleBlogPostChange = (index: number, field: keyof BlogPostContent, value: string | number) => {
     setContent(prev => {
        if (!prev) return null;
        const newBlogPosts = [...prev.blogPosts];
        (newBlogPosts[index] as any)[field] = value;
        return { ...prev, blogPosts: newBlogPosts };
    });
  }

  const handleHomepageImageChange = (field: keyof SiteContent, imageId: string) => {
    setContent(prev => (prev ? { ...prev, [field]: imageId } : null));
  };
  
  const handleImageInfoChange = (index: number, field: keyof ImagePlaceholder, value: string) => {
      setContent(prev => {
        if (!prev) return null;
        const newImages = [...prev.images];
        (newImages[index] as any)[field] = value;
        return { ...prev, images: newImages };
    });
  }
  
  const addImage = () => {
      setContent(prev => prev ? ({
          ...prev,
          images: [
              ...prev.images,
              { id: `new-image-${Date.now()}`, description: '', imageUrl: 'https://placehold.co/600x400', imageHint: ''}
          ]
      }) : null);
  }

  const removeImage = (id: string) => {
      setContent(prev => {
          if (!prev) return null;
          // Prevent deleting an image that is currently in use
          const isUsedInBlog = prev.blogPosts.some(post => post.imageId === id);
          if (isUsedInBlog || prev.featuredProductImageId === id || prev.collectionFabricSoftenersImageId === id || prev.collectionShowerGelsImageId === id || prev.collectionDishwashImageId === id) {
              toast({
                  title: "Cannot Delete Image",
                  description: "This image is currently being used on the homepage.",
                  variant: "destructive",
              });
              return prev;
          }
          return { ...prev, images: prev.images.filter(img => img.id !== id) };
      });
  }


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    setUploadingId(imageId);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
      
      const newUrl = result.secure_url;

      setContent(currentContent => currentContent ? ({
        ...currentContent,
        images: currentContent.images.map(img =>
          img.id === imageId ? { ...img, imageUrl: newUrl } : img
        )
      }) : null);

      toast({
        title: "Image Uploaded",
        description: `New image for "${imageId}" is ready to be saved.`,
      });

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
        setUploadingId(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!content) return;
    startTransition(async () => {
        const result = await updateSiteContent(content);
        if (result.success) {
            toast({
                title: "Changes Saved",
                description: "Your site content has been updated.",
            });
            fetchContent();
        } else {
            console.error(result.error);
            toast({
                title: "Save Failed",
                description: result.error || "Could not save site content changes.",
                variant: "destructive",
            });
        }
    });
  };
  
  const ImageSelect = ({ label, value, onChange, images }: { label: string; value: string; onChange: (value: string) => void; images: ImagePlaceholder[] }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an image" />
        </SelectTrigger>
        <SelectContent>
          {images.map(image => (
            <SelectItem key={image.id} value={image.id}>
              <div className="flex items-center gap-2">
                <Image src={image.imageUrl} alt={image.description} width={24} height={24} className="rounded-sm object-cover" />
                <span>{image.id}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Site Content</h1>
        <Button onClick={handleSaveChanges} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save All Changes
        </Button>
      </div>
      
      <div className="space-y-8">
        
        {/* Homepage Content */}
        <Card>
            <CardHeader>
                <CardTitle>Homepage Content</CardTitle>
                <CardDescription>Manage the main images displayed on your homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <ImageSelect
                  label="Featured Product Image"
                  value={content.featuredProductImageId}
                  onChange={(value) => handleHomepageImageChange('featuredProductImageId', value)}
                  images={content.images}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                   <ImageSelect
                      label="Collection: Fabric Softeners"
                      value={content.collectionFabricSoftenersImageId}
                      onChange={(value) => handleHomepageImageChange('collectionFabricSoftenersImageId', value)}
                      images={content.images}
                    />
                    <ImageSelect
                      label="Collection: Shower Gels"
                      value={content.collectionShowerGelsImageId}
                      onChange={(value) => handleHomepageImageChange('collectionShowerGelsImageId', value)}
                      images={content.images}
                    />
                    <ImageSelect
                      label="Collection: Dishwash"
                      value={content.collectionDishwashImageId}
                      onChange={(value) => handleHomepageImageChange('collectionDishwashImageId', value)}
                      images={content.images}
                    />
                </div>
            </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Update the contact details displayed on your site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" name="email" value={content.contact.email} onChange={(e) => handleInputChange(e, 'contact')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input id="contact-phone" name="phone" value={content.contact.phone} onChange={(e) => handleInputChange(e, 'contact')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-address">Address</Label>
              <Input id="contact-address" name="address" value={content.contact.address} onChange={(e) => handleInputChange(e, 'contact')} />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Manage the social media links in your site's footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.socialMedia.map((link, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="flex-1">
                  <Label>Platform</Label>
                  <Input value={link.platform} onChange={(e) => handleSocialChange(index, 'platform', e.target.value)} placeholder="e.g. Instagram" />
                </div>
                <div className="flex-1">
                  <Label>URL</Label>
                  <Input value={link.url} onChange={(e) => handleSocialChange(index, 'url', e.target.value)} placeholder="https://instagram.com/..." />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeSocialLink(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addSocialLink}>Add Social Link</Button>
          </CardContent>
        </Card>


        {/* Website Images */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Image Gallery</CardTitle>
                <CardDescription>Upload and manage all images used across your website.</CardDescription>
              </div>
               <Button onClick={addImage} variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Image
              </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border">
                    <Table>
                    <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Image ID</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>AI Hint</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {content.images.map((image, index) => (
                        <TableRow key={image.id}>
                            <TableCell>
                              <div className="relative w-28 h-16 rounded-md border">
                                <Image
                                    alt={image.description}
                                    className="object-cover rounded-md"
                                    layout="fill"
                                    src={image.imageUrl}
                                    key={image.imageUrl}
                                />
                                {uploadingId === image.id && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                                <Input value={image.id} onChange={(e) => handleImageInfoChange(index, 'id', e.target.value)} placeholder="unique-id-name" />
                            </TableCell>
                             <TableCell>
                                <Input value={image.description} onChange={(e) => handleImageInfoChange(index, 'description', e.target.value)} placeholder="A brief description" />
                            </TableCell>
                            <TableCell>
                                <Input value={image.imageHint} onChange={(e) => handleImageInfoChange(index, 'imageHint', e.target.value)} placeholder="e.g. 'luxury product'" />
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <label htmlFor={`upload-${image.id}`} className="cursor-pointer">
                                  <Button asChild variant="outline" size="sm" disabled={uploadingId === image.id}>
                                    <div>
                                      <Upload className="mr-2 h-4 w-4" />
                                      {uploadingId === image.id ? '...' : 'Upload'}
                                    </div>
                                  </Button>
                                  <Input
                                  id={`upload-${image.id}`}
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, image.id)}
                                  disabled={uploadingId === image.id}
                                  />
                              </label>
                              <Button variant="destructive" size="icon" onClick={() => removeImage(image.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        {/* Blog Posts */}
        <Card>
            <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>Manage the blog posts displayed on the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {content.blogPosts.map((post, index) => (
                    <div key={post.id} className="p-4 border rounded-lg space-y-4">
                        <h4 className="font-semibold text-lg">Post {index + 1}</h4>
                        <div className="space-y-2">
                           <Label>Title</Label>
                           <Input value={post.title} onChange={(e) => handleBlogPostChange(index, 'title', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <Label>Excerpt</Label>
                           <Textarea value={post.excerpt} onChange={(e) => handleBlogPostChange(index, 'excerpt', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Image</Label>
                             <Select value={post.imageId} onValueChange={(value) => handleBlogPostChange(index, 'imageId', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an image" />
                                </SelectTrigger>
                                <SelectContent>
                                    {content.images.map(image => (
                                        <SelectItem key={image.id} value={image.id}>
                                            <div className="flex items-center gap-2">
                                                <Image src={image.imageUrl} alt={image.description} width={24} height={24} className="rounded-sm" />
                                                <span>{image.id}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ))}
                <p className="text-center text-sm text-muted-foreground">Blog posts can be added or removed by a developer directly in the code.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
