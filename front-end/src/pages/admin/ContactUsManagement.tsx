import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCMS } from '@/hooks/useCMS';
import { cmsAPI } from '@/services/api';
import { Save, Phone, MapPin, Loader2, FileText, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactUsManagement() {
    const { data: cmsData, isLoading, refetch } = useCMS();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Contact page content settings
    const [contactPage, setContactPage] = useState({
        heroTitle: 'Contact Us',
        heroSubtitle: 'Get in touch with our team for inquiries, quotes, or support',
        formTitle: 'Send Us a Message',
        formDescription: 'Fill out the form below and we\'ll get back to you as soon as possible',
        mapEmbedUrl: '',
        additionalInfo: ''
    });

    useEffect(() => {
        if (cmsData) {
            const page = (cmsData as any)?.contactPage;
            if (page) {
                setContactPage({
                    heroTitle: page.heroTitle || 'Contact Us',
                    heroSubtitle: page.heroSubtitle || 'Get in touch with our team for inquiries, quotes, or support',
                    formTitle: page.formTitle || 'Send Us a Message',
                    formDescription: page.formDescription || 'Fill out the form below and we\'ll get back to you as soon as possible',
                    mapEmbedUrl: page.mapEmbedUrl || '',
                    additionalInfo: page.additionalInfo || ''
                });
            }
        }
    }, [cmsData]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await cmsAPI.updateSection('contactPage', contactPage);
            refetch();
            toast({ title: 'Saved!', description: 'Contact page content updated successfully' });
        } catch (error: any) {
            toast({ title: 'Save Failed', description: error.message || 'Failed to save', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl">
                <h1 className="text-3xl font-bold mb-2">Contact Us Page</h1>
                <p className="text-gray-600 mb-8">Manage content displayed on the Contact page</p>

                {/* Hero Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Page Header (Hero Section)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Page Title</Label>
                            <Input
                                value={contactPage.heroTitle}
                                onChange={(e) => setContactPage({ ...contactPage, heroTitle: e.target.value })}
                                placeholder="Contact Us"
                            />
                            <p className="text-xs text-gray-500 mt-1">Main headline displayed at the top of the page</p>
                        </div>
                        <div>
                            <Label>Subtitle</Label>
                            <Textarea
                                value={contactPage.heroSubtitle}
                                onChange={(e) => setContactPage({ ...contactPage, heroSubtitle: e.target.value })}
                                placeholder="Get in touch with our team..."
                                rows={2}
                            />
                            <p className="text-xs text-gray-500 mt-1">Brief description shown below the title</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Form Settings */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Contact Form Section
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Form Title</Label>
                            <Input
                                value={contactPage.formTitle}
                                onChange={(e) => setContactPage({ ...contactPage, formTitle: e.target.value })}
                                placeholder="Send us a message"
                            />
                        </div>
                        <div>
                            <Label>Form Description</Label>
                            <Textarea
                                value={contactPage.formDescription}
                                onChange={(e) => setContactPage({ ...contactPage, formDescription: e.target.value })}
                                placeholder="Fill out the form below and we'll get back to you..."
                                rows={3}
                            />
                            <p className="text-xs text-gray-500 mt-1">This text appears above the contact form</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Map Settings */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Map & Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Google Maps Embed URL</Label>
                            <Input
                                value={contactPage.mapEmbedUrl}
                                onChange={(e) => setContactPage({ ...contactPage, mapEmbedUrl: e.target.value })}
                                placeholder="https://www.google.com/maps/embed?pb=..."
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                To get this URL: Go to Google Maps → Search your location → Click "Share" → "Embed a map" → Copy the src URL from the iframe code
                            </p>
                        </div>
                        <div>
                            <Label>Additional Location Info</Label>
                            <Textarea
                                value={contactPage.additionalInfo}
                                onChange={(e) => setContactPage({ ...contactPage, additionalInfo: e.target.value })}
                                placeholder="e.g., Parking available at B1, nearest MRT station..."
                                rows={3}
                            />
                            <p className="text-xs text-gray-500 mt-1">Additional directions or helpful information</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="mb-6 bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <FileText className="w-5 h-5" />
                            Note
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-blue-600">
                            Company contact details (phone, email, address, business hours) are managed in the
                            <a href="/admin/company-info" className="underline font-medium ml-1">Company Info</a> page.
                            Those details will automatically appear on the Contact page.
                        </p>
                    </CardContent>
                </Card>

                <Button onClick={handleSave} disabled={isSaving} size="lg">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Contact Page Settings
                </Button>
            </div>
        </AdminLayout>
    );
}
