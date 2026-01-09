import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCMS } from '@/hooks/useCMS';
import { cmsAPI } from '@/services/api';
import { Save, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PageSEO {
    page: string;
    title: string;
    description: string;
    keywords: string[];
}

const defaultPageSEO: PageSEO[] = [
    { page: 'home', title: '', description: '', keywords: [] },
    { page: 'airconServices', title: '', description: '', keywords: [] },
    { page: 'renovation', title: '', description: '', keywords: [] },
    { page: 'about', title: '', description: '', keywords: [] },
    { page: 'contact', title: '', description: '', keywords: [] },
];

const pageLabels: Record<string, string> = {
    home: 'Home',
    airconServices: 'Aircon Services',
    renovation: 'Renovation',
    about: 'About Us',
    contact: 'Contact',
    booking: 'Booking',
};

export default function SEOManagement() {
    const { data: cmsData, isLoading, refetch } = useCMS();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [pageSeo, setPageSeo] = useState<PageSEO[]>(defaultPageSEO);

    useEffect(() => {
        if (cmsData) {
            // Check both possible data structures from database
            const seoData = (cmsData as any).pageSeo || (cmsData as any).seo;

            if (Array.isArray(seoData)) {
                // pageSeo array format from database
                setPageSeo(seoData);
            } else if (seoData && typeof seoData === 'object') {
                // Nested object format (seo.home, seo.services, etc.)
                const converted: PageSEO[] = Object.entries(seoData).map(([page, data]: [string, any]) => ({
                    page,
                    title: data?.title || '',
                    description: data?.description || '',
                    keywords: data?.keywords || []
                }));
                if (converted.length > 0) {
                    setPageSeo(converted);
                }
            }
        }
    }, [cmsData]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            // Save as pageSeo array format
            await cmsAPI.updateSection('pageSeo', pageSeo);
            refetch();
            toast({ title: 'Saved!', description: 'SEO settings updated successfully' });
        } catch (error: any) {
            toast({ title: 'Save Failed', description: error.message || 'Failed to save', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const updatePageSEO = (pageKey: string, field: keyof PageSEO, value: string | string[]) => {
        setPageSeo(prev => prev.map(item =>
            item.page === pageKey ? { ...item, [field]: value } : item
        ));
    };

    const handleKeywordsChange = (pageKey: string, value: string) => {
        const keywords = value.split(',').map(k => k.trim()).filter(k => k);
        updatePageSEO(pageKey, 'keywords', keywords);
    };

    const getPageData = (pageKey: string): PageSEO => {
        return pageSeo.find(p => p.page === pageKey) || { page: pageKey, title: '', description: '', keywords: [] };
    };

    const renderPageSEOCard = (pageKey: string) => {
        const pageData = getPageData(pageKey);
        const pageName = pageLabels[pageKey] || pageKey;

        return (
            <Card className="mb-6" key={pageKey}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        {pageName} Page SEO
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Meta Title</Label>
                        <Input
                            value={pageData.title || ''}
                            onChange={(e) => updatePageSEO(pageKey, 'title', e.target.value)}
                            placeholder={`${pageName} | Promach Engineering`}
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                    </div>
                    <div>
                        <Label>Meta Description</Label>
                        <Textarea
                            value={pageData.description || ''}
                            onChange={(e) => updatePageSEO(pageKey, 'description', e.target.value)}
                            placeholder="A brief description of the page content..."
                            rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
                    </div>
                    <div>
                        <Label>Keywords</Label>
                        <Input
                            value={(pageData.keywords || []).join(', ')}
                            onChange={(e) => handleKeywordsChange(pageKey, e.target.value)}
                            placeholder="keyword1, keyword2, keyword3"
                        />
                        <p className="text-xs text-gray-500 mt-1">Comma-separated list of keywords</p>
                    </div>
                </CardContent>
            </Card>
        );
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

    // Get unique page keys from data
    const uniquePages = [...new Set(pageSeo.map(p => p.page))];

    return (
        <AdminLayout>
            <div className="max-w-4xl">
                <h1 className="text-3xl font-bold mb-2">SEO Settings</h1>
                <p className="text-gray-600 mb-8">Manage SEO meta tags for all pages</p>

                {uniquePages.map(pageKey => renderPageSEOCard(pageKey))}

                <Button onClick={handleSave} disabled={isSaving} size="lg">
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save All SEO Settings
                </Button>
            </div>
        </AdminLayout>
    );
}
