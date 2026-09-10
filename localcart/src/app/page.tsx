import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { MainNavbar } from '@/components/layout/Navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#faf8f5]">
      <MainNavbar />
      
      {/* Hero Section */}
      <main className="flex-1 relative overflow-hidden">
        {/* Subtle Desi Pattern Background */}
        <div className="absolute inset-0 bg-desi-pattern opacity-[0.15] mix-blend-multiply pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 py-24 text-center flex flex-col items-center relative z-10">
          <Badge variant="warning" className="mb-8 px-5 py-2 text-sm rounded-full bg-[#fdede9] text-[#c44d32] border border-[#c44d32]/20 shadow-sm font-semibold tracking-wide animate-fade-up">
            From the local kacha bazar to your doorstep 🛵
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-[#222222] tracking-tight leading-tight mb-8 max-w-4xl drop-shadow-sm animate-fade-up delay-100">
            Taza groceries from your <span className="text-[#c44d32] relative inline-block">neighborhood shops
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#eeb211] opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-700 mb-12 max-w-2xl font-medium leading-relaxed animate-fade-up delay-200">
            Your para's best shops, now online. Get daily essentials delivered in minutes or pick them up on your way home. No hidden fees, just local community commerce.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto animate-fade-up delay-300">
            <Link 
              href="/signup?role=CUSTOMER" 
              className="bg-[#c44d32] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#a63f28] transition-all shadow-[0_8px_30px_rgb(196,77,50,0.25)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(196,77,50,0.35)]"
            >
              Start shopping
            </Link>
            <Link 
              href="/signup?role=SHOP_OWNER" 
              className="bg-white text-[#c44d32] px-8 py-4 rounded-full font-bold text-lg border-2 border-[#eeb211] hover:bg-[#fff9ea] transition-all shadow-sm hover:-translate-y-1"
            >
              Register your shop
            </Link>
          </div>
        </div>

        {/* Organic SVG Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.42,120.7,192.5,108.7,236.45,100.22,279.7,80.79,321.39,56.44Z" fill="rgba(255, 255, 255, 0.9)"></path>
          </svg>
        </div>
      </main>


      {/* How it works */}
      <div className="bg-white/90 backdrop-blur-md pb-24 pt-12 relative z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#222222]">How it works</h2>
              <div className="w-24 h-1.5 bg-[#c44d32] mx-auto mt-6 rounded-full opacity-80"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="p-10 rounded-3xl bg-[#faf8f5] border border-[#eeb211]/20 shadow-sm relative hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                <div className="w-16 h-16 bg-[#fff9ea] text-[#eeb211] rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-inner border border-[#eeb211]/30 group-hover:scale-110 group-hover:bg-[#eeb211] group-hover:text-white transition-all duration-300">1</div>
                <h3 className="font-bold text-xl text-[#222222] mb-3">Set your location</h3>
                <p className="text-gray-600 text-base leading-relaxed">Enter your address to discover nearby verified local grocery stores in your area.</p>
              </div>
              <div className="p-10 rounded-3xl bg-[#faf8f5] border border-[#c44d32]/20 shadow-sm relative hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                <div className="w-16 h-16 bg-[#fdede9] text-[#c44d32] rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-inner border border-[#c44d32]/30 group-hover:scale-110 group-hover:bg-[#c44d32] group-hover:text-white transition-all duration-300">2</div>
                <h3 className="font-bold text-xl text-[#222222] mb-3">Place an order</h3>
                <p className="text-gray-600 text-base leading-relaxed">Browse real-time inventory, add items to your cart, and choose delivery or pickup.</p>
              </div>
              <div className="p-10 rounded-3xl bg-[#faf8f5] border border-[#eeb211]/20 shadow-sm relative hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                <div className="w-16 h-16 bg-[#fff9ea] text-[#eeb211] rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-inner border border-[#eeb211]/30 group-hover:scale-110 group-hover:bg-[#eeb211] group-hover:text-white transition-all duration-300">3</div>
                <h3 className="font-bold text-xl text-[#222222] mb-3">Get your groceries</h3>
                <p className="text-gray-600 text-base leading-relaxed">Pay with cash or digital methods and enjoy fresh items from trusted local sellers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#222222] text-[#faf8f5] py-12 relative z-10 border-t-4 border-[#c44d32]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-2xl font-bold opacity-90 mb-3 text-[#eeb211]">LocalCart</p>
          <p className="text-sm opacity-70 font-medium">© {new Date().getFullYear()} Built for neighborhood commerce in Bangladesh.</p>
        </div>
      </footer>
    </div>
  )
}
