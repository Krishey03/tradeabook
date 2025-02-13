import { ChartNoAxesCombined, Sheet } from "lucide-react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { ClockArrowUp, LayoutDashboard, PackageSearch } from "lucide-react";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";


const adminSidebarMenuItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/admin/dashboard',
        icons: <LayoutDashboard />
    },

    {
        id: 'products',
        label: 'Products',
        path: '/admin/products',
        icons: <PackageSearch />
    },

    {
        id: 'orders',
        label: 'Orders',
        path: '/admin/orders',
        icons: <ClockArrowUp />
    },
]

function MenuItems(){
    const navigate = useNavigate()
    return <nav className="mt-8 flex-col flex gap-2">
        {
            adminSidebarMenuItems.map(menuItem=> <div key={menuItem.id} onClick={()=>navigate(menuItem.path)} className="flex items-center gap-2 rounded-md px-3 py-2">
                {menuItem.icons}
                <span>{menuItem.label}</span>
            </div>)
        }

    </nav>
}

function AdminSideBar({open, setOpen}) {

    const navigate = useNavigate()

    return <Fragment>
        <Sheet open={open} onOpen={setOpen}>
            <SheetContent side="left" className= "w-64">
            <div className="flex flex-col h-full">
                <SheetHeader className='border-b'>
                    <SheetTitle>
                    <ChartNoAxesCombined size={30}/>
                        Admin Panel
                    </SheetTitle>
                </SheetHeader>
                <MenuItems />

            </div>

            </SheetContent>

        </Sheet>
        <aside className="hidden w-64 flex-col border-r bg-background p-6 lg-flex">
            <div onClick={()=>navigate('/admin/dashboard')} className="flex cursor-pointer items-center gap-2">
                <ChartNoAxesCombined />
                <h1>Admin Panel</h1>
            </div>

        </aside>
    </Fragment>
}

export default AdminSideBar;