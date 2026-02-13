import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Award, Users, Building } from "lucide-react";
import iso9001 from "@/assets/ISO9001.png";
import iso14001 from "@/assets/ISO14001.png";
import iso45001 from "@/assets/ISO45001.png";
import iso37001 from "@/assets/ISO37001.png";
import sccIso from "@/assets/scc-iso.png";
import uafIso from "@/assets/UAF-ISO.png";
import dunsNumber from "@/assets/duns-number.png";
import { CERTIFICATES, openCertificate, PAGE_SEO, COMPANY_INFO } from "@/constants";

const About = () => {
  return (
    <Layout
      seo={{
        title: PAGE_SEO.about.title,
        description: PAGE_SEO.about.description,
        keywords: PAGE_SEO.about.keywords,
        canonical: "/about",
        breadcrumbs: [
          { name: "Home", url: "/" },
          { name: "About Us", url: "/about" },
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Promach Pte Ltd</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Your trusted partner for ACMV services and renovation solutions in Singapore
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Company Overview */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Promach Pte Ltd is a leading provider of air-conditioning & mechanical ventilation (ACMV) services and comprehensive renovation solutions in Singapore. With years of experience serving diverse industries, we have established ourselves as a trusted name in the field.
            </p>
            <p className="text-lg text-muted-foreground">
              We maintain Shopping Malls, Clubs, Data Centres, Hospitals, Clinics, Laboratories & Industrial Plants island-wide. Our certified technicians and responsive management team ensure that every project is completed to the highest standards.
            </p>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="text-primary" size={32} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Quality Assurance</h3>
                <p className="text-sm text-muted-foreground">
                  ISO certified and committed to excellence in every project
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="text-primary" size={32} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Certified Team</h3>
                <p className="text-sm text-muted-foreground">
                  Highly trained and certified technicians with extensive experience
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="text-primary" size={32} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Customer First</h3>
                <p className="text-sm text-muted-foreground">
                  Responsive service and clear communication at every step
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building className="text-primary" size={32} />
                </div>
                <h3 className="font-semibold text-lg mb-2">Island-Wide Service</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive coverage across all of Singapore
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Certifications */}
        <section className="bg-secondary rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Certifications & Accreditations</h2>

          {/* Certification Badges */}
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

          {/* Certification Details */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">ISO 9001 (Quality Management)</h3>
                  <p className="text-sm text-muted-foreground">
                    Ensuring consistent quality and customer satisfaction in all our services
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">ISO 14001 (Environmental)</h3>
                  <p className="text-sm text-muted-foreground">
                    Committed to environmental responsibility and sustainable practices
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">ISO 45001 (Occupational Health & Safety)</h3>
                  <p className="text-sm text-muted-foreground">
                    Prioritizing the safety and well-being of our team and clients
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">ISO 37001 (Anti-Bribery)</h3>
                  <p className="text-sm text-muted-foreground">
                    Maintaining the highest standards of business ethics and integrity
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="pt-6 text-center">
                  <h3 className="font-semibold text-lg mb-2">Additional Accreditations</h3>
                  <p className="text-sm text-muted-foreground">
                    BizSafe Star • SCC Accredited CB-MS • United Accreditation Foundation • Dun & Bradstreet DUNS Number 659837257
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Company Details */}
        <section className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Company Information</h2>
          <Card>
            <CardContent className="pt-6 space-y-4 text-left">
              <div>
                <h3 className="font-semibold mb-1">Company Name</h3>
                <p className="text-muted-foreground">{COMPANY_INFO.name}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Office Address</h3>
                <p className="text-muted-foreground">
                  {COMPANY_INFO.address.full}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Telephone</h3>
                <p className="text-muted-foreground">
                  <a href={COMPANY_INFO.phoneHref} className="hover:text-primary transition-colors">
                    {COMPANY_INFO.phoneDisplay}
                  </a>
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-muted-foreground">
                  <a href={COMPANY_INFO.emailHref} className="hover:text-primary transition-colors">
                    {COMPANY_INFO.email}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default About;
