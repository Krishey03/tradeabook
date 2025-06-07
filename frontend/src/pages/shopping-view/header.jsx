import { useDispatch, useSelector } from "react-redux"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SheetTrigger, Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { shoppingViewHeaderMenuItems } from "@/config"
import { Menu, ShoppingCart, UserCog, LogOut, UserRound, SquareStack, ScrollText, Bell } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import "@fontsource/inspiration"
import "@fontsource/inika"
import useExchangeOffers from "@/hooks/useExchangeOffers"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { logoutUser } from "@/store/auth-slice"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

function MenuItems({ closeMenu }) {
  const location = useLocation()

  return (
    <nav className="flex flex-col lg:items-center gap-6 lg:flex-row p-4">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Link
          className={`text-sm font-medium transition-all relative group font-inika ${
            location.pathname === menuItem.path
              ? "text-emerald-700 font-semibold"
              : "text-slate-700 hover:text-emerald-600"
          }`}
          key={menuItem.id}
          to={menuItem.path}
          onClick={closeMenu}
        >
          {menuItem.label}
          <span
            className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full ${
              location.pathname === menuItem.path ? "w-full" : ""
            }`}
          ></span>
        </Link>
      ))}
    </nav>
  )
}

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { incomingOffers, outgoingOffers, loading } = useExchangeOffers(user?.email)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [incomingOpen, setIncomingOpen] = useState(false)
  const [outgoingOpen, setOutgoingOpen] = useState(false)
  const [hasNewIncoming, setHasNewIncoming] = useState(false)
  const [hasNewOutgoing, setHasNewOutgoing] = useState(false)

  // Track if there are new notifications
  useEffect(() => {
    // Check local storage for last seen counts
    const lastSeenIncoming = Number.parseInt(localStorage.getItem("lastSeenIncoming") || "0")
    const lastSeenOutgoing = Number.parseInt(localStorage.getItem("lastSeenOutgoing") || "0")

    if (incomingOffers.length > lastSeenIncoming) {
      setHasNewIncoming(true)
    }

    if (outgoingOffers.length > lastSeenOutgoing) {
      setHasNewOutgoing(true)
    }
  }, [incomingOffers.length, outgoingOffers.length])

  // Mark notifications as seen when dropdown is opened
  useEffect(() => {
    if (incomingOpen && hasNewIncoming) {
      localStorage.setItem("lastSeenIncoming", incomingOffers.length.toString())
      setHasNewIncoming(false)
    }
  }, [incomingOpen, incomingOffers.length, hasNewIncoming])

  useEffect(() => {
    if (outgoingOpen && hasNewOutgoing) {
      localStorage.setItem("lastSeenOutgoing", outgoingOffers.length.toString())
      setHasNewOutgoing(false)
    }
  }, [outgoingOpen, outgoingOffers.length, hasNewOutgoing])

  function handleLogoutClick() {
    setShowLogoutConfirm(true)
  }

  function confirmLogout() {
    setShowLogoutConfirm(false)
    dispatch(logoutUser())
    navigate("/") // optional: redirect after logout
  }

  function cancelLogout() {
    setShowLogoutConfirm(false)
  }

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-x-3 gap-y-4">
      {/* Incoming Exchange Offers Dropdown */}
      {/* <DropdownMenu open={incomingOpen} onOpenChange={setIncomingOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={`relative transition-all ${hasNewIncoming ? "animate-pulse bg-emerald-50" : ""}`}
          >
            <SquareStack className={`h-5 w-5 ${hasNewIncoming ? "text-emerald-600" : ""}`} />
            {incomingOffers.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 ${
                  hasNewIncoming ? "bg-emerald-500" : "bg-slate-500"
                } text-white text-xs w-5 h-5 flex items-center justify-center rounded-full transition-all`}
              >
                {incomingOffers.length}
              </span>
            )}
            <span className="sr-only">Incoming Offers</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-72 bg-white border shadow-lg rounded-lg p-1 animate-in fade-in-50 zoom-in-95"
        >
          <DropdownMenuLabel className="px-4 py-2 text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-emerald-600" />
            Incoming Exchange Offers
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {loading.incoming ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-slate-600">Loading offers...</span>
            </div>
          ) : incomingOffers.length === 0 ? (
            <div className="text-center p-6 text-slate-500">
              <SquareStack className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No incoming offers yet</p>
              <p className="text-xs mt-1">When someone offers to exchange books with you, it will appear here</p>
            </div>
          ) : (
            <>
              {incomingOffers.map((offer) => (
                <DropdownMenuItem
                  key={offer._id}
                  className="flex flex-col items-start p-3 cursor-pointer hover:bg-slate-50 rounded-md focus:bg-slate-50 transition-colors"
                  onClick={() => navigate(`/shop/exchange/${offer._id}`)}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium text-sm">{offer.productId?.title || "Unknown Book"}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        offer.offerStatus === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : offer.offerStatus === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {offer.offerStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    From: {offer.userEmail || "Anonymous"} • {new Date(offer.dateOffered).toLocaleDateString()}
                  </p>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu> */}

      {/* Outgoing Exchange Offers Dropdown */}
      {/* <DropdownMenu open={outgoingOpen} onOpenChange={setOutgoingOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={`relative transition-all ${hasNewOutgoing ? "animate-pulse bg-blue-50" : ""}`}
          >
            <UserCog className={`h-5 w-5 ${hasNewOutgoing ? "text-blue-600" : ""}`} />
            {outgoingOffers.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 ${
                  hasNewOutgoing ? "bg-blue-500" : "bg-slate-500"
                } text-white text-xs w-5 h-5 flex items-center justify-center rounded-full transition-all`}
              >
                {outgoingOffers.length}
              </span>
            )}
            <span className="sr-only">Outgoing Offers</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-72 bg-white border shadow-lg rounded-lg p-1 animate-in fade-in-50 zoom-in-95"
        >
          <DropdownMenuLabel className="px-4 py-2 text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600" />
            My Outgoing Offers
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {loading.outgoing ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-slate-600">Loading offers...</span>
            </div>
          ) : outgoingOffers.length === 0 ? (
            <div className="text-center p-6 text-slate-500">
              <UserCog className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p>No outgoing offers yet</p>
              <p className="text-xs mt-1">When you offer to exchange books with someone, it will appear here</p>
            </div>
          ) : (
            <>
              {outgoingOffers.map((offer) => (
    <DropdownMenuItem
      key={offer._id}
      className="flex flex-col items-start p-3 cursor-pointer hover:bg-slate-50 rounded-md focus:bg-slate-50 transition-colors"
      onClick={() => navigate(`/shop/exchange/${offer._id}`)}
    >
      <div className="flex justify-between items-center w-full">
        <span className="font-medium text-sm">
          {offer.exchangeOffer?.eTitle || "Your Book Offer"}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            offer.offerStatus === "pending"
              ? "bg-amber-100 text-amber-800"
              : offer.offerStatus === "accepted"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
          }`}
        >
          {offer.offerStatus}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-1">
        For: {productTitle}
      </p>
      <p className="text-xs text-slate-500">
        To: {sellerEmail} {new Date(offer.dateOffered).toLocaleDateString()}
      </p>
    </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu> */}

      {/* My Uploads */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate("/shop/uploads")}
        className="relative hover:bg-slate-100 transition-all"
        title="My Uploads"
      >
        <ScrollText className="h-5 w-5" />
        <span className="sr-only">View Uploads</span>
      </Button>

      {/* Cart */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate("/shop/checkout")}
        className="relative hover:bg-slate-100 transition-all"
        title="Shopping Cart"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="sr-only">View Cart</span>
      </Button>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-emerald-600 cursor-pointer hover:ring-2 hover:ring-emerald-200 transition-all">
            <AvatarFallback className="bg-emerald-600 text-white font-bold text-lg">
              {user?.userName ? user.userName[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 bg-white border shadow-lg rounded-lg p-1 animate-in fade-in-50 zoom-in-95"
        >
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-800">{user?.userName || "User"}</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{user?.email || "user@example.com"}</p>
          </div>

          <div className="p-2">
            <DropdownMenuItem
              onClick={() => navigate("/shop/account")}
              className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors"
            >
              <UserRound className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm">My Account</p>
                <p className="text-xs text-slate-500">Manage your profile and settings</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/shop/uploads")}
              className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors"
            >
              <ScrollText className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm">My Uploads</p>
                <p className="text-xs text-slate-500">View your listed books</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/shop/orders")}
              className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-slate-50 focus:bg-slate-50 transition-colors"
            >
              <SquareStack className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm">Purchases</p>
                <p className="text-xs text-slate-500">Track your book purchases</p>
              </div>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogoutClick}
            className="flex items-center 
            gap-2 p-2 m-1 
            rounded-md cursor-pointer 
            text-rose-600 hover:bg-rose-50 
            focus:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
            {showLogoutConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <Card className="w-[320px]">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Confirm Logout</h3>
                  </CardHeader>
                  <CardContent>Are you sure you want to log out?</CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={cancelLogout}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={confirmLogout}>
                      Logout
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
    </div>
  )
}

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-white transition-all duration-300 ${
        isScrolled ? "shadow-md py-1" : "py-2"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-6">
        <Link
          className="flex items-center gap-2 text-emerald-700 font-inspiration text-2xl transition-transform hover:scale-105"
          to="/shop/home"
        >
          Trade a Book
        </Link>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Header Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs h-full bg-white p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <Link
                    className="flex items-center gap-2 text-emerald-700 font-inspiration text-2xl"
                    to="/shop/home"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Trade a Book
                  </Link>
                  <SheetClose className="rounded-full p-2 hover:bg-slate-100">
                    <span className="sr-only">Close</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </SheetClose>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <MenuItems closeMenu={() => setMobileMenuOpen(false)} />
              </div>

              <div className="p-4 border-t border-slate-200">
                <HeaderRightContent />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden lg:flex items-center gap-6">
          <MenuItems closeMenu={() => {}} />
          <HeaderRightContent />
        </div>
      </div>
    </header>
  )
}

export default ShoppingHeader
