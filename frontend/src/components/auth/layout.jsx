import { Outlet } from "react-router-dom";

function AuthLayout() {
    return (
        <div className="flex min-h-screen w-full">
            {/* Left Panel with a More Subtle Gradient */}
            <div className="hidden lg:flex items-center justify-center w-2/6 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 px-12 shadow-lg">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
                        Welcome to <span className="text-indigo-400">Trade a Book</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-md">
                        Buy, sell, or exchange books with fellow readers. 
                    </p>
                </div>
            </div>

            {/* Right Panel - Auth Forms */}
            <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
                <div className="bg-white p-8 rounded-2xl w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
