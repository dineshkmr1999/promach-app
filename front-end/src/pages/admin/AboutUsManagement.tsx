import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCMS } from '@/hooks/useCMS';
import { cmsAPI } from '@/services/api';
import { Save, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AboutUsManagement() {
    const { data: cmsData, isLoading, refetch } = useCMS();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const [aboutPage, setAboutPage] = useState({
        heroTitle: '',
        heroSubtitle: '',
        missionTitle: '',
        missionText: '',
        visionTitle: '',
        visionText: '',
        historyText: ''
    });

    useEffect(() => {
        if ((cmsData as any)?.aboutPage) {
            setAboutPage((cmsData as any).aboutPage);
        }
    }, [cmsData]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await cmsAPI.updateSection('aboutPage', aboutPage);
            refetch();
            toast({ title: 'Saved!', description: 'About page content updated successfully' });
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
                <h1 className="text-3xl font-bold mb-2">About Us Page</h1>
                <p className="text-gray-600 mb-8">Manage content for the About page</p>

                {/* Hero Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Hero Section
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Hero Title</Label>
                            <Input
                                value={aboutPage.heroTitle}
                                onChange={(e) => setAboutPage({ ...aboutPage, heroTitle: e.target.value })}
                                placeholder="About Promach Engineering"
                            />
                        </div>
                        <div>
                            <Label>Hero Subtitle</Label>
                            <Textarea
                                value={aboutPage.heroSubtitle}
                                onChange={(e) => setAboutPage({ ...aboutPage, heroSubtitle: e.target.value })}
                                placeholder="Your trusted partner for professional ACMV services..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Mission & Vision */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Mission & Vision</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Mission Title</Label>
                                <Input
                                    value={aboutPage.missionTitle}
                                    onChange={(e) => setAboutPage({ ...aboutPage, missionTitle: e.target.value })}
                                    placeholder="Our Mission"
                                />
                            </div>
                            <div>
                                <Label>Vision Title</Label>
                                <Input
                                    value={aboutPage.visionTitle}
                                    onChange={(e) => setAboutPage({ ...aboutPage, visionTitle: e.target.value })}
                                    placeholder="Our Vision"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Mission Text</Label>
                            <Textarea
                                value={aboutPage.missionText}
                                onChange={(e) => setAboutPage({ ...aboutPage, missionText: e.target.value })}
                                placeholder="To provide exceptional ACMV solutions..."
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label>Vision Text</Label>
                            <Textarea
                                value={aboutPage.visionText}
                                onChange={(e) => setAboutPage({ ...aboutPage, visionText: e.target.value })}
                                placeholder="To be the leading provider..."
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Company History */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Company History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>History Text</Label>
                            <Textarea
                                value={aboutPage.historyText}
                                onChange={(e) => setAboutPage({ ...aboutPage, historyText: e.target.value })}
                                placeholder="Founded in 2005, Promach Engineering..."
                                rows={6}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={handleSave} disabled={isSaving} size="lg">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save All Changes
                </Button>
            </div>
        </AdminLayout>
    );
}
