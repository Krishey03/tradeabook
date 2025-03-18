import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { SheetTrigger, Sheet, SheetContent } from "@/components/ui/sheet";
import { shoppingViewHeaderMenuItems } from "@/config";
import { House, Menu, ShoppingCart, UserCog, LogOut, UserRound, SquareStack } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
          className="text-sm-b font-medium hover:text-primary transition-all text-black"
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

    function handleLogout() {
        dispatch(logoutUser());
    }

    return (
      <div className="flex lg:items-center lg:flex-row flex-col gap-x-2 gap-y-4">
        <Button variant="outline" size="icon">
          <SquareStack className="h-6 w-6" />
          <span className="sr-only">View Categories</span>
        </Button>  
        <Button variant="outline" size="icon">
          <ShoppingCart className="h-6 w-6" />
          <span className="sr-only">View Cart</span>
        </Button>
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
        {/* Logo */}
        <Link className="flex items-center gap-2 text-black font-bold text-lg" to="/shop/home">
          <House className="h-6 w-6" />
          TradeABook
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

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          <MenuItems />
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
