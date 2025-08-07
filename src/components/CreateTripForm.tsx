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
import { DatePicker } from "@/components/forms/DatePicker";

const formSchema = z.object({
  destination: z.string().min(2, { message: "Destination is required." }),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
});


interface CreateTripFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export function CreateTripForm({ onSubmit }: CreateTripFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Paris, France" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <DatePicker field={field} label="Start Date" className="flex-1" />
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <DatePicker field={field} label="End Date" className="flex-1" />
            )}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" disabled>Smart Plan (Coming Soon)</Button>
            <Button type="submit">Self Plan</Button>
        </div>
      </form>
    </Form>
  );
}
