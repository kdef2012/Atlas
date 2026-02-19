
'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, updateDocumentNonBlocking, addDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Loader2, Pencil } from 'lucide-react';
import { StoreItem, STORE_ITEM_ICONS, Trait } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(3, 'Item name must be at least 3 characters.').max(50, 'Item name is too long.'),
  description: z.string().min(10, 'Description is too short.').max(100, 'Description is too long.'),
  price: z.coerce.number().int().min(0, 'Price cannot be negative.'),
  icon: z.enum(Object.keys(STORE_ITEM_ICONS) as [keyof typeof STORE_ITEM_ICONS]),
  layerKey: z.string().min(3, 'Layer key is required.').regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores are allowed.'),
  visualDescription: z.string().min(10, 'Visual description is required for the AI to generate the item.'),
  // Prestige Gate
  minLevel: z.coerce.number().int().min(0).optional(),
  requiredTraitId: z.string().optional(),
});

interface EditStoreItemDialogProps {
  item?: StoreItem;
  children?: ReactNode;
}

export function EditStoreItemDialog({ item, children }: EditStoreItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const isEditing = !!item;

  const traitsCollection = useMemoFirebase(() => collection(firestore, 'traits'), [firestore]);
  const { data: traits } = useCollection<Trait>(traitsCollection);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      icon: item?.icon || 'RectangleHorizontal',
      layerKey: item?.layerKey || '',
      visualDescription: item?.visualDescription || '',
      minLevel: item?.minLevel || 0,
      requiredTraitId: item?.requiredTraitId || 'none',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const cleanValues = { ...values };
    if (cleanValues.requiredTraitId === 'none') delete cleanValues.requiredTraitId;

    if (isEditing) {
      const itemRef = doc(firestore, 'store-items', item.id);
      updateDocumentNonBlocking(itemRef, cleanValues);
      toast({
        title: 'Item Updated',
        description: `The item "${values.name}" has been updated.`,
      });
    } else {
      const storeItemsCollection = collection(firestore, 'store-items');
      addDocumentNonBlocking(storeItemsCollection, cleanValues);
      toast({
        title: 'Item Added',
        description: `The item "${values.name}" has been added to the store.`,
      });
    }
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Forge Store Item' : 'New Store Item'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modify item parameters and prestige gates.' : 'Forge a new item for the ATLAS Exchange.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary border-b pb-1">Core Identity</h4>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Store Description</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Price (Gems)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Store Icon</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an icon" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.keys(STORE_ITEM_ICONS).map(iconKey => (
                                            <SelectItem key={iconKey} value={iconKey}>{iconKey}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-accent border-b pb-1">Prestige Gates</h4>
                    <FormField
                        control={form.control}
                        name="minLevel"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Minimum Level Required</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormDescription>Set to 0 for no level gate.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="requiredTraitId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Required Trait</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a required trait" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">No Trait Required</SelectItem>
                                        {traits?.map(trait => (
                                            <SelectItem key={trait.id} value={trait.id}>{trait.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Users must possess this trait to purchase.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground border-b pb-1">AI Forge Parameters</h4>
                <FormField
                    control={form.control}
                    name="visualDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Visual Description for AI Synthesis</FormLabel>
                        <FormControl><Textarea placeholder="e.g., a futuristic cloak made of woven light fibers" {...field} /></FormControl>
                        <FormDescription>
                            This description is used by the AI to synthesize the item onto the user's Twinskie.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="layerKey"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Database Layer Key</FormLabel>
                        <FormControl><Input placeholder="e.g., cosmetic_light_cloak" {...field} disabled={isEditing} /></FormControl>
                        <FormDescription>Unique identifier. Lowercase and underscores only.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Signature' : 'Forge Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
