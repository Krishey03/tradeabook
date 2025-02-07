import { Button } from "../ui/button";
import { AlignJustify, LogOut } from "lucide-react";

function AdminHeader() {
    return <header className= "flex item-center justify-between px-4 py-3 bg-background border-b">
        <Button className="lg:hidden sm:block">
        <AlignJustify />
        <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="flex flex-1 justify-end">
            <Button>
            <LogOut />
                Logout
            </Button>
        </div>
    </header>
}

export default AdminHeader;