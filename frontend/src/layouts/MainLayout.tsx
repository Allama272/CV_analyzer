import { Navbar1 } from "@/components/ui/Navbar1"
import { Outlet } from "react-router"
import { ThemeProvider } from "@/components/theme-provider"

function MainLayout() {
    return (
        <ThemeProvider>
            <div className="mx-3">
                <Navbar1></Navbar1>
            </div>
            <main>
                <Outlet />
            </main>
        </ThemeProvider>
    )
}

export default MainLayout