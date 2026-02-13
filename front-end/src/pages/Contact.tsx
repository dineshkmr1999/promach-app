import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { contactFormSchema, type ContactFormData } from "@/lib/validations";
import { useCMS } from "@/hooks/useCMS";
import GoogleMap from "@/components/GoogleMap";

const Contact = () => {
  const { toast } = useToast();
  const { data: cmsData, isLoading } = useCMS();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const { isSubmitting } = form.formState;

  // Get company info from CMS or use defaults
  const companyInfo = (cmsData?.companyInfo as any) || {};
  const contactPage = (cmsData as any)?.contactPage || {};

  // Extract address (handles both nested object and string formats)
  const getAddressDisplay = () => {
    const addr = companyInfo.address;
    if (!addr) return { street: '', building: '', city: 'Singapore', postalCode: '' };
    if (typeof addr === 'string') return { street: addr, building: '', city: '', postalCode: '' };
    return addr;
  };

  const address = getAddressDisplay();

  // Extract business hours
  const getBusinessHours = () => {
    const hours = companyInfo.businessHours;
    if (!hours) return { weekdays: 'Mon-Fri: 9am-6pm', saturday: 'Sat: 9am-1pm', sunday: 'Sun: Closed' };
    if (typeof hours === 'string') return { weekdays: hours, saturday: '', sunday: '' };
    return hours;
  };

  const businessHours = getBusinessHours();

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate API call - replace with actual backend integration
      console.log("Contact form data:", data);

      toast({
        title: "Message Sent! ✓",
        description: "Thank you for contacting us. We will get back to you soon.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly via phone.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout seo={{ title: "Contact Us", description: "Get in touch with our team", canonical: "/contact" }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      seo={{
        title: contactPage.heroTitle || "Contact Us - Get a Free Quote",
        description: contactPage.heroSubtitle || "Get in touch with our team for inquiries, quotes, or support",
        keywords: ["contact", "enquiry", "quote", "Singapore"],
        canonical: "/contact",
        breadcrumbs: [
          { name: "Home", url: "/" },
          { name: "Contact Us", url: "/contact" },
        ],
      }}
    >
      {/* Header */}
      <section className="relative bg-gradient-to-br from-[hsl(203,41%,15%)] via-primary to-[hsl(203,35%,28%)] text-white py-20 md:py-24 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {contactPage.heroTitle || "Contact Us"}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            {contactPage.heroSubtitle || "Get in touch with our team for inquiries, quotes, or support"}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
            <p className="text-muted-foreground mb-8">
              {contactPage.formDescription || "Have questions about our services? Need a quote for your project? Our friendly team is here to help. Reach out to us through any of the following channels."}
            </p>

            <div className="space-y-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Office Address</h3>
                      <p className="text-sm text-muted-foreground">
                        {address.street && <>{address.street}<br /></>}
                        {address.building && <>{address.building}<br /></>}
                        {address.city} {address.postalCode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <a href={`tel:${companyInfo.phone || ''}`} className="text-sm text-primary hover:underline">
                        {companyInfo.phone || "+65 6829 2136"}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a href={`mailto:${companyInfo.email || ''}`} className="text-sm text-primary hover:underline">
                        {companyInfo.email || "enquiry@promachpl.com"}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Business Hours</h3>
                      <p className="text-sm text-muted-foreground">
                        {businessHours.weekdays && <>{businessHours.weekdays}<br /></>}
                        {businessHours.saturday && <>{businessHours.saturday}<br /></>}
                        {businessHours.sunday}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              {cmsData?.socialMedia && (Object.values(cmsData.socialMedia).some(v => v)) && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4">Follow Us</h3>
                    <div className="flex gap-3">
                      {cmsData.socialMedia.facebook && (
                        <a
                          href={cmsData.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-primary/10 hover:bg-primary rounded-full flex items-center justify-center text-primary hover:text-white transition-all duration-300"
                          title="Facebook"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </a>
                      )}
                      {cmsData.socialMedia.instagram && (
                        <a
                          href={cmsData.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-primary/10 hover:bg-gradient-to-br hover:from-slate-600 hover:to-slate-700 rounded-full flex items-center justify-center text-primary hover:text-white transition-all duration-300"
                          title="Instagram"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        </a>
                      )}
                      {cmsData.socialMedia.linkedin && (
                        <a
                          href={cmsData.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-primary/10 hover:bg-blue-600 rounded-full flex items-center justify-center text-primary hover:text-white transition-all duration-300"
                          title="LinkedIn"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </a>
                      )}
                      {cmsData.socialMedia.youtube && (
                        <a
                          href={cmsData.socialMedia.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-primary/10 hover:bg-red-600 rounded-full flex items-center justify-center text-primary hover:text-white transition-all duration-300"
                          title="YouTube"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Google Map or Map Embed */}
            <Card>
              <CardContent className="pt-6">
                {(companyInfo.mapEmbedUrl || contactPage.mapEmbedUrl) ? (
                  <iframe
                    src={companyInfo.mapEmbedUrl || contactPage.mapEmbedUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  />
                ) : (
                  <GoogleMap
                    lat={1.2809}
                    lng={103.8507}
                    title={companyInfo.name || "Promach Pte Ltd"}
                  />
                )}
                {contactPage.additionalInfo && (
                  <p className="text-sm text-muted-foreground mt-4">{contactPage.additionalInfo}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {contactPage.formTitle || "Send Us a Message"}
                </CardTitle>
                <CardDescription>
                  {contactPage.formDescription || "Fill out the form below and we'll get back to you as soon as possible"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
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
                            <Input placeholder="your@email.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="9123 4567" type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us more about your inquiry..."
                              rows={6}
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
