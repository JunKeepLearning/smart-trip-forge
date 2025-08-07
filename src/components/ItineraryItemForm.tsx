import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  time: z.string().optional(),
  type: z.enum(['attraction', 'restaurant', 'hotel', 'custom']),
  notes: z.string().optional(),
});

export type ItineraryItemFormValues = z.infer<typeof formSchema>;

interface ItineraryItemFormProps {
  onSubmit: (values: ItineraryItemFormValues) => void;
  initialValues?: Partial<ItineraryItemFormValues>;
  onCancel: () => void;
}

export function ItineraryItemForm({ onSubmit, initialValues, onCancel }: ItineraryItemFormProps) {
  const form = useForm<ItineraryItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Forbidden City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Time (Optional)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="attraction">Attraction</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Buy tickets online" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
