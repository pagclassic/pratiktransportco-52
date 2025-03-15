import { useState, useEffect } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { TransportEntry } from "@/types/transport";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Make sure the schema matches the TransportEntry type
const formSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  vehicleNumber: z.string().min(3, { message: "Vehicle number is required" }),
  driverName: z.string().default(""),
  driverMobile: z.string().default(""),
  place: z.string().default(""),
  transportName: z.string().default(""),
  rentAmount: z.coerce.number().min(1, { message: "Rent amount is required" }),
  advanceAmount: z.coerce.number().nullable().default(null),
  advanceDate: z.date().nullable().default(null),
  advanceType: z.enum(["Cash", "Bank Transfer", "Check", "UPI"]).default("Cash"),
  balanceStatus: z.enum(["PAID", "UNPAID", "PARTIAL"]).default("UNPAID"),
  balanceDate: z.date().nullable().default(null),
});

export interface TransportFormProps {
  onSubmit: (data: TransportEntry) => void;
  initialData?: TransportEntry;
  isEditing?: boolean;
}

const TransportForm = ({ onSubmit, initialData, isEditing = false }: TransportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: undefined, // Changed from new Date() to undefined
      vehicleNumber: "",
      driverName: "",
      driverMobile: "",
      place: "",
      transportName: "",
      rentAmount: 0,
      advanceAmount: null,
      advanceDate: null,
      advanceType: "Cash",
      balanceStatus: "UNPAID",
      balanceDate: null,
    },
  });

  // Set form values based on initialData when editing
  useEffect(() => {
    if (initialData && isEditing) {
      form.reset({
        date: initialData.date,
        vehicleNumber: initialData.vehicleNumber,
        driverName: initialData.driverName,
        driverMobile: initialData.driverMobile,
        place: initialData.place,
        transportName: initialData.transportName,
        rentAmount: initialData.rentAmount,
        advanceAmount: initialData.advanceAmount,
        advanceDate: initialData.advanceDate,
        advanceType: initialData.advanceType,
        balanceStatus: initialData.balanceStatus,
        balanceDate: initialData.balanceDate,
      });
    }
  }, [initialData, isEditing, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Ensure all required fields are present according to TransportEntry type
      const entryData: TransportEntry = {
        id: initialData?.id || uuidv4(),
        date: values.date,
        vehicleNumber: values.vehicleNumber,
        driverName: values.driverName,
        driverMobile: values.driverMobile,
        place: values.place,
        transportName: values.transportName,
        rentAmount: values.rentAmount,
        advanceAmount: values.advanceAmount,
        advanceDate: values.advanceDate,
        advanceType: values.advanceType,
        balanceStatus: values.balanceStatus,
        balanceDate: values.balanceDate,
      };
      
      onSubmit(entryData);
      
      toast({
        title: isEditing ? "Entry updated" : "Entry created",
        description: isEditing 
          ? "Transport entry has been successfully updated" 
          : "Transport entry has been successfully created",
      });
      
      if (!isEditing) {
        form.reset({
          date: undefined, // Changed from new Date() to undefined
          vehicleNumber: "",
          driverName: "",
          driverMobile: "",
          place: "",
          transportName: "",
          rentAmount: 0,
          advanceAmount: null,
          advanceDate: null,
          advanceType: "Cash",
          balanceStatus: "UNPAID",
          balanceDate: null,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Field */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vehicle Number */}
          <FormField
            control={form.control}
            name="vehicleNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Number <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="e.g. KA01AB1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Driver Name */}
          <FormField
            control={form.control}
            name="driverName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver Name</FormLabel>
                <FormControl>
                  <Input placeholder="Driver's full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Driver Mobile */}
          <FormField
            control={form.control}
            name="driverMobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver Mobile</FormLabel>
                <FormControl>
                  <Input placeholder="Driver's contact number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Place */}
          <FormField
            control={form.control}
            name="place"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place</FormLabel>
                <FormControl>
                  <Input placeholder="Location or destination" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Transport Name */}
          <FormField
            control={form.control}
            name="transportName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transport Name</FormLabel>
                <FormControl>
                  <Input placeholder="Transport company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rent Amount */}
          <FormField
            control={form.control}
            name="rentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rent Amount <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="Total rent amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Advance Amount */}
          <FormField
            control={form.control}
            name="advanceAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="Amount paid in advance" 
                    value={field.value ?? ''} 
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Advance Date */}
          <FormField
            control={form.control}
            name="advanceDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Advance Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Advance Type */}
          <FormField
            control={form.control}
            name="advanceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Balance Status */}
          <FormField
            control={form.control}
            name="balanceStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Balance Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PAID">PAID</SelectItem>
                    <SelectItem value="UNPAID">UNPAID</SelectItem>
                    <SelectItem value="PARTIAL">PARTIAL</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Balance Date */}
          <FormField
            control={form.control}
            name="balanceDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Balance Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating" : "Submitting"}
              </>
            ) : (
              <>{isEditing ? "Update" : "Submit"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransportForm;
