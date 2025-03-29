import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SheetTrigger, Sheet, SheetContent } from "@/components/ui/sheet";
import { shoppingViewHeaderMenuItems } from "@/config";
import { House, Menu, ShoppingCart, UserCog, LogOut, UserRound, SquareStack } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "@fontsource/inspiration"; 
import "@fontsource/inika"; 
import useExchangeOffers from "@/hooks/useExchangeOffers";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutUser } from "@/store/auth-slice";

function MenuItems({ closeMenu }) {
  return (
    <nav className="flex flex-col lg:items-center gap-6 lg:flex-row p-4">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Link 
          className="text-sm-b font-medium hover:text-primary transition-all text-black font-inika"
          key={menuItem.id} 
          to={menuItem.path}
          onClick={closeMenu} 
        >
          {menuItem.label}
        </Link>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { exchangeOffers, loading } = useExchangeOffers(user?.email);
  const [open, setOpen] = useState(false);

  function handleLogout() {
      dispatch(logoutUser());
  }

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-x-2 gap-y-4">
      {/* Exchange Offers Dropdown */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <SquareStack className="h-6 w-6" />
            {exchangeOffers.length > 0 && ( // Show notification badge if offers exist
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {exchangeOffers.length}
              </span>
            )}
            <span className="sr-only">View Listings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white border shadow-lg rounded-lg">
          <DropdownMenuLabel className="px-4 py-2 text-sm text-gray-600">
            Exchange Offers
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {loading ? (
            <DropdownMenuItem className="text-center">Loading...</DropdownMenuItem>
          ) : exchangeOffers.length === 0 ? (
            <DropdownMenuItem className="text-center text-gray-500">No offers available</DropdownMenuItem>
          ) : (
            exchangeOffers.map((offer) => (
              <DropdownMenuItem 
                key={offer._id} 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/shop/exchange/${offer._id}`)}
              >
                <span className="text-sm">{offer.bookTitle}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${offer.offerStatus === 'pending' ? 'bg-yellow-300' : 'bg-green-300'}`}>
                  {offer.offerStatus}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cart */}
      <Button variant="outline" size="icon" onClick={() => navigate("/shop/checkout")}>
        <ShoppingCart className="h-6 w-6" />
        <span className="sr-only">View Cart</span>
      </Button>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-black cursor-pointer">
            <AvatarFallback className="bg-black text-white font-extrabold text-lg">
              {user?.userName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border shadow-lg rounded-lg">
          <DropdownMenuLabel className="px-4 py-2 text-sm text-gray-600">
            Logged in as <span className="font-semibold">{user?.userName}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/shop/account')} className="hover:bg-gray-100 cursor-pointer">
            <UserRound className="mr-2 h-4 w-4" />
            User Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="bg-red-500 cursor-pointer text-white">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-md">
      <div className="flex items-center justify-between px-4 md:px-6 bg-slate-200">
      <Link className="flex items-center gap-2 text-black font-inspiration text-2xl" to="/shop/home">
        Trade a Book
      </Link>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Header Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs h-full bg-white p-6">
            <MenuItems closeMenu={() => {}} />
            <div className="mt-6">
              <HeaderRightContent />
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden lg:flex items-center gap-6">
          <MenuItems />
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
