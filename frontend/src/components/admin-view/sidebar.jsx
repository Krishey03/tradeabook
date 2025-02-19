import { ChartNoAxesCombined, BadgeCheck, LayoutDashboard, ShoppingBasket, Sheet } from "lucide-react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const adminSideBarMenuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: <LayoutDashboard/>
    },
    {
        id: 'products',
        label: 'Products',
        path: '/admin/products',
        icon: <ShoppingBasket/>
    },
    {
        id: 'orders',
        label: 'Orders',
        path: '/admin/orders',
        icon: <BadgeCheck/>
    }
]


function MenuItems() {
    const navigate = useNavigate();

    return (
        <nav className="mt-8 flex-col flex gap-2">
        {
            adminSideBarMenuItems.map(menuItem => <div key={menuItem.id} onClick={()=>navigate(menuItem.path)} className="flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                {menuItem.icon}
                <span>{menuItem.label}</span>
            </div>)
        }

    </nav>
    )

}


function AdminSideBar({open, setOpen}) {
    const navigate = useNavigate();

    return(
        <Fragment>
            {/* <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="w-64">
                    <div className="flex flex-col h-full">
                        <SheetHeader className='border-b'>
                            <SheetTitle>
                                <ChartNoAxesCombined />
                                Admin Panel
                            </SheetTitle>
                        </SheetHeader>
                        <MenuItems/>
                    </div>
                </SheetContent>
            </Sheet> */}
            <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
                <div onClick={()=>navigate('/admin/dashboard')} className="flex cursor-pointer items-center justify-between mb-4">
                    <ChartNoAxesCombined size={35}/>
                    <h2 className="text-xl font-bold">Dashboard</h2>
                    <button className="text-xs text-gray-400 hover:text-gray-500" onClick={() => navigate("/admin/orders")}>
                        View Orders
                    </button>
                </div>
                <MenuItems/>
            </aside>
        </Fragment>
    );
}

export default AdminSideBar;