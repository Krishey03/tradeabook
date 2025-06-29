import ShoppingHeader from "@/pages/shopping-view/header";
import { Outlet } from "react-router-dom";


export default function ChatLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <ShoppingHeader />
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
}