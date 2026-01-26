import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { bookingFormSchema, type BookingFormData } from "@/lib/validations";
import { PAGE_SEO, PROPERTY_TYPES, SERVICE_TYPES, TIME_SLOTS, AIRCON_BRANDS } from "@/constants";
import { submissionsAPI } from "@/services/api";

const Booking = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get service from URL param
  const serviceParam = searchParams.get("service");

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      existingClient: "",
      address: "",
      postalCode: "",
      propertyType: "",
      serviceType: (serviceParam as any) || "",
      numberOfUnits: undefined,
      brand: "",
      preferredDate: undefined,
      timeSlot: "",
      remarks: "",
      pdpaConsent: false,
    },
  });

  const { isSubmitting } = form.formState;
  const watchServiceType = form.watch("serviceType");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmit = async (data: BookingFormData) => {
    try {
      // Prepare submission data for backend
      const submissionData = {
        ...data,
        preferredDate: data.preferredDate ? format(data.preferredDate, 'yyyy-MM-dd') : undefined,
        formType: 'booking',
      };

      // Submit to backend API
      await submissionsAPI.create(submissionData);

      // Show success state
      setIsSubmitted(true);
      form.reset();

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout
      seo={{
        title: PAGE_SEO.booking.title,
        description: PAGE_SEO.booking.description,
        keywords: PAGE_SEO.booking.keywords,
        canonical: "/booking",
        breadcrumbs: [
          { name: "Home", url: "/" },
          { name: "Book Service", url: "/booking" },
        ],
      }}
    >
      {/* Header */}
      <section className="bg-brand-gradient text-white py-16 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Service Online</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Fast — Simple — 24/7 Booking System
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          {isSubmitted ? (
            // Success Message
            <div className="py-16 px-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">
                Booking Submitted Successfully!
              </h2>
              <p className="text-xl text-gray-700 mb-2">
                Thank you for your booking request.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                <strong>Our team will contact you soon</strong> to confirm your appointment.
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-8 max-w-md mx-auto">
                <p className="text-gray-600 text-sm">
                  We typically respond within <strong>1-2 business hours</strong> during our operating hours (9 AM - 6 PM SGT).
                </p>
              </div>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="mr-4"
              >
                Book Another Service
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </Button>
            </div>
          ) : (
            // Booking Form
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Appointment Booking Form</CardTitle>
                <CardDescription>Please fill in your details and we will get back to you shortly</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Customer Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Customer Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mobile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile *</FormLabel>
                              <FormControl>
                                <Input placeholder="9123 4567" type="tel" {...field} />
                              </FormControl>
                              <FormDescription>Singapore number (e.g., 9123 4567)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="existingClient"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Existing Client</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="yes">Yes</SelectItem>
                                  <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Address & Property */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Address & Property</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Address *</FormLabel>
                              <FormControl>
                                <Input placeholder="Block 123, Street Name, #01-234" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="123456" maxLength={6} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="propertyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Property Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select property type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PROPERTY_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Service Selection */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Service Selection</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="serviceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select service" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SERVICE_TYPES.map((service) => (
                                    <SelectItem key={service.value} value={service.value}>
                                      {service.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {watchServiceType !== "renovation" && (
                          <FormField
                            control={form.control}
                            name="numberOfUnits"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Number of Units</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="e.g., 3"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {watchServiceType !== "renovation" && (
                          <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Aircon Brand</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {AIRCON_BRANDS.map((brand) => (
                                      <SelectItem key={brand} value={brand.toLowerCase().replace(/\s+/g, "-")}>
                                        {brand}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="others">Others</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg border-b pb-2">Preferred Schedule</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="preferredDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                {watchServiceType === "renovation" ? "Preferred Site Survey Date *" : "Preferred Date *"}
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
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
                                    disabled={(date) =>
                                      date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {watchServiceType !== "renovation" && (
                          <FormField
                            control={form.control}
                            name="timeSlot"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Time Slot *</FormLabel>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                                  {TIME_SLOTS.map((slot) => (
                                    <Button
                                      key={slot.value}
                                      type="button"
                                      variant={field.value === slot.value ? "default" : "outline"}
                                      className={cn(
                                        "w-full",
                                        field.value === slot.value ? "bg-primary text-white" : "hover:border-primary hover:text-primary"
                                      )}
                                      onClick={() => field.onChange(slot.value)}
                                    >
                                      {slot.label.split(' - ').join('\n')}
                                    </Button>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>

                    {/* Remarks */}
                    <FormField
                      control={form.control}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Remarks</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special requests or details about your aircon issues..."
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: Describe any specific issues or requirements
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* PDPA Consent */}
                    <FormField
                      control={form.control}
                      name="pdpaConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer">
                              I agree to be contacted by Promach regarding my booking and service inquiries. *
                            </FormLabel>
                            <FormDescription>
                              Your information is protected under Singapore's Personal Data Protection Act (PDPA).
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Booking Request"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Booking;
