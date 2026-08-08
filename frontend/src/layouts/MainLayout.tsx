import { Outlet } from "react-router";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Navbar from "@/components/Sidebar";
import Footer from "@/components/Footer";

function RootLayout() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <AppContent />
        </ThemeProvider>
    );
}
function AppContent() {
    const { theme } = useTheme();

    return (
        <>
            <Navbar />
            <main className="flex min-w-0 flex-1 flex-col pt-16 md:pt-0 md:pl-64">
                <Toaster richColors theme={theme as "light" | "dark" | "system"} />
                <div className="flex-1 min-h-[90vh]">
                    <Outlet />
                </div>
                <Footer />
            </main>
        </>
    );
}

export default RootLayout;