import {Link} from "react-router-dom"
import { ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 px-4 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-9xl font-extrabold text-gray-900 tracking-tight mb-2 animate-pulse">404</h1>
        <div className="w-16 h-1 bg-purple-600 mx-auto mb-6 rounded-full"></div>

        <h2 className="text-3xl font-bold text-gray-800 mb-3">Page not found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/shop/home"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  )
}
