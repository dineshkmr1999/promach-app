import { ExternalLink, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Contractor {
    _id: string;
    workhead: string;
    description: string;
    grade: string;
    expiryDate: string;
    isActive: boolean;
}

interface Builder {
    _id: string;
    licensingCode: string;
    description: string;
    expiryDate: string;
    isActive: boolean;
}

interface BCAData {
    sectionTitle?: string;
    companyName?: string;
    uen?: string;
    bcaUrl?: string;
    registeredContractors?: Contractor[];
    licensedBuilders?: Builder[];
}

interface BCARegistrationsSectionProps {
    data?: BCAData;
}

export default function BCARegistrationsSection({ data }: BCARegistrationsSectionProps) {
    // Don't render if no data or empty tables
    const contractors = data?.registeredContractors?.filter(c => c.isActive) || [];
    const builders = data?.licensedBuilders?.filter(b => b.isActive) || [];

    if (contractors.length === 0 && builders.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-muted">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center gap-3 mb-4 px-6 py-2 bg-primary/10 rounded-full">
                        <Award size={24} className="text-primary" />
                        <span className="text-primary font-semibold uppercase tracking-wider text-sm">
                            Government Registered
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
                        {data?.sectionTitle || 'BCA Registrations'}
                    </h2>
                    {(data?.companyName || data?.uen) && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-slate-600">
                            {data?.companyName && (
                                <span className="font-semibold text-lg text-slate-900">{data.companyName}</span>
                            )}
                            {data?.uen && (
                                <span className="text-slate-500">UEN: {data.uen}</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="max-w-5xl mx-auto space-y-12">
                    {/* Registered Contractors Table */}
                    {contractors.length > 0 && (
                        <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 px-6 py-4 border-b border-slate-200">
                                Registered Contractors
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-primary text-white">
                                            <th className="px-6 py-3 text-left text-sm font-semibold">Workheads</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold">Grade</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold">Expiry Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contractors.map((contractor, index) => (
                                            <tr
                                                key={contractor._id}
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 last:border-b-0`}
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {contractor.workhead}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {contractor.description}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-slate-700">
                                                    {contractor.grade}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {contractor.expiryDate}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Licensed Builders Table */}
                    {builders.length > 0 && (
                        <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 px-6 py-4 border-b border-slate-200">
                                Licensed Builders
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-primary text-white">
                                            <th className="px-6 py-3 text-left text-sm font-semibold">Licensing Code</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold">Expiry Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {builders.map((builder, index) => (
                                            <tr
                                                key={builder._id}
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100 last:border-b-0`}
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {builder.licensingCode}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {builder.description}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {builder.expiryDate}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Verify Link */}
                {data?.bcaUrl && (
                    <div className="text-center mt-10">
                        <a
                            href={data.bcaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" className="rounded-full px-6 gap-2 hover:bg-primary hover:text-white transition-colors">
                                <ExternalLink className="h-4 w-4" />
                                Verify on BCA Website
                            </Button>
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
}
