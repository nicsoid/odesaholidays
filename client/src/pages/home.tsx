import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Mail, 
  Sparkles, 
  Play, 
  Gift,
  Image,
  Edit,
  Share2,
  Truck,
  Star,
  Users,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Heart
} from "lucide-react";
import TemplateGallery from "@/components/template-gallery";
import NewsletterSignup from "@/components/newsletter-signup";
import type { Template, Postcard } from "@shared/schema";

export default function Home() {
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const { data: publicPostcards = [] } = useQuery<Postcard[]>({
    queryKey: ["/api/postcards/public/gallery?limit=8"],
  });

  const featuredTemplates = templates.slice(0, 4);

  return (
    <div className="bg-warm-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20 lg:py-32" style={{background: 'linear-gradient(to bottom right, #0077BE, #004C9F, #1e3a8a)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-playfair text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Create Beautiful <span className="text-yellow-300">Odesa Postcards</span> in Minutes
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Design stunning digital postcards featuring Odesa's iconic landmarks. Share memories, spread joy, and order premium printed versions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/creator">
                  <Button size="lg" className="bg-sunflower text-gray-900 hover:bg-yellow-400 text-lg px-8 py-4 h-auto shadow-lg transform hover:scale-105 transition-all">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Free Postcard
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-ukrainian-blue text-lg px-8 py-4 h-auto">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center text-blue-100">
                <Gift className="mr-2 h-5 w-5 text-sunflower" />
                <span>Free digital postcards • Premium printing available</span>
              </div>
            </div>
            <div className="relative">
              {/* Postcard Mockup */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                  alt="Odesa Opera House" 
                  className="w-full h-64 object-cover rounded-xl mb-4" 
                />
                <div className="text-gray-900">
                  <h3 className="font-playfair text-xl font-semibold mb-2">Greetings from Odesa!</h3>
                  <p className="text-gray-600 text-sm mb-4">Having an amazing time exploring this beautiful coastal city. The architecture is breathtaking!</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Created with Odesa Postcards</span>
                    <span>❤️ Sarah</span>
                  </div>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-sunset-orange text-white px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
                Free!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Create Amazing Postcards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From free digital creation to premium printing, we've got all your postcard needs covered.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-ukrainian-blue bg-opacity-10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Image className="text-ukrainian-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Premium Templates</h3>
                <p className="text-gray-600">Beautiful, professionally designed templates featuring Odesa's most iconic landmarks and views.</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-sunflower bg-opacity-10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Edit className="text-sunflower h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Easy Customization</h3>
                <p className="text-gray-600">Add your photos, customize text, choose fonts, and personalize every detail with our intuitive editor.</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-sunset-orange bg-opacity-10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Share2 className="text-sunset-orange h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Social Sharing</h3>
                <p className="text-gray-600">Share instantly on Instagram, Facebook, Twitter, or send via email to friends and family worldwide.</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-ocean-blue bg-opacity-10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Truck className="text-ocean-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Print & Ship</h3>
                <p className="text-gray-600">Order high-quality printed postcards delivered anywhere in the world. Perfect for traditional mail.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Template Gallery Section */}
      <section id="templates" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Discover Odesa's Beauty
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Choose from our curated collection of stunning Odesa landmarks and coastal views.
            </p>
          </div>
          <TemplateGallery templates={featuredTemplates} showFilters={false} />
          <div className="text-center mt-12">
            <Link href="/creator">
              <Button variant="outline" size="lg" className="text-gray-700 hover:bg-gray-200">
                View All Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start for free, upgrade when you're ready to print and ship.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Digital Free</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                  <p className="text-gray-600">Perfect for social sharing</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Unlimited digital postcards</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Access to all free templates</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Basic customization tools</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Social media sharing</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Email delivery</span>
                  </li>
                </ul>
                <Link href="/creator">
                  <Button variant="outline" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Print Plan */}
            <Card className="border-2 border-ukrainian-blue relative transform scale-105 shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-ukrainian-blue text-white px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Print & Ship</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$3.99</div>
                  <p className="text-gray-600">Per printed postcard</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Everything in Digital Free</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Premium paper quality</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Worldwide shipping</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Tracking included</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Bulk discounts available</span>
                  </li>
                </ul>
                <Link href="/creator">
                  <Button className="w-full bg-ukrainian-blue hover:bg-blue-700">
                    Order Printed Postcard
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Premium Plan */}
            <Card className="border-2 border-gray-100">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Access</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$9.99</div>
                  <p className="text-gray-600">Per month</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Everything in Print & Ship</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Premium template library</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Advanced editing tools</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Remove watermarks</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full text-sunset-orange border-sunset-orange hover:bg-sunset-orange hover:text-white">
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Need bulk orders for your business or event?</p>
            <Button variant="link" className="text-ukrainian-blue font-semibold">
              Contact us for custom pricing
            </Button>
          </div>
        </div>
      </section>

      {/* User Gallery & Social Proof */}
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Created by Travelers Like You
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of happy tourists sharing their Odesa memories.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="text-ukrainian-blue mr-2 h-5 w-5" />
                <span>12,000+ postcards created</span>
              </div>
              <div className="flex items-center">
                <Star className="text-sunflower mr-2 h-5 w-5" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center">
                <Globe className="text-sunset-orange mr-2 h-5 w-5" />
                <span>Shipped to 65+ countries</span>
              </div>
            </div>
          </div>
          
          {/* User Created Postcards Grid */}
          {publicPostcards.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {publicPostcards.map((postcard) => (
                <Card key={postcard.id} className="group transform hover:scale-105 transition-all duration-300 overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-ukrainian-blue to-ocean-blue"></div>
                  <CardContent className="p-3">
                    <p className="text-xs text-gray-600 mb-2 truncate">{postcard.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-ukrainian-blue to-ocean-blue rounded-full"></div>
                        <span className="text-xs text-gray-700">{postcard.title}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Instagram className="w-3 h-3 text-pink-500" />
                        <Heart className="w-3 h-3 text-red-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-sunflower">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"The quality of the printed postcards exceeded my expectations. My family loved receiving them!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-ukrainian-blue to-ocean-blue rounded-full mr-3"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Maria Rodriguez</div>
                    <div className="text-sm text-gray-600">Tourist from Spain</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-sunflower">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"Super easy to use! Created 20 postcards for friends in 10 minutes. The templates are gorgeous."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-sunset-orange to-sunflower rounded-full mr-3"></div>
                  <div>
                    <div className="font-semibold text-gray-900">James Wilson</div>
                    <div className="text-sm text-gray-600">Tourist from UK</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-sunflower">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"Perfect way to share our honeymoon memories. The Instagram integration is brilliant!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-ukrainian-blue to-sunflower rounded-full mr-3"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Lisa & David</div>
                    <div className="text-sm text-gray-600">Honeymooners from USA</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Mail className="text-ukrainian-blue h-8 w-8 mr-2" />
                <span className="font-playfair font-bold text-xl">Odesa Postcards</span>
              </div>
              <p className="text-gray-400 mb-4">
                Create beautiful digital postcards featuring Odesa's iconic landmarks and share your memories with the world.
              </p>
              <div className="flex space-x-4">
                <Instagram className="text-gray-400 hover:text-ukrainian-blue cursor-pointer transition-colors h-6 w-6" />
                <Facebook className="text-gray-400 hover:text-ukrainian-blue cursor-pointer transition-colors h-6 w-6" />
                <Twitter className="text-gray-400 hover:text-ukrainian-blue cursor-pointer transition-colors h-6 w-6" />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Create</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/creator" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="/creator" className="hover:text-white transition-colors">Editor</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Upload Photos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Printing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Discover</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Odesa Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tourist Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Local Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Photo Spots</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Odesa Postcards. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/creator">
          <Button size="lg" className="w-14 h-14 rounded-full bg-ukrainian-blue hover:bg-blue-700 shadow-lg transform hover:scale-110 transition-all">
            <Sparkles className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
