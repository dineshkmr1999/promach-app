import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { useCMS } from '@/hooks/useCMS';

// Social media icons as SVG components
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
);

const Footer = () => {
  const { data: cmsData } = useCMS();

  // Get data from CMS or use defaults
  const companyInfo = cmsData?.companyInfo || {
    name: "Promach Pte Ltd",
    phone: "+65 6829 2136",
    email: "enquiry@promachpl.com",
    address: "Singapore",
  };

  const socialMedia = cmsData?.socialMedia || {};

  // Format address (handles both string and object formats)
  const getAddressString = () => {
    const addr = companyInfo.address as any;
    if (!addr) return "Singapore";
    if (typeof addr === 'string') return addr;
    // Handle nested object format
    const parts = [addr.street, addr.building, addr.city, addr.postalCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : "Singapore";
  };

  const socialLinks = [
    { name: 'Facebook', url: socialMedia.facebook, icon: FacebookIcon },
    { name: 'Instagram', url: socialMedia.instagram, icon: InstagramIcon },
    { name: 'LinkedIn', url: socialMedia.linkedin, icon: LinkedInIcon },
    { name: 'YouTube', url: socialMedia.youtube, icon: YouTubeIcon },
  ].filter(link => link.url);

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info with Social Icons */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-slate-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-white">PROMACH</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Your trusted partner for ACMV services and renovation works in Singapore. Quality, reliability, and excellence in every project.
            </p>

            {/* Social Media Icons */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                    title={social.name}
                  >
                    <social.icon />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded-full"></span>
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/aircon-services", label: "Aircon Services" },
                { to: "/renovation", label: "Renovation Works" },
                { to: "/portfolio", label: "Our Portfolio" },
                { to: "/booking", label: "Book Appointment" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-slate-400 hover:text-primary hover:translate-x-2 transition-all duration-300 inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-primary group-hover:w-3 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded-full"></span>
              Our Services
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Aircon Installation", link: "/aircon-services#installation" },
                { name: "Chemical Overhaul", link: "/aircon-services#overhaul" },
                { name: "General Servicing", link: "/aircon-services#normal" },
                { name: "Gas Top Up", link: "/aircon-services#gas" },
                { name: "Repair & Troubleshooting", link: "/aircon-services#repair" },
                { name: "Renovation Works", link: "/renovation" },
                { name: "Interior Design", link: "/renovation" },
              ].map((service) => (
                <li key={service.name}>
                  <Link to={service.link} className="text-slate-400 hover:text-primary transition-colors inline-block">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded-full"></span>
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-slate-800 group-hover:bg-primary rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                  <MapPin size={18} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <span className="text-slate-500 text-xs uppercase tracking-wider">Address</span>
                  <p className="text-slate-300">{getAddressString()}</p>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-slate-800 group-hover:bg-primary rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                  <Phone size={18} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <span className="text-slate-500 text-xs uppercase tracking-wider">Phone</span>
                  <a href={`tel:${companyInfo.phone}`} className="text-slate-300 hover:text-white transition-colors block">{companyInfo.phone}</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-slate-800 group-hover:bg-primary rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                  <Mail size={18} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <span className="text-slate-500 text-xs uppercase tracking-wider">Email</span>
                  <a href={`mailto:${companyInfo.email}`} className="text-slate-300 hover:text-white transition-colors block">{companyInfo.email}</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 bg-slate-800 group-hover:bg-green-500 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                  <MessageCircle size={18} className="text-green-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <span className="text-slate-500 text-xs uppercase tracking-wider">WhatsApp</span>
                  <a href={`https://wa.me/${(companyInfo.phone || '').replace(/\D/g, '')}`} className="text-slate-300 hover:text-white transition-colors block">Chat with us</a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p className="flex items-center gap-2">
              © {new Date().getFullYear()} <span className="text-white font-semibold">{companyInfo.name || "Promach Pte Ltd"}</span>. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
