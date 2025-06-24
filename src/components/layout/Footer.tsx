"use client"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-white font-bold text-xl">Everhood</span>
            </div>
            <p className="text-gray-400 text-sm">
              The AI-powered platform for Gen-Z to discover, learn, and grow with the latest tech trends.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="/news" className="text-gray-400 hover:text-white text-sm">News Feed</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link></li>
              <li><Link href="/subscribe" className="text-gray-400 hover:text-white text-sm">Premium</Link></li>
              <li><Link href="/api-docs" className="text-gray-400 hover:text-white text-sm">API Docs</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li><a href="https://discord.gg/everhood" className="text-gray-400 hover:text-white text-sm">Discord</a></li>
              <li><a href="https://twitter.com/everhood" className="text-gray-400 hover:text-white text-sm">Twitter</a></li>
              <li><a href="https://instagram.com/everhood" className="text-gray-400 hover:text-white text-sm">Instagram</a></li>
              <li><a href="https://github.com/everhood" className="text-gray-400 hover:text-white text-sm">GitHub</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm">Terms of Service</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-white text-sm">Security</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Everhood. Built with 💜 for Gen-Z.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Made with</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-gray-800 px-2 py-1 rounded">Next.js</span>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded">Prisma</span>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded">Stripe</span>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded">Gemini AI</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}