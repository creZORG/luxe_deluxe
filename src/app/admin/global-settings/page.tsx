
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Save, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { globalSettings as initialSettings, GlobalSettings, ProductSize, DeliveryFee } from '@/lib/global-settings';

export default function GlobalSettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();

  const handleSizeChange = (index: number, value: string) => {
    const newSizes = [...settings.productSizes];
    newSizes[index] = { ...newSizes[index], name: value };
    setSettings(prev => ({ ...prev, productSizes: newSizes }));
  };

  const addSize = () => {
    setSettings(prev => ({ ...prev, productSizes: [...prev.productSizes, { id: `size-${Date.now()}`, name: '' }] }));
  };

  const removeSize = (index: number) => {
    setSettings(prev => ({ ...prev, productSizes: prev.productSizes.filter((_, i) => i !== index) }));
  };
  
  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
        ...prev,
        fees: {
            ...prev.fees,
            [name]: Number(value)
        }
    }));
  }
  
  const handleDeliveryFeeChange = (index: number, field: keyof DeliveryFee, value: string | number) => {
    const newFees = [...settings.deliveryFees];
    (newFees[index] as any)[field] = value;
    setSettings(prev => ({ ...prev, deliveryFees: newFees }));
  }

  const addDeliveryFee = () => {
    setSettings(prev => ({...prev, deliveryFees: [...prev.deliveryFees, {county: '', fee: 0}]}));
  }

  const removeDeliveryFee = (index: number) => {
    setSettings(prev => ({ ...prev, deliveryFees: prev.deliveryFees.filter((_, i) => i !== index)}));
  }

  const handleCryptoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
        ...prev,
        crypto: {
            ...prev.crypto,
            [name]: Number(value)
        }
    }));
  }

  const handleSaveChanges = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/update-global-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings }),
        });

        if (!response.ok) throw new Error('Failed to save settings.');

        toast({
          title: "Settings Saved",
          description: "Global settings have been updated.",
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Save Failed",
          description: "Could not save global settings.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Global Settings</h1>
        <Button onClick={handleSaveChanges} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save All Changes
        </Button>
      </div>

      <div className="space-y-8">
        {/* Product Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Product Sizes</CardTitle>
            <CardDescription>Manage the available product sizes that can be used for pricing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.productSizes.map((size, index) => (
              <div key={size.id} className="flex items-center gap-4">
                <Input value={size.name} onChange={(e) => handleSizeChange(index, e.target.value)} placeholder="e.g. 400ml" />
                <Button variant="destructive" size="icon" onClick={() => removeSize(index)} disabled={settings.productSizes.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addSize}>Add Size</Button>
          </CardContent>
        </Card>

        {/* Platform Fees */}
        <Card>
            <CardHeader>
                <CardTitle>Platform Fees</CardTitle>
                <CardDescription>Set fees that apply to all transactions.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="transaction-fee">Transaction Fee (%)</Label>
                    <Input id="transaction-fee" name="transactionPercent" type="number" value={settings.fees.transactionPercent} onChange={handleFeeChange} placeholder="e.g. 2.5" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="fixed-fee">Fixed Fee (KES)</Label>
                    <Input id="fixed-fee" name="fixed" type="number" value={settings.fees.fixed} onChange={handleFeeChange} placeholder="e.g. 50" />
                 </div>
            </CardContent>
        </Card>

        {/* Delivery Fees */}
        <Card>
            <CardHeader>
                <CardTitle>Delivery Fees</CardTitle>
                <CardDescription>Set delivery costs for each county.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {settings.deliveryFees.map((fee, index) => (
                    <div key={index} className="flex items-end gap-4">
                        <div className="flex-1">
                            <Label>County</Label>
                            <Input value={fee.county} onChange={(e) => handleDeliveryFeeChange(index, 'county', e.target.value)} placeholder="e.g. Nairobi" />
                        </div>
                        <div className="flex-1">
                            <Label>Fee (KES)</Label>
                            <Input type="number" value={fee.fee} onChange={(e) => handleDeliveryFeeChange(index, 'fee', Number(e.target.value))} placeholder="e.g. 300" />
                        </div>
                        <Button variant="destructive" size="icon" onClick={() => removeDeliveryFee(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button variant="outline" onClick={addDeliveryFee}>Add Delivery Location</Button>
            </CardContent>
        </Card>

        {/* Crypto & Points Settings */}
        <Card>
            <CardHeader>
                <CardTitle>Crypto &amp; Points Settings</CardTitle>
                <CardDescription>Configure the STRAD points reward system.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="pointsForSignup">Points for New Signup</Label>
                    <Input id="pointsForSignup" name="pointsForSignup" type="number" value={settings.crypto.pointsForSignup} onChange={handleCryptoChange} placeholder="e.g. 50" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="pointsForReferral">Points for Successful Referral</Label>
                    <Input id="pointsForReferral" name="pointsForReferral" type="number" value={settings.crypto.pointsForReferral} onChange={handleCryptoChange} placeholder="e.g. 100" />
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
