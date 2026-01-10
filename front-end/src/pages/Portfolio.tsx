import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Tag, ZoomIn, ImageOff } from 'lucide-react';
import { portfolioAPI } from '@/services/api';

// Backend URL for serving images
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

// Before/After Image component with proper loading and error states
const BeforeAfterImage = ({
    src,
    alt,
    borderColor
}: {
    src: string;
    alt: string;
    borderColor: string;
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    if (hasError) {
        return (
            <div className={`w-full h-20 bg-white/5 rounded-lg border-2 ${borderColor} flex items-center justify-center`}>
                <div className="text-center">
                    <ImageOff className="w-5 h-5 text-white/30 mx-auto mb-1" />
                    <span className="text-white/40 text-xs">Image unavailable</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {isLoading && (
                <div className={`absolute inset-0 bg-white/5 rounded-lg border-2 ${borderColor} flex items-center justify-center`}>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={`w-full h-auto rounded-lg border-2 ${borderColor} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
};

interface PortfolioImage {
    url: string;
    filename: string;
    caption: string;
}

interface PortfolioItem {
    _id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    images: PortfolioImage[];
    beforeImages?: PortfolioImage[];
    afterImages?: PortfolioImage[];
    location: string;
    isFeatured: boolean;
    completedAt: string;
}

// Image with type for carousel
interface CarouselImage {
    url: string;
    type: 'main' | 'before' | 'after';
}

// Portfolio Card with Image Carousel
const PortfolioCard = ({
    item,
    index,
    onClick
}: {
    item: PortfolioItem;
    index: number;
    onClick: () => void;
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Combine all images with types
    const allImages: CarouselImage[] = useMemo(() => {
        const imgs: CarouselImage[] = [];
        if (item.images && item.images.length > 0) {
            item.images.forEach(img => imgs.push({ url: img.url, type: 'main' }));
        }
        if (item.beforeImages && item.beforeImages.length > 0) {
            item.beforeImages.forEach(img => imgs.push({ url: img.url, type: 'before' }));
        }
        if (item.afterImages && item.afterImages.length > 0) {
            item.afterImages.forEach(img => imgs.push({ url: img.url, type: 'after' }));
        }
        return imgs;
    }, [item]);

    // Auto-rotate images every 3 seconds
    useEffect(() => {
        if (allImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % allImages.length);
            setIsLoaded(false);
        }, 3000);

        return () => clearInterval(interval);
    }, [allImages.length]);

    const currentImage = allImages[currentIndex];
    const hasMultipleImages = allImages.length > 1;
    const hasBeforeAfter = (item.beforeImages?.length || 0) > 0 || (item.afterImages?.length || 0) > 0;

    const getTypeLabel = (type: 'main' | 'before' | 'after') => {
        switch (type) {
            case 'main': return { text: 'Main', color: 'bg-blue-500' };
            case 'before': return { text: 'Before', color: 'bg-red-500' };
            case 'after': return { text: 'After', color: 'bg-green-500' };
        }
    };

    return (
        <div
            className="group bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border border-border"
            onClick={onClick}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            {/* Image Container */}
            <div className="aspect-[4/3] overflow-hidden relative bg-muted">
                {allImages.length > 0 ? (
                    <>
                        <img
                            src={`${API_URL}${currentImage.url}`}
                            alt={item.title}
                            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                            loading="lazy"
                            onLoad={() => setIsLoaded(true)}
                        />
                        {!isLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Image Type Tag */}
                        {hasMultipleImages && (
                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <span className={`${getTypeLabel(currentImage.type).color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                                    {getTypeLabel(currentImage.type).text}
                                </span>
                                <span className="bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                                    {currentIndex + 1}/{allImages.length}
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-primary text-lg font-medium">{item.title}</span>
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div className="text-white">
                        <p className="text-sm font-medium opacity-90">Click to view</p>
                        {allImages.length > 1 && (
                            <p className="text-xs opacity-70">{allImages.length} photos</p>
                        )}
                    </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-sm text-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg">
                        {item.category}
                    </span>
                </div>

                {/* Featured Badge */}
                {item.isFeatured && (
                    <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            ⭐ Featured
                        </span>
                    </div>
                )}

                {/* Before/After indicator */}
                {hasBeforeAfter && !hasMultipleImages && (
                    <div className="absolute bottom-4 left-4 bg-gradient-to-r from-red-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ↔ Before/After
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                </h3>

                {item.location && (
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
                        <MapPin size={14} />
                        <span>{item.location}</span>
                    </div>
                )}

                {item.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{item.description}</p>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                        {item.tags.length > 3 && (
                            <span className="text-muted-foreground text-xs">+{item.tags.length - 3} more</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const CATEGORIES = [
    { value: 'all', label: 'All Projects' },
    { value: 'aircon', label: 'Aircon Services' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'installation', label: 'Installation' },
];

export default function Portfolio() {
    const [allItems, setAllItems] = useState<PortfolioItem[]>([]);
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [lightboxTab, setLightboxTab] = useState<'main' | 'before' | 'after'>('main');

    // Fetch portfolio items from backend
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await portfolioAPI.getAll();
                const portfolioData = Array.isArray(data) ? data : [];
                setAllItems(portfolioData);
                setItems(portfolioData);
            } catch (err) {
                console.error('Failed to fetch portfolio:', err);
                setError('Failed to load portfolio. Please try again.');
                setAllItems([]);
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPortfolio();
    }, []);

    // Filter items by category
    useEffect(() => {
        if (selectedCategory === 'all') {
            setItems(allItems);
        } else {
            setItems(allItems.filter(item => item.category === selectedCategory));
        }
    }, [selectedCategory, allItems]);

    const openLightbox = (item: PortfolioItem) => {
        setSelectedItem(item);
        setCurrentImageIndex(0);
        setIsImageLoaded(false);
        setImageError(false);
        // Set initial tab based on which images exist
        if (item.images && item.images.length > 0) {
            setLightboxTab('main');
        } else if (item.beforeImages && item.beforeImages.length > 0) {
            setLightboxTab('before');
        } else if (item.afterImages && item.afterImages.length > 0) {
            setLightboxTab('after');
        } else {
            setLightboxTab('main');
        }
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedItem(null);
        setCurrentImageIndex(0);
        setLightboxTab('main');
        document.body.style.overflow = 'auto';
    };

    // Get current images based on active tab
    const getCurrentImages = () => {
        if (!selectedItem) return [];
        switch (lightboxTab) {
            case 'main': return selectedItem.images || [];
            case 'before': return selectedItem.beforeImages || [];
            case 'after': return selectedItem.afterImages || [];
            default: return [];
        }
    };

    const nextImage = () => {
        const images = getCurrentImages();
        if (images.length > 1) {
            setIsImageLoaded(false);
            setImageError(false);
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        const images = getCurrentImages();
        if (images.length > 1) {
            setIsImageLoaded(false);
            setImageError(false);
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const switchTab = (tab: 'main' | 'before' | 'after') => {
        setLightboxTab(tab);
        setCurrentImageIndex(0);
        setIsImageLoaded(false);
        setImageError(false);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedItem) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItem]);

    return (
        <Layout
            seo={{
                title: 'Our Portfolio - Recent Projects | Promach',
                description: 'Browse our completed aircon servicing, installation, and renovation projects. Quality workmanship guaranteed.',
                keywords: ['portfolio', 'projects', 'aircon work', 'renovation projects'],
                canonical: '/portfolio',
            }}
        >
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Portfolio</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Explore our showcase of completed projects. Each one represents our commitment to excellence and customer satisfaction.
                    </p>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="bg-background border-b border-border sticky top-0 z-40 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                        {CATEGORIES.map((cat) => (
                            <Button
                                key={cat.value}
                                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`rounded-full transition-all duration-300 ${selectedCategory === cat.value
                                    ? 'shadow-lg shadow-primary/25'
                                    : 'hover:border-primary hover:text-primary'
                                    }`}
                            >
                                {cat.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="py-16 bg-gradient-to-b from-secondary/50 to-background min-h-[60vh]">
                <div className="container mx-auto px-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            </div>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                                <ZoomIn className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground text-lg">No projects found in this category.</p>
                            <p className="text-muted-foreground/70 mt-2">Check back soon for new additions!</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.map((item, index) => (
                                <PortfolioCard
                                    key={item._id}
                                    item={item}
                                    index={index}
                                    onClick={() => openLightbox(item)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-fade-in"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                    >
                        <X size={24} />
                    </button>

                    {/* Main content */}
                    <div
                        className="max-w-6xl w-full mx-4 flex flex-col lg:flex-row gap-6 max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image Section */}
                        <div className="flex-1 relative flex flex-col min-h-[300px] lg:min-h-[500px]">
                            {/* Tab Buttons */}
                            {((selectedItem.images?.length || 0) > 0 ||
                                (selectedItem.beforeImages?.length || 0) > 0 ||
                                (selectedItem.afterImages?.length || 0) > 0) && (
                                    <div className="flex justify-center gap-2 mb-4">
                                        {(selectedItem.images?.length || 0) > 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); switchTab('main'); }}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${lightboxTab === 'main'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                            >
                                                Main ({selectedItem.images.length})
                                            </button>
                                        )}
                                        {(selectedItem.beforeImages?.length || 0) > 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); switchTab('before'); }}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${lightboxTab === 'before'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                            >
                                                Before ({selectedItem.beforeImages.length})
                                            </button>
                                        )}
                                        {(selectedItem.afterImages?.length || 0) > 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); switchTab('after'); }}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${lightboxTab === 'after'
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                            >
                                                After ({selectedItem.afterImages.length})
                                            </button>
                                        )}
                                    </div>
                                )}

                            {/* Image Viewer */}
                            <div className="flex-1 relative flex items-center justify-center">
                                {/* Navigation arrows */}
                                {getCurrentImages().length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                            className="absolute left-2 z-10 w-12 h-12 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                                        >
                                            <ChevronLeft size={28} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                            className="absolute right-2 z-10 w-12 h-12 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                                        >
                                            <ChevronRight size={28} />
                                        </button>
                                    </>
                                )}

                                {/* Main Image with animation */}
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {getCurrentImages().length === 0 ? (
                                        <div className="flex flex-col items-center justify-center text-white/50">
                                            <ImageOff className="w-16 h-16 mb-4" />
                                            <p className="text-lg">No images available</p>
                                        </div>
                                    ) : imageError ? (
                                        <div className="flex flex-col items-center justify-center text-white/50">
                                            <ImageOff className="w-16 h-16 mb-4" />
                                            <p className="text-lg">Image unavailable</p>
                                            <p className="text-sm mt-2">The image could not be loaded</p>
                                        </div>
                                    ) : (
                                        <>
                                            {!isImageLoaded && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                                </div>
                                            )}
                                            <img
                                                key={`${lightboxTab}-${currentImageIndex}`}
                                                src={`${API_URL}${getCurrentImages()[currentImageIndex]?.url}`}
                                                alt={`${selectedItem.title} - ${lightboxTab} ${currentImageIndex + 1}`}
                                                className={`max-w-full max-h-[55vh] lg:max-h-[65vh] object-contain rounded-lg shadow-2xl transition-all duration-500 ${isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                                                onLoad={() => { setIsImageLoaded(true); setImageError(false); }}
                                                onError={() => { setIsImageLoaded(true); setImageError(true); }}
                                            />
                                        </>
                                    )}
                                </div>

                                {/* Image counter */}
                                {getCurrentImages().length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                                        {currentImageIndex + 1} / {getCurrentImages().length}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details Panel */}
                        <div className="lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white overflow-y-auto max-h-[30vh] lg:max-h-[70vh]">
                            <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                                {selectedItem.category}
                            </span>
                            <h2 className="text-2xl font-bold mt-2 mb-4">{selectedItem.title}</h2>

                            {selectedItem.location && (
                                <div className="flex items-center gap-2 text-white/70 mb-3">
                                    <MapPin size={16} />
                                    <span className="text-sm">{selectedItem.location}</span>
                                </div>
                            )}

                            {selectedItem.completedAt && (
                                <div className="flex items-center gap-2 text-white/70 mb-4">
                                    <Calendar size={16} />
                                    <span className="text-sm">
                                        {new Date(selectedItem.completedAt).toLocaleDateString('en-SG', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}

                            {selectedItem.description && (
                                <p className="text-white/80 text-sm leading-relaxed mb-6">{selectedItem.description}</p>
                            )}

                            {selectedItem.tags.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-2">
                                        <Tag size={12} />
                                        <span>Tags</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedItem.tags.map((tag) => (
                                            <span key={tag} className="bg-white/20 text-white px-3 py-1 rounded-full text-xs">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Before & After Comparison */}
                            {((selectedItem.beforeImages && selectedItem.beforeImages.length > 0) ||
                                (selectedItem.afterImages && selectedItem.afterImages.length > 0)) && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Before & After</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Before Images */}
                                            <div>
                                                <p className="text-red-400 text-xs font-medium mb-2">Before</p>
                                                <div className="space-y-2">
                                                    {selectedItem.beforeImages && selectedItem.beforeImages.length > 0 ? (
                                                        selectedItem.beforeImages.map((img, idx) => (
                                                            <BeforeAfterImage
                                                                key={`before-${idx}`}
                                                                src={`${API_URL}${img.url}`}
                                                                alt={`Before ${idx + 1}`}
                                                                borderColor="border-red-500/30"
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="w-full h-20 bg-white/5 rounded-lg border-2 border-red-500/30 flex items-center justify-center">
                                                            <span className="text-white/40 text-xs">No before image</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* After Images */}
                                            <div>
                                                <p className="text-green-400 text-xs font-medium mb-2">After</p>
                                                <div className="space-y-2">
                                                    {selectedItem.afterImages && selectedItem.afterImages.length > 0 ? (
                                                        selectedItem.afterImages.map((img, idx) => (
                                                            <BeforeAfterImage
                                                                key={`after-${idx}`}
                                                                src={`${API_URL}${img.url}`}
                                                                alt={`After ${idx + 1}`}
                                                                borderColor="border-green-500/30"
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="w-full h-20 bg-white/5 rounded-lg border-2 border-green-500/30 flex items-center justify-center">
                                                            <span className="text-white/40 text-xs">No after image</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )
            }

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-primary via-primary to-blue-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Project?</h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        Let us help bring your vision to life. Contact us today for a free consultation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" className="rounded-full px-8 text-lg" asChild>
                            <a href="/booking">Get a Free Quote</a>
                        </Button>
                        <Button size="lg" className="rounded-full px-8 text-lg bg-white text-primary hover:bg-white/90 border-0" asChild>
                            <a href="/contact">Contact Us</a>
                        </Button>
                    </div>
                </div>
            </section>
        </Layout >
    );
}
