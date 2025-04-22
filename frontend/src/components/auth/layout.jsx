import { Outlet } from "react-router-dom"
import { BookOpen, BookMarked, ArrowRight } from "lucide-react"
import "@fontsource/inspiration"

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-50">
      {/* Left Panel - Branding and Information */}
      <div className="hidden lg:flex flex-col w-2/5 bg-gradient-to-br from-[#7C8E76] via-[#819171] to-[#9CAF88] text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute transform rotate-45 bg-white/10"
                style={{
                  width: `${Math.random() * 300 + 100}px`,
                  height: `${Math.random() * 300 + 100}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.1,
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center h-full z-10 p-12">
          {/* Logo and brand */}
          <div className="flex items-center justify-center space-x-3 mb-10">
            <span className="text-7xl font-inspiration">Trade a Book</span>
          </div>


          {/* Main content */}
          <div className="space-y-6 max-w-lg mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Share the joy of reading with others</h1>
            <p className="text-lg text-indigo-100">
              Join our community of book lovers to buy, sell, or exchange books with fellow readers around the world.
            </p>

            {/* Features */}
            <div className="space-y-4 mt-8 text-left">
              <Feature title="Exchange with others" description="Trade books you've read for new adventures" />
              <Feature title="Build your collection" description="Grow your personal library with affordable options" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo - only visible on small screens */}
          <div className="flex items-center justify-center mb-6 lg:hidden">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <BookMarked className="h-6 w-6 text-indigo-700" />
            </div>
            <span className="text-xl font-bold ml-2 text-gray-900">Trade a Book</span>
          </div>

          {/* Auth form container */}
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ title, description }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="bg-white/10 p-1 rounded-full mt-1">
        <ArrowRight className="h-4 w-4" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-indigo-100">{description}</p>
      </div>
    </div>
  )
}

export default AuthLayout
