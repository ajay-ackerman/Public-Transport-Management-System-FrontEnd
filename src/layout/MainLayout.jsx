import Sidebar from "./Sidebar";

export default MainLayout = ({ children }) => {
    <div className="display-flex">
        <Sidebar />
        <main style={{ flexGrow: 1, padding: "20px" }}>
            {children}
        </main>
    </div>
}