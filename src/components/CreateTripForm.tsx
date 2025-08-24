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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { addDays, format, differenceInCalendarDays } from "date-fns";
import { useState, useEffect } from "react";
import { searchDestinations, SearchableDestination } from "@/lib/api";
import { Loader2, CalendarIcon, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export const formSchema = z.object({
  destination: z.string().min(2, { message: "Destination is required." }),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});

export type CreateTripFormValues = z.infer<typeof formSchema>;

interface CreateTripFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export function CreateTripForm({ onSubmit }: CreateTripFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: addDays(new Date(), 2),
    }
  });

  // State for destination search
  const [searchResults, setSearchResults] = useState<SearchableDestination[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const destinationQuery = form.watch("destination");

  // State for date input mode
  const [dateInputMode, setDateInputMode] = useState<"duration" | "dates">("duration");

  // State for date range picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: form.getValues("startDate"),
    to: form.getValues("endDate"),
  });

  // State for duration stepper
  const [duration, setDuration] = useState(() => 
      differenceInCalendarDays(form.getValues("endDate"), form.getValues("startDate")) + 1
  );

  // Sync date states with form changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "startDate" || name === "endDate") {
        const { startDate, endDate } = value;
        if (startDate && endDate) {
          setDateRange({ from: startDate, to: endDate });
          const newDuration = differenceInCalendarDays(endDate, startDate) + 1;
          if (newDuration > 0) {
            setDuration(newDuration);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Destination search effect
  useEffect(() => {
    if (!destinationQuery || destinationQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const handler = setTimeout(() => {
      searchDestinations(destinationQuery).then(results => {
        setSearchResults(results);
        setIsSearching(false);
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [destinationQuery]);

  const handleSelectDestination = (destination: SearchableDestination) => {
    form.setValue("destination", `${destination.city}, ${destination.country}`);
    setDropdownVisible(false);
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    const startDate = form.getValues("startDate") || new Date();
    form.setValue("endDate", addDays(startDate, newDuration - 1));
    form.trigger("endDate");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Destination Search Input */}
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    placeholder="e.g., Zhongshan, China"
                    {...field} 
                    autoComplete="off"
                    onFocus={() => setDropdownVisible(true)}
                    onBlur={() => setTimeout(() => setDropdownVisible(false), 150)}
                  />
                </FormControl>
                {isDropdownVisible && destinationQuery && destinationQuery.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg">
                    {isSearching ? (
                      <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                    ) : searchResults.length > 0 ? (
                      <ul>
                        {searchResults.map((result, index) => (
                          <li 
                            key={index}
                            className="px-3 py-2 cursor-pointer hover:bg-muted"
                            onMouseDown={(e) => { e.preventDefault(); handleSelectDestination(result); }}
                          >
                            {result.city}, {result.country}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-2 text-center text-sm text-muted-foreground">No results found.</div>
                    )}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Inputs */}
        <div className="p-4 border rounded-lg bg-muted/30">
          <div className="flex justify-between items-center mb-4">
            <FormLabel>Trip Dates</FormLabel>
            <Button 
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDateInputMode(prev => prev === 'duration' ? 'dates' : 'duration')}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              {dateInputMode === 'duration' ? 'Select by Date Range' : 'Select by Duration'}
            </Button>
          </div>

          {dateInputMode === 'duration' ? (
            // Duration Slider Selector
            <div className="space-y-4 pt-2">
                <div className="flex justify-center items-center">
                    <span className="text-2xl font-bold w-16 text-center">{duration}</span>
                    <span className="text-muted-foreground">Day{duration > 1 ? 's' : ''}</span>
                </div>
                <Slider
                    defaultValue={[duration]}
                    value={[duration]}
                    onValueChange={(value) => handleDurationChange(value[0])}
                    max={30}
                    min={1}
                    step={1}
                />
            </div>
          ) : (
            // Date Range Selector
            <FormField
              control={form.control}
              name="startDate" // Field is for validation trigger
              render={() => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range);
                          if (range?.from) form.setValue("startDate", range.from);
                          if (range?.to) form.setValue("endDate", range.to);
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" disabled>Smart Plan (Coming Soon)</Button>
            <Button type="submit">Self Plan</Button>
        </div>
      </form>
    </Form>
  );
}