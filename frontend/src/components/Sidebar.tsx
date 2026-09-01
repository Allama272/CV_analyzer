import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router";
import {
    Home,
    FileText,
    Briefcase,
    Search,
    Sun,
    Moon,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,

} from "@/components/ui/sheet";
import { useTheme } from "@/components/theme-provider";
import { UserAuth } from "@/context/AuthContext";

const APP_NAME = import.meta.env.VITE_APP_TITLE || "CareerSync";

const NAV_LINKS = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "resumes", label: "Resumes", icon: FileText },
    { to: "jobs", label: "Job Applications", icon: Briefcase },
    { to: "analytics/summary", label: "Analytics", icon: BarChart3 },
];

interface NavItemProps {
    to: string;
    label: string;
    icon: React.ElementType;
    end?: boolean;
    onClick?: () => void;
}

function NavItem({ to, label, icon: Icon, end, onClick }: NavItemProps) {
    return (
        <NavLink
            to={to}
            end={end}
            onClick={onClick}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-transform active:scale-[0.98]",
                    isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
            }
        >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span>{label}</span>
        </NavLink>
    );
}

function ThemeToggle() {
    const { setTheme } = useTheme();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative shrink-0">
                    <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" >
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function AuthButton({ className }: { className?: string }) {
    const { session, signOut } = UserAuth() || {};

    if (!session) {
        return (
            <Button asChild variant="outline" size="sm" className={className}>
                <Link to="login">Login</Link>
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className={className}
            onClick={() => signOut && signOut()}
        >
            Logout
        </Button>
    );
}




export function AppSidebar() {
    const { session } = UserAuth() || {};
    const avatarUrl = session?.user?.user_metadata?.avatar_url;
    const userName =
        session?.user?.user_metadata?.full_name || session?.user?.email;

    return (
        <nav className="fixed left-0 top-0 bottom-0 z-10 hidden w-64 flex-col gap-2 overflow-y-auto border-r border-border bg-card p-4 pt-7 md:flex">
            {/* Removed h-screen, added bottom-0 */}
            <div className="mb-6 flex items-center justify-between px-1">
                <Link to="/" className="text-2xl font-bold tracking-tight text-primary">
                    {APP_NAME}
                </Link>
            </div>

            {session && (
                <div className="mb-6 flex items-center gap-3 border-b border-border px-1 pb-4">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : null}
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-foreground">
                            {userName}
                        </h2>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                    <NavItem key={link.to} {...link} />
                ))}
            </div>

            <div className="mt-auto flex items-center gap-2 border-t border-border py-4">
                <AuthButton className="flex-1" />
                <ThemeToggle />
            </div>
        </nav>
    );
}

export function MobileTopNav({ onSearchClick }: { onSearchClick?: () => void }) {
    const [open, setOpen] = useState(false);
    const { session } = UserAuth() || {};
    const avatarUrl = session?.user?.user_metadata?.avatar_url;

    return (
        <header className="absolute left-0 top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background px-6 md:hidden">
            <Link to="/" className="text-xl font-bold text-primary">
                {APP_NAME}
            </Link>
            <div className="flex items-center gap-2">
                <button
                    onClick={onSearchClick}
                    className="rounded-lg p-2 text-muted-foreground transition-transform hover:bg-muted active:scale-[0.98]"
                >
                    <Search className="h-5 w-5" />
                </button>
                <ThemeToggle />
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="size-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="flex flex-col overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                <Link to="/" className="text-lg font-bold text-primary">
                                    {APP_NAME}
                                </Link>
                            </SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-1 flex-col gap-1 p-4">
                            {NAV_LINKS.map((link) => (
                                <NavItem key={link.to} {...link} onClick={() => setOpen(false)} />
                            ))}
                        </div>
                        <div className="flex flex-col gap-3 border-t border-border p-4">
                            {session && (
                                <div className="flex items-center gap-3 pb-1">
                                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                                        ) : null}
                                    </div>
                                    <span className="truncate text-sm font-medium text-foreground">
                                        {session?.user?.user_metadata?.full_name || session?.user?.email}
                                    </span>
                                </div>
                            )}
                            <AuthButton />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}

export default function Navbar({ onSearchClick }: { onSearchClick?: () => void }) {
    return (
        <>
            <MobileTopNav onSearchClick={onSearchClick} />
            <AppSidebar />
        </>
    );
}