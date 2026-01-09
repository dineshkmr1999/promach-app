import { Award, Shield, AlertTriangle, CheckCircle, Star } from "lucide-react";

interface Certificate {
    name: string;
    file: string;
    icon: React.ReactNode;
}

const CERTIFICATES: Certificate[] = [
    {
        name: "ISO 9001",
        file: "PROMACH PTE. LTD. 9001-Original.pdf",
        icon: <Award size={40} className="text-primary" />
    },
    {
        name: "ISO 14001",
        file: "1st Surveillance Certificate 14001 PROMACH PTE. LTD..pdf",
        icon: <Shield size={40} className="text-primary" />
    },
    {
        name: "ISO 45001",
        file: "PROMACH PTE. LTD. 45001-Original.pdf",
        icon: <AlertTriangle size={40} className="text-primary" />
    },
    {
        name: "ISO 37001",
        file: "1st Surveillance Certificate 37001 PROMACH PTE. LTD_.pdf",
        icon: <CheckCircle size={40} className="text-primary" />
    },
    {
        name: "BizSafe Star",
        file: "PROMACH PTE LTD  BIZ SAFE STAR.pdf",
        icon: <Star size={40} className="text-primary" />
    },
];

const CertificatesSection = () => {
    const openCertificate = (fileName: string) => {
        const url = `/certificates/${fileName}`;
        window.open(url, "_blank");
    };

    return (
        <section className="py-16 bg-secondary">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Award size={32} className="text-primary" />
                        <h2 className="text-3xl md:text-4xl font-bold">Our Certifications</h2>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Certified and accredited by leading international standards organizations. Click on any certificate to view the full document.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 items-center justify-items-center max-w-6xl mx-auto mb-12">
                    <button
                        onClick={() => openCertificate(CERTIFICATES[0].file)}
                        title="Click to view ISO 9001 certificate"
                        className="hover:scale-110 transition-transform cursor-pointer"
                    >
                        <img src={iso9001} alt="ISO 9001 Certified" className="h-24 w-auto object-contain" />
                    </button>
                    <button
                        onClick={() => openCertificate(CERTIFICATES[1].file)}
                        title="Click to view ISO 14001 certificate"
                        className="hover:scale-110 transition-transform cursor-pointer"
                    >
                        <img src={iso14001} alt="ISO 14001 Certified" className="h-24 w-auto object-contain" />
                    </button>
                    <button
                        onClick={() => openCertificate(CERTIFICATES[2].file)}
                        title="Click to view ISO 45001 certificate"
                        className="hover:scale-110 transition-transform cursor-pointer"
                    >
                        <img src={iso45001} alt="ISO 45001 Certified" className="h-24 w-auto object-contain" />
                    </button>
                    <button
                        onClick={() => openCertificate(CERTIFICATES[3].file)}
                        title="Click to view ISO 37001 certificate"
                        className="hover:scale-110 transition-transform cursor-pointer"
                    >
                        <img src={iso37001} alt="ISO 37001 Certified" className="h-24 w-auto object-contain" />
                    </button>
                    <img src={sccIso} alt="SCC Accredited CB-MS" className="h-24 w-auto object-contain" />
                    <img src={uafIso} alt="United Accreditation Foundation" className="h-24 w-auto object-contain" />
                    <img src={dunsNumber} alt="Dun & Bradstreet DUNS Number" className="h-24 w-auto object-contain" />
                </div>

                <div className="mt-12 p-6 bg-background border border-border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                        All certificates are verified and maintained by third-party accreditation bodies.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Our commitment to quality, safety, and environmental responsibility is demonstrated through continuous compliance with international standards.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default CertificatesSection;
