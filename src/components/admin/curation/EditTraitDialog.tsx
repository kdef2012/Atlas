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
import { useFirestore, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, Pencil } from 'lucide-react';
import { Trait, TRAIT_ICONS } from '@/lib/types';

const formSchema = z.object({
  id: z.string().min(3, 'ID must be at least 3 characters.').regex(/^[a-z_]+$/, 'Only lowercase letters and underscores are allowed.'),
  name: z.string().min(3, 'Trait name must be at least 3 characters.').max(50, 'Trait name is too long.'),
  description: z.string().min(10, 'Description is too short.').max(100, 'Description is too long.'),
  icon: z.enum(Object.keys(TRAIT_ICONS) as [keyof typeof TRAIT_ICONS]),
});

interface EditTraitDialogProps {
  item?: Trait;
  children?: ReactNode;
}

export function EditTraitDialog({ item, children }: EditTraitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const isEditing = !!item;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: item?.id || '',
      name: item?.name || '',
      description: item?.description || '',
      icon: item?.icon || 'pioneer',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const traitRef = doc(firestore, 'traits', values.id);
    
    if (isEditing) {
      updateDocumentNonBlocking(traitRef, values);
       toast({
        title: 'Trait Updated',
        description: `The trait "${values.name}" has been updated.`,
      });
    } else {
      // Use set with merge:false to ensure we create a new doc with the specified ID
      setDocumentNonBlocking(traitRef, values, { merge: false });
      toast({
        title: 'Trait Added',
        description: `The trait "${values.name}" has been added.`,
      });
    }
    setIsOpen(false);
    form.reset(values); // Reset form with new values
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Trait' : 'Add New Trait'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Change the details of this trait.' : 'Add a new unlockable trait to the game.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unique ID</FormLabel>
                  <FormControl><Input placeholder="e.g., night_owl" {...field} disabled={isEditing} /></FormControl>
                   <FormDescription>A unique key used in the database. Cannot be changed after creation.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trait Name</FormLabel>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an icon" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {Object.keys(TRAIT_ICONS).map(iconKey => (
                                <SelectItem key={iconKey} value={iconKey}>{iconKey}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Add Trait'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
