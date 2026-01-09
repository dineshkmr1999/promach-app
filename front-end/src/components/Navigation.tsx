import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/LOGO.png";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 glass shadow-sm transition-all duration-300">
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
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline group-hover:text-primary transition-colors duration-300">PROMACH</span>
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
                    <ul className="grid w-[500px] gap-3 p-4 md:w-[600px] md:grid-cols-2 lg:w-[700px]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/10 to-primary/30 p-6 no-underline outline-none focus:shadow-md"
                            to="/aircon-services"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium text-primary">
                              ACMV Experts
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Professional air conditioning and mechanical ventilation services for all property types.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <Link to="/aircon-services#normal" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none text-foreground">Normal Servicing</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Regular maintenance to keep your aircon running smoothly.</p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/aircon-services#chemical" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none text-foreground">Chemical Service</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Deep cleaning to remove stubborn dirt and bacteria.</p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/aircon-services#steam" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none text-foreground">Steam Wash</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">High-pressure steam cleaning for thorough sanitization.</p>
                        </Link>
                      </li>
                    </ul>
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
                className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  animation: 'pulseBounce 2s ease-in-out infinite'
                }}
              >
                Book Appointment
              </Button>
            </Link>
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
  );
};

export default Navigation;
