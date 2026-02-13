import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Save,
    Plus,
    Trash2,
    Edit,
    Star,
    Sparkles,
    MessageSquare,
    Gift,
    Phone,
    TrendingUp,
    Award
} from 'lucide-react';
import { croSettingsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
    _id?: string;
    name: string;
    location: string;
    rating: number;
    text: string;
    serviceType: 'aircon' | 'renovation';
    date: string;
    isActive: boolean;
}

interface CROSettings {
    discountOffer: {
        isEnabled: boolean;
        discountAmount: string;
        discountText: string;
        expiryHours: number;
        ctaText: string;
    };
    urgencyBanner: {
        isEnabled: boolean;
        message: string;
        ctaText: string;
        backgroundColor: string;
    };
    exitIntentPopup: {
        isEnabled: boolean;
        title: string;
        subtitle: string;
        discountAmount: string;
        ctaText: string;
        dismissText: string;
    };
    trustBadges: {
        yearsExperience: string;
        happyCustomers: string;
        certifications: string;
        guarantee: string;
    };
    testimonials: Testimonial[];
    quickQuoteModal: {
        isEnabled: boolean;
        title: string;
        subtitle: string;
    };
    mobileCTABar: {
        isEnabled: boolean;
        showCallButton: boolean;
        showWhatsAppButton: boolean;
        showQuoteButton: boolean;
    };
}

const defaultSettings: CROSettings = {
    discountOffer: {
        isEnabled: true,
        discountAmount: '$20',
        discountText: '$20 OFF your first service!',
        expiryHours: 24,
        ctaText: 'Claim Now'
    },
    urgencyBanner: {
        isEnabled: true,
        message: 'Limited Time: $20 OFF your first service!',
        ctaText: 'Claim Now →',
        backgroundColor: 'primary'
    },
    exitIntentPopup: {
        isEnabled: true,
        title: "Wait! Don't Leave Yet",
        subtitle: 'Get $20 OFF your first service when you book with us!',
        discountAmount: '$20 OFF',
        ctaText: 'Claim My $20 Discount',
        dismissText: "No thanks, I don't want to save money"
    },
    trustBadges: {
        yearsExperience: '13+',
        happyCustomers: '5,000+',
        certifications: '4x ISO',
        guarantee: 'BCA Registered'
    },
    testimonials: [],
    quickQuoteModal: {
        isEnabled: true,
        title: 'Get Your Free Quote',
        subtitle: 'Takes less than 60 seconds'
    },
    mobileCTABar: {
        isEnabled: true,
        showCallButton: true,
        showWhatsAppButton: true,
        showQuoteButton: true
    }
};

export default function CROSettingsManagement() {
    const [settings, setSettings] = useState<CROSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [showTestimonialForm, setShowTestimonialForm] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await croSettingsAPI.getSettings();
            setSettings({ ...defaultSettings, ...data });
        } catch (error) {
            console.error('Error fetching CRO settings:', error);
            toast({
                title: 'Error',
                description: 'Failed to load CRO settings',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await croSettingsAPI.updateSettings({
                discountOffer: settings.discountOffer,
                urgencyBanner: settings.urgencyBanner,
                exitIntentPopup: settings.exitIntentPopup,
                trustBadges: settings.trustBadges,
                quickQuoteModal: settings.quickQuoteModal,
                mobileCTABar: settings.mobileCTABar
            });
            toast({
                title: 'Success',
                description: 'CRO settings saved successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save settings',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAddTestimonial = async (testimonial: Omit<Testimonial, '_id'>) => {
        try {
            await croSettingsAPI.addTestimonial(testimonial);
            toast({ title: 'Success', description: 'Testimonial added' });
            fetchSettings();
            setShowTestimonialForm(false);
            setEditingTestimonial(null);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add testimonial', variant: 'destructive' });
        }
    };

    const handleUpdateTestimonial = async (id: string, testimonial: Partial<Testimonial>) => {
        try {
            await croSettingsAPI.updateTestimonial(id, testimonial);
            toast({ title: 'Success', description: 'Testimonial updated' });
            fetchSettings();
            setShowTestimonialForm(false);
            setEditingTestimonial(null);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update testimonial', variant: 'destructive' });
        }
    };

    const handleDeleteTestimonial = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            await croSettingsAPI.deleteTestimonial(id);
            toast({ title: 'Success', description: 'Testimonial deleted' });
            fetchSettings();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete testimonial', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            CRO Settings
                        </h1>
                        <p className="text-muted-foreground">Manage conversion rate optimization elements</p>
                    </div>
                    <Button onClick={handleSaveSettings} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save All Settings'}
                    </Button>
                </div>

                <Tabs defaultValue="discounts" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="discounts">
                            <Gift className="h-4 w-4 mr-2" />
                            Discounts
                        </TabsTrigger>
                        <TabsTrigger value="popups">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Popups
                        </TabsTrigger>
                        <TabsTrigger value="testimonials">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Testimonials
                        </TabsTrigger>
                        <TabsTrigger value="trust">
                            <Award className="h-4 w-4 mr-2" />
                            Trust Badges
                        </TabsTrigger>
                        <TabsTrigger value="mobile">
                            <Phone className="h-4 w-4 mr-2" />
                            Mobile CTA
                        </TabsTrigger>
                    </TabsList>

                    {/* Discounts Tab */}
                    <TabsContent value="discounts" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gift className="h-5 w-5" />
                                    Discount Offer
                                </CardTitle>
                                <CardDescription>Configure the discount amount and messaging</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="discountEnabled">Enable Discount Offer</Label>
                                    <Switch
                                        id="discountEnabled"
                                        checked={settings.discountOffer.isEnabled}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                discountOffer: { ...prev.discountOffer, isEnabled: checked }
                                            }))
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="discountAmount">Discount Amount</Label>
                                        <Input
                                            id="discountAmount"
                                            value={settings.discountOffer.discountAmount}
                                            onChange={(e) =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    discountOffer: { ...prev.discountOffer, discountAmount: e.target.value }
                                                }))
                                            }
                                            placeholder="$20"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="expiryHours">Expiry (hours)</Label>
                                        <Input
                                            id="expiryHours"
                                            type="number"
                                            value={settings.discountOffer.expiryHours}
                                            onChange={(e) =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    discountOffer: { ...prev.discountOffer, expiryHours: parseInt(e.target.value) || 24 }
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="discountText">Discount Text</Label>
                                    <Input
                                        id="discountText"
                                        value={settings.discountOffer.discountText}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                discountOffer: { ...prev.discountOffer, discountText: e.target.value }
                                            }))
                                        }
                                        placeholder="$20 OFF your first service!"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ctaText">CTA Button Text</Label>
                                    <Input
                                        id="ctaText"
                                        value={settings.discountOffer.ctaText}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                discountOffer: { ...prev.discountOffer, ctaText: e.target.value }
                                            }))
                                        }
                                        placeholder="Claim Now"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Urgency Banner</CardTitle>
                                <CardDescription>The banner shown at the top of the website</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="bannerEnabled">Enable Urgency Banner</Label>
                                    <Switch
                                        id="bannerEnabled"
                                        checked={settings.urgencyBanner.isEnabled}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                urgencyBanner: { ...prev.urgencyBanner, isEnabled: checked }
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="bannerMessage">Banner Message</Label>
                                    <Input
                                        id="bannerMessage"
                                        value={settings.urgencyBanner.message}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                urgencyBanner: { ...prev.urgencyBanner, message: e.target.value }
                                            }))
                                        }
                                        placeholder="Limited Time: $20 OFF your first service!"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="bannerCta">Banner CTA Text</Label>
                                    <Input
                                        id="bannerCta"
                                        value={settings.urgencyBanner.ctaText}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                urgencyBanner: { ...prev.urgencyBanner, ctaText: e.target.value }
                                            }))
                                        }
                                        placeholder="Claim Now →"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Popups Tab */}
                    <TabsContent value="popups" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Exit Intent Popup</CardTitle>
                                <CardDescription>Shown when user tries to leave the page</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="exitEnabled">Enable Exit Intent Popup</Label>
                                    <Switch
                                        id="exitEnabled"
                                        checked={settings.exitIntentPopup.isEnabled}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                exitIntentPopup: { ...prev.exitIntentPopup, isEnabled: checked }
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="exitTitle">Popup Title</Label>
                                    <Input
                                        id="exitTitle"
                                        value={settings.exitIntentPopup.title}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                exitIntentPopup: { ...prev.exitIntentPopup, title: e.target.value }
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="exitSubtitle">Popup Subtitle</Label>
                                    <Input
                                        id="exitSubtitle"
                                        value={settings.exitIntentPopup.subtitle}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                exitIntentPopup: { ...prev.exitIntentPopup, subtitle: e.target.value }
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="exitDiscount">Discount Badge Text</Label>
                                    <Input
                                        id="exitDiscount"
                                        value={settings.exitIntentPopup.discountAmount}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                exitIntentPopup: { ...prev.exitIntentPopup, discountAmount: e.target.value }
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="exitCta">CTA Button Text</Label>
                                    <Input
                                        id="exitCta"
                                        value={settings.exitIntentPopup.ctaText}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                exitIntentPopup: { ...prev.exitIntentPopup, ctaText: e.target.value }
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="exitDismiss">Dismiss Text</Label>
                                    <Input
                                        id="exitDismiss"
                                        value={settings.exitIntentPopup.dismissText}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                exitIntentPopup: { ...prev.exitIntentPopup, dismissText: e.target.value }
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Quote Modal</CardTitle>
                                <CardDescription>The lead capture modal settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="quoteEnabled">Enable Quick Quote Modal</Label>
                                    <Switch
                                        id="quoteEnabled"
                                        checked={settings.quickQuoteModal.isEnabled}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                quickQuoteModal: { ...prev.quickQuoteModal, isEnabled: checked }
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="quoteTitle">Modal Title</Label>
                                    <Input
                                        id="quoteTitle"
                                        value={settings.quickQuoteModal.title}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                quickQuoteModal: { ...prev.quickQuoteModal, title: e.target.value }
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="quoteSubtitle">Modal Subtitle</Label>
                                    <Input
                                        id="quoteSubtitle"
                                        value={settings.quickQuoteModal.subtitle}
                                        onChange={(e) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                quickQuoteModal: { ...prev.quickQuoteModal, subtitle: e.target.value }
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Testimonials Tab */}
                    <TabsContent value="testimonials" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Customer Testimonials</CardTitle>
                                    <CardDescription>Manage customer reviews displayed on the homepage</CardDescription>
                                </div>
                                <Button onClick={() => {
                                    setEditingTestimonial(null);
                                    setShowTestimonialForm(true);
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Testimonial
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {showTestimonialForm && (
                                    <TestimonialForm
                                        testimonial={editingTestimonial}
                                        onSave={(data) => {
                                            if (editingTestimonial?._id) {
                                                handleUpdateTestimonial(editingTestimonial._id, data);
                                            } else {
                                                handleAddTestimonial(data);
                                            }
                                        }}
                                        onCancel={() => {
                                            setShowTestimonialForm(false);
                                            setEditingTestimonial(null);
                                        }}
                                    />
                                )}

                                <div className="space-y-4 mt-4">
                                    {settings.testimonials?.map((testimonial) => (
                                        <div key={testimonial._id} className="border rounded-lg p-4 flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-semibold">{testimonial.name}</span>
                                                    <span className="text-muted-foreground text-sm">• {testimonial.location}</span>
                                                    <span className={`text-xs px-2 py-1 rounded ${testimonial.serviceType === 'aircon' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {testimonial.serviceType}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[...Array(testimonial.rating)].map((_, i) => (
                                                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingTestimonial(testimonial);
                                                        setShowTestimonialForm(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => testimonial._id && handleDeleteTestimonial(testimonial._id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!settings.testimonials || settings.testimonials.length === 0) && !showTestimonialForm && (
                                        <p className="text-center text-muted-foreground py-8">No testimonials yet. Add your first testimonial!</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Trust Badges Tab */}
                    <TabsContent value="trust" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Trust Badges</CardTitle>
                                <CardDescription>Statistics displayed to build trust with visitors</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="yearsExp">Years of Experience</Label>
                                        <Input
                                            id="yearsExp"
                                            value={settings.trustBadges.yearsExperience}
                                            onChange={(e) =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    trustBadges: { ...prev.trustBadges, yearsExperience: e.target.value }
                                                }))
                                            }
                                            placeholder="13+"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="happyCustomers">Happy Customers</Label>
                                        <Input
                                            id="happyCustomers"
                                            value={settings.trustBadges.happyCustomers}
                                            onChange={(e) =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    trustBadges: { ...prev.trustBadges, happyCustomers: e.target.value }
                                                }))
                                            }
                                            placeholder="5,000+"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="certifications">Certifications</Label>
                                        <Input
                                            id="certifications"
                                            value={settings.trustBadges.certifications}
                                            onChange={(e) =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    trustBadges: { ...prev.trustBadges, certifications: e.target.value }
                                                }))
                                            }
                                            placeholder="4x ISO"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="guarantee">Guarantee/Badge</Label>
                                        <Input
                                            id="guarantee"
                                            value={settings.trustBadges.guarantee}
                                            onChange={(e) =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    trustBadges: { ...prev.trustBadges, guarantee: e.target.value }
                                                }))
                                            }
                                            placeholder="BCA Registered"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Mobile CTA Tab */}
                    <TabsContent value="mobile" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mobile CTA Bar</CardTitle>
                                <CardDescription>Fixed bottom bar shown on mobile devices</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="mobileEnabled">Enable Mobile CTA Bar</Label>
                                    <Switch
                                        id="mobileEnabled"
                                        checked={settings.mobileCTABar.isEnabled}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                mobileCTABar: { ...prev.mobileCTABar, isEnabled: checked }
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="showCall">Show Call Button</Label>
                                    <Switch
                                        id="showCall"
                                        checked={settings.mobileCTABar.showCallButton}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                mobileCTABar: { ...prev.mobileCTABar, showCallButton: checked }
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="showWhatsApp">Show WhatsApp Button</Label>
                                    <Switch
                                        id="showWhatsApp"
                                        checked={settings.mobileCTABar.showWhatsAppButton}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                mobileCTABar: { ...prev.mobileCTABar, showWhatsAppButton: checked }
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="showQuote">Show Get Quote Button</Label>
                                    <Switch
                                        id="showQuote"
                                        checked={settings.mobileCTABar.showQuoteButton}
                                        onCheckedChange={(checked) =>
                                            setSettings(prev => ({
                                                ...prev,
                                                mobileCTABar: { ...prev.mobileCTABar, showQuoteButton: checked }
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}

// Testimonial Form Component
function TestimonialForm({
    testimonial,
    onSave,
    onCancel
}: {
    testimonial: Testimonial | null;
    onSave: (data: Omit<Testimonial, '_id'>) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        name: testimonial?.name || '',
        location: testimonial?.location || 'Singapore',
        rating: testimonial?.rating || 5,
        text: testimonial?.text || '',
        serviceType: testimonial?.serviceType || 'aircon' as 'aircon' | 'renovation',
        date: testimonial?.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        isActive: testimonial?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Customer Name</Label>
                    <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select
                        value={form.serviceType}
                        onValueChange={(value: 'aircon' | 'renovation') => setForm({ ...form, serviceType: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="aircon">Aircon</SelectItem>
                            <SelectItem value="renovation">Renovation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Select
                        value={form.rating.toString()}
                        onValueChange={(value) => setForm({ ...form, rating: parseInt(value) })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <SelectItem key={r} value={r.toString()}>
                                    {r} Star{r > 1 ? 's' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <Label htmlFor="text">Review Text</Label>
                <Textarea
                    id="text"
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    rows={3}
                    required
                />
            </div>
            <div className="flex gap-2">
                <Button type="submit">
                    {testimonial?._id ? 'Update' : 'Add'} Testimonial
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
