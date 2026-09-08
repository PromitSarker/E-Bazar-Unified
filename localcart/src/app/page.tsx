import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { MainNavbar } from '@/components/layout/Navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <MainNavbar />
      
      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center flex flex-col items-center">
          <Badge color="emerald" className="mb-6 px-4 py-1 text-sm rounded-full bg-emerald-100 text-emerald-800">
            Now serving Dhaka City 🚀
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 max-w-4xl">
            Fresh groceries from your <span className="text-emerald-600">neighborhood shops</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
            Shop from local grocery stores near you. Get items delivered in minutes or pick them up on your way home. No hidden fees, just local community commerce.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/signup?role=CUSTOMER" 
              className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Shop now
            </Link>
            <Link 
              href="/signup?role=SHOP_OWNER" 
              className="bg-white text-gray-800 px-8 py-3.5 rounded-xl font-semibold text-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Register your shop
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white border-y border-gray-200 py-20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-semibold text-gray-900 mb-2">Set your location</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Enter your address to discover nearby verified local grocery stores.</p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-semibold text-gray-900 mb-2">Place an order</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Browse real-time inventory, add items to cart, and choose delivery or pickup.</p>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-semibold text-gray-900 mb-2">Get your groceries</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Pay with cash or SSLCommerz and enjoy fresh items from trusted local sellers.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} LocalCart. Built for neighborhood commerce.</p>
        </div>
      </footer>
    </div>
  )
}
