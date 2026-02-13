import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail, Sparkles } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/LOGO.png";
import { QuickQuoteModal } from "./QuickQuoteModal";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Track scroll position for sticky CTA visibility
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-white text-center py-2 px-4 text-sm font-medium hidden sm:block">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Sparkles size={16} />
          <span>Limited Time: <strong>$20 OFF</strong> your first service!</span>
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="ml-2 underline hover:no-underline font-semibold"
          >
            Claim Now →
          </button>
        </div>
      </div>

      <nav className={cn(
        "sticky top-0 z-50 w-full border-b border-white/10 glass shadow-sm transition-all duration-300",
        isScrolled && "shadow-lg"
      )}>
        {/* Top Bar with Contact Info - Premium Darker Shade */}
        <div className="bg-primary/5 backdrop-blur-sm border-b border-primary/10 hidden md:block">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-wrap items-center justify-end text-xs font-medium text-muted-foreground gap-6">
              <div className="flex items-center gap-6">
                <a href="tel:+6568292136" className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                  <Phone size={14} className="text-primary" />
                  <span>(65) 6829 2136</span>
                </a>
                <a href="mailto:enquiry@promachpl.com" className="flex items-center gap-2 hover:text-primary transition-colors duration-200">
                  <Mail size={14} className="text-primary" />
                  <span>enquiry@promachpl.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <img src={logo} alt="Promach Logo" className="relative h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 -ml-1">PROMACH</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavigationMenu>
                <NavigationMenuList className="space-x-2">
                  <NavigationMenuItem>
                    <Link to="/">
                      <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-primary/10 data-[state=open]:bg-primary/10">
                        Home
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10">Aircon & ACMV</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[320px] p-4">
                        {/* Header */}
                        <Link
                          to="/aircon-services"
                          className="block rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4 mb-3 hover:from-primary/20 hover:to-primary/10 transition-all"
                        >
                          <div className="text-base font-semibold text-primary mb-1">Aircon & ACMV Services</div>
                          <p className="text-xs text-muted-foreground">Complete cooling solutions for residential, commercial & industrial</p>
                        </Link>

                        {/* Service List */}
                        <div className="space-y-1">
                          <Link to="/aircon-services#normal" className="flex items-center gap-3 rounded-md p-3 hover:bg-accent transition-colors">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-bold">01</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">Normal Servicing</div>
                              <p className="text-xs text-muted-foreground">Regular maintenance & cleaning</p>
                            </div>
                          </Link>

                          <Link to="/aircon-services#chemical" className="flex items-center gap-3 rounded-md p-3 hover:bg-accent transition-colors">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-bold">02</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">Chemical Service</div>
                              <p className="text-xs text-muted-foreground">Deep cleaning & bacteria removal</p>
                            </div>
                          </Link>

                          <Link to="/aircon-services#steam" className="flex items-center gap-3 rounded-md p-3 hover:bg-accent transition-colors">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-bold">03</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">Steam Wash</div>
                              <p className="text-xs text-muted-foreground">High-pressure steam sanitization</p>
                            </div>
                          </Link>

                          <Link to="/aircon-services#repair" className="flex items-center gap-3 rounded-md p-3 hover:bg-accent transition-colors">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-bold">04</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">Repair & Installation</div>
                              <p className="text-xs text-muted-foreground">Expert diagnosis & solutions</p>
                            </div>
                          </Link>
                        </div>

                        {/* View All Link */}
                        <Link
                          to="/aircon-services"
                          className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-border text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          View All Services →
                        </Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link to="/renovation">
                      <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-primary/10 data-[state=open]:bg-primary/10">
                        Renovation
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link to="/portfolio">
                      <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-primary/10 data-[state=open]:bg-primary/10">
                        Portfolio
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link to="/about">
                      <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-primary/10 data-[state=open]:bg-primary/10">
                        About Us
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link to="/contact">
                      <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-primary/10 data-[state=open]:bg-primary/10">
                        Contact
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>


              <Link to="/booking">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full transition-all duration-300 hover:-translate-y-0.5"
                >
                  Book Appointment
                </Button>
              </Link>

              {/* Sticky CTA - Get Free Quote */}
              <Button
                size="lg"
                onClick={() => setIsQuoteModalOpen(true)}
                className={cn(
                  "rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5",
                  "bg-primary text-white font-semibold",
                  isScrolled && "animate-pulse-subtle"
                )}
              >
                Get Free Quote
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 animate-accordion-down overflow-hidden border-t">
              <Link to="/" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/aircon-services" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Aircon Services</Link>
              <Link to="/renovation" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Renovation</Link>
              <Link to="/portfolio" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Portfolio</Link>
              <Link to="/about" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link to="/contact" className="block px-4 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <div className="px-4 pt-2">
                <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button className="w-full rounded-full shadow-md">Book Appointment</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Quick Quote Modal */}
      <QuickQuoteModal
        open={isQuoteModalOpen}
        onOpenChange={setIsQuoteModalOpen}
      />
    </>
  );
};

export default Navigation;
