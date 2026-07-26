import { Outlet } from "react-router"; // Use react-router-dom for Link
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Toaster } from 'sonner';
import { Navbar1 } from "@/components/ui/Navbar1";

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
            <div className="mx-3">
                <Navbar1 />
            </div>
            <main>
                <Toaster richColors theme={theme as "light" | "dark" | "system"} />
                <Outlet />
            </main>
        </>
    );
}

export default RootLayout;