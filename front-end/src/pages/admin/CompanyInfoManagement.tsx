import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCMS } from '@/hooks/useCMS';
import { cmsAPI } from '@/services/api';
import { Save, Building2, Share2, Loader2, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CompanyInfoManagement() {
    const { data: cmsData, isLoading, refetch } = useCMS();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const [companyInfo, setCompanyInfo] = useState({
        name: '',
        shortName: '',
        tagline: '',
        phone: '',
        email: '',
        whatsapp: '',
        address: {
            street: '',
            building: '',
            city: '',
            postalCode: '',
            country: ''
        },
        businessHours: {
            weekdays: '',
            saturday: '',
            sunday: ''
        },
        mapEmbedUrl: ''
    });

    const [socialMedia, setSocialMedia] = useState({
        facebook: '',
        instagram: '',
        linkedin: '',
        youtube: ''
    });

    useEffect(() => {
        if (cmsData) {
            if (cmsData.companyInfo) {
                const info = cmsData.companyInfo as any;
                setCompanyInfo({
                    name: info.name || '',
                    shortName: info.shortName || '',
                    tagline: info.tagline || '',
                    phone: info.phone || '',
                    email: info.email || '',
                    whatsapp: info.whatsapp || '',
                    address: {
                        street: info.address?.street || '',
                        building: info.address?.building || '',
                        city: info.address?.city || '',
                        postalCode: info.address?.postalCode || '',
                        country: info.address?.country || ''
                    },
                    businessHours: {
                        weekdays: info.businessHours?.weekdays || '',
                        saturday: info.businessHours?.saturday || '',
                        sunday: info.businessHours?.sunday || ''
                    },
                    mapEmbedUrl: info.mapEmbedUrl || ''
                });
            }
            if (cmsData.socialMedia) {
                setSocialMedia({
                    facebook: cmsData.socialMedia.facebook || '',
                    instagram: cmsData.socialMedia.instagram || '',
                    linkedin: cmsData.socialMedia.linkedin || '',
                    youtube: cmsData.socialMedia.youtube || ''
                });
            }
        }
    }, [cmsData]);

    const handleSaveCompanyInfo = async () => {
        try {
            setIsSaving(true);
            await cmsAPI.updateSection('companyInfo', companyInfo);
            refetch();
            toast({ title: 'Saved!', description: 'Company information updated successfully' });
        } catch (error: any) {
            toast({ title: 'Save Failed', description: error.message || 'Failed to save company info', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSocial = async () => {
        try {
            setIsSaving(true);
            await cmsAPI.updateSection('socialMedia', socialMedia);
            refetch();
            toast({ title: 'Saved!', description: 'Social media links updated successfully' });
        } catch (error: any) {
            toast({ title: 'Save Failed', description: error.message || 'Failed to save social media', variant: 'destructive' });
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
                <h1 className="text-3xl font-bold mb-2">Company Information</h1>
                <p className="text-gray-600 mb-8">Manage company details and social media links</p>

                {/* Company Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Company Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Company Name</Label>
                                <Input
                                    value={companyInfo.name}
                                    onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                                    placeholder="Promach Pte Ltd"
                                />
                            </div>
                            <div>
                                <Label>Short Name</Label>
                                <Input
                                    value={companyInfo.shortName}
                                    onChange={(e) => setCompanyInfo({ ...companyInfo, shortName: e.target.value })}
                                    placeholder="Promach"
                                />
                            </div>
                            <div>
                                <Label>Tagline</Label>
                                <Input
                                    value={companyInfo.tagline}
                                    onChange={(e) => setCompanyInfo({ ...companyInfo, tagline: e.target.value })}
                                    placeholder="Professional Air Conditioning Services"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Phone Number</Label>
                                <Input
                                    value={companyInfo.phone}
                                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                                    placeholder="+65 6123 4567"
                                />
                            </div>
                            <div>
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    value={companyInfo.email}
                                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                                    placeholder="info@promach.com.sg"
                                />
                            </div>
                            <div>
                                <Label>WhatsApp</Label>
                                <Input
                                    value={companyInfo.whatsapp}
                                    onChange={(e) => setCompanyInfo({ ...companyInfo, whatsapp: e.target.value })}
                                    placeholder="+65 9123 4567"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Address */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Street</Label>
                                <Input
                                    value={companyInfo.address.street}
                                    onChange={(e) => setCompanyInfo({
                                        ...companyInfo,
                                        address: { ...companyInfo.address, street: e.target.value }
                                    })}
                                    placeholder="123 Example Road"
                                />
                            </div>
                            <div>
                                <Label>Building</Label>
                                <Input
                                    value={companyInfo.address.building}
                                    onChange={(e) => setCompanyInfo({
                                        ...companyInfo,
                                        address: { ...companyInfo.address, building: e.target.value }
                                    })}
                                    placeholder="#01-01 Example Building"
                                />
                            </div>
                            <div>
                                <Label>City</Label>
                                <Input
                                    value={companyInfo.address.city}
                                    onChange={(e) => setCompanyInfo({
                                        ...companyInfo,
                                        address: { ...companyInfo.address, city: e.target.value }
                                    })}
                                    placeholder="Singapore"
                                />
                            </div>
                            <div>
                                <Label>Postal Code</Label>
                                <Input
                                    value={companyInfo.address.postalCode}
                                    onChange={(e) => setCompanyInfo({
                                        ...companyInfo,
                                        address: { ...companyInfo.address, postalCode: e.target.value }
                                    })}
                                    placeholder="123456"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Label>Google Maps Embed URL</Label>
                            <Input
                                value={companyInfo.mapEmbedUrl}
                                onChange={(e) => setCompanyInfo({ ...companyInfo, mapEmbedUrl: e.target.value })}
                                placeholder="https://www.google.com/maps/embed?pb=..."
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                To get this: Google Maps → Search location → Share → Embed a map → Copy the src URL
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Business Hours */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Business Hours
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Weekdays</Label>
                                <Input
                                    value={companyInfo.businessHours.weekdays}
                                    onChange={(e) => setCompanyInfo({
                                        ...companyInfo,
                                        businessHours: { ...companyInfo.businessHours, weekdays: e.target.value }
                                    })}
                                    placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
                                />
                            </div>
                            <div>
                                <Label>Saturday</Label>
                                <Input
                                    value={companyInfo.businessHours.saturday}
                                    onChange={(e) => setCompanyInfo({
                                        ...companyInfo,
                                        businessHours: { ...companyInfo.businessHours, saturday: e.target.value }
                                    })}
                                    placeholder="Saturday: 9:00 AM - 1:00 PM"
                                />
                            </div>
                            <div>
                                <Label>Sunday</Label>
                                <Input
                                    value={companyInfo.businessHours.sunday}
                                    onChange={(e) => setCompanyInfo({
                                        ...companyInfo,
                                        businessHours: { ...companyInfo.businessHours, sunday: e.target.value }
                                    })}
                                    placeholder="Sunday: Closed"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSaveCompanyInfo} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Company Info
                        </Button>
                    </CardContent>
                </Card>

                {/* Social Media Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            Social Media Links
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Facebook URL</Label>
                                <Input
                                    value={socialMedia.facebook}
                                    onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                                    placeholder="https://facebook.com/yourpage"
                                />
                            </div>
                            <div>
                                <Label>Instagram URL</Label>
                                <Input
                                    value={socialMedia.instagram}
                                    onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                                    placeholder="https://instagram.com/yourpage"
                                />
                            </div>
                            <div>
                                <Label>LinkedIn URL</Label>
                                <Input
                                    value={socialMedia.linkedin}
                                    onChange={(e) => setSocialMedia({ ...socialMedia, linkedin: e.target.value })}
                                    placeholder="https://linkedin.com/company/yourcompany"
                                />
                            </div>
                            <div>
                                <Label>YouTube URL</Label>
                                <Input
                                    value={socialMedia.youtube}
                                    onChange={(e) => setSocialMedia({ ...socialMedia, youtube: e.target.value })}
                                    placeholder="https://youtube.com/@yourchannel"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSaveSocial} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Social Links
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
