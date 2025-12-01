import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
    return (<div className="flex">
        <Sidebar />
        <main className="ml-20 md:ml-64 transition-all p-6 w-full min-h-screen bg-gray-100">
            {children}
        </main>
    </div>)
}