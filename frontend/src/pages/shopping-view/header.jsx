import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { SheetTrigger, Sheet, SheetContent } from "@/components/ui/sheet";
import { shoppingViewHeaderMenuItems } from "@/config";
import { House, Menu, ShoppingCart, UserCog, LogOut, UserRound } from "lucide-react";
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

function MenuItems() {
  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Link className="text-sm font-medium" key={menuItem.id} to={menuItem.path}>
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
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <Button variant="outline" size="icon">
        <ShoppingCart className="h-6 w-6" />
        <span className="sr-only">View Cart</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Avatar className="bg-black">
                <AvatarFallback className="bg-black text-white font-extrabold">
                    {user?. userName[0].toUpperCase()}
                </AvatarFallback>

            </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56">
            <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={()=>navigate('/shop/account')}>
                <UserRound  className="mr-2 h-4 w-4"/>
                User Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-4 h-4 w-4"/>
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
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-md">
      <div className="flex items-center justify-between px-4 md:px-6">
        <Link className="flex items-center gap-2" to="/shop/home">
          <House className="h-6 w-6 text-black" />
          <span className="font-Bold">TradeABook</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Header Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems />
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block">
          <MenuItems />
        </div>
        {isAuthenticated ? <HeaderRightContent /> : null}
      </div>
    </header>
  );
}

export default ShoppingHeader;
