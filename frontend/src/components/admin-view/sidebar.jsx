import {
  BarChartIcon as ChartNoAxesCombined,
  BadgeCheck,
  LayoutDashboard,
  ShoppingBasket,
  UserRoundCog,
} from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Sheet, SheetContent } from "../ui/sheet"

const adminSideBarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    id: "products",
    label: "Auctions",
    path: "/admin/auctions",
    icon: <ShoppingBasket className="h-5 w-5" />,
  },
  {
    id: "orders",
    label: "Exchange",
    path: "/admin/exchange",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    id: "user",
    label: "Users",
    path: "/admin/user",
    icon: <UserRoundCog className="h-5 w-5" />,
  },
]

function MenuItems() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-1">
      {adminSideBarMenuItems.map((menuItem) => (
        <div
          key={menuItem.id}
          onClick={() => navigate(menuItem.path)}
          className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
            location.pathname === menuItem.path
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span className={`${location.pathname === menuItem.path ? "text-emerald-600" : "text-slate-500"}`}>
            {menuItem.icon}
          </span>
          <span>{menuItem.label}</span>
          {location.pathname === menuItem.path && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          )}
        </div>
      ))}
    </nav>
  )
}

function AdminSideBar({ open, setOpen }) {
  const navigate = useNavigate()
  const [isMounted, setIsMounted] = useState(false)

  // Handle initial mount to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <Fragment>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0 border-r border-slate-200">
          <div className="flex flex-col h-full">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white">
                  <ChartNoAxesCombined size={20} />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Trade a Book Admin</h2>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <MenuItems />
            </div>
            <div className="border-t border-slate-200 p-4">
              <div className="text-xs text-slate-500">
                <p>© 2025 Trade a Book</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200">
          <div onClick={() => navigate("/admin/dashboard")} className="flex cursor-pointer items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-white">
              <ChartNoAxesCombined size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Trade a Book Admin</h2>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <MenuItems />
        </div>
        <div className="border-t border-slate-200 p-4">
          <div className="text-xs text-slate-500">
            <p>© 2025 Trade a Book</p>
          </div>
        </div>
      </aside>
    </Fragment>
  )
}

export default AdminSideBar
