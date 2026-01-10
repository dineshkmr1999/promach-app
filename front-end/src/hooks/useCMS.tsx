import { useState, useEffect, useCallback } from 'react';

interface CMSData {
    pricingTables?: any[];
    additionalServices?: any;
    brands?: string[];
    brandsWithLogos?: Array<{ _id: string; name: string; logo?: string; isActive?: boolean; order?: number }>;
    certificates?: any[];
    seo?: any;
    pageSeo?: any[];
    seoConfig?: any;
    companyInfo?: {
        name?: string;
        shortName?: string;
        tagline?: string;
        phone?: string;
        email?: string;
        whatsapp?: string;
        mapEmbedUrl?: string;
        address?: {
            street?: string;
            building?: string;
            city?: string;
            postalCode?: string;
            country?: string;
        } | string;
        businessHours?: {
            weekdays?: string;
            saturday?: string;
            sunday?: string;
        } | string;
        social?: {
            facebook?: string;
            instagram?: string;
            linkedin?: string;
            youtube?: string;
        };
    };
    company?: {
        name?: string;
        phone?: string;
        email?: string;
        address?: string;
        businessHours?: string;
    };
    socialMedia?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
    };
    contactPage?: {
        heroTitle?: string;
        heroSubtitle?: string;
        formTitle?: string;
        formDescription?: string;
        mapEmbedUrl?: string;
        additionalInfo?: string;
    };
    aboutPage?: any;
    bcaRegistrations?: {
        sectionTitle?: string;
        companyName?: string;
        uen?: string;
        bcaUrl?: string;
        registeredContractors?: Array<{
            _id: string;
            workhead: string;
            description: string;
            grade: string;
            expiryDate: string;
            isActive: boolean;
        }>;
        licensedBuilders?: Array<{
            _id: string;
            licensingCode: string;
            description: string;
            expiryDate: string;
            isActive: boolean;
        }>;
    };
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function useCMS() {
    const [data, setData] = useState<CMSData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/cms`);

            if (!response.ok) {
                throw new Error('Failed to fetch CMS data');
            }

            const jsonData = await response.json();

            // Map companyInfo to company for compatibility
            // Also extract socialMedia from companyInfo.social if not at top level
            const mappedData: CMSData = {
                ...jsonData,
                company: jsonData.companyInfo || jsonData.company,
                socialMedia: jsonData.socialMedia || jsonData.companyInfo?.social || {}
            };

            setData(mappedData);
            setError(null);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching CMS data:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Removed auto-refresh interval to prevent scroll position issues
        // Data will be refreshed when user navigates or manually triggers refetch
    }, [fetchData]);

    // Expose refetch for manual refresh after mutations
    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch };
}
