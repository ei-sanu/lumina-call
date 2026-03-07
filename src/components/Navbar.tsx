import { useClerk, useUser } from "@clerk/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Grid, LogOut, Menu, Monitor, Settings, Sidebar as SidebarIcon, Users, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Services", href: "/#services" },
  { label: "FAQ", href: "/#faq" },
];

interface NavbarProps {
  onOpenAuth?: (mode: "signin" | "signup") => void;
  // Meeting room props
  meetingTitle?: string;
  inviteCode?: string;
  participantCount?: number;
  isHost?: boolean;
  layout?: 'grid' | 'spotlight' | 'sidebar';
  onLayoutChange?: (layout: 'grid' | 'spotlight' | 'sidebar') => void;
  onCopyInviteCode?: () => void;
  onCopyInviteLink?: () => void;
  onEndMeeting?: () => void;
  copied?: boolean;
}

const Navbar = ({
  onOpenAuth,
  meetingTitle,
  inviteCode,
  participantCount,
  isHost,
  layout,
  onLayoutChange,
  onCopyInviteCode,
  onCopyInviteLink,
  onEndMeeting,
  copied,
}: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isMeetingRoom = location.pathname.includes("/meeting/");
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const getInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card flex items-center justify-between h-14 px-6 rounded-full"
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display font-bold text-lg tracking-wide text-foreground">
            NOVA<span className="text-muted-foreground italic">ARC</span>
          </span>
        </Link>

        {/* Meeting Room Controls */}
        {isMeetingRoom && meetingTitle ? (
          <>
            {/* Desktop meeting controls */}
            <div className="hidden lg:flex items-center gap-3 flex-1 justify-center">
              <h1 className="font-display text-sm xl:text-base chrome-text-hero tracking-tight truncate max-w-[200px]">
                {meetingTitle.toUpperCase()}
              </h1>
              {inviteCode && (
                <>
                  <button
                    onClick={onCopyInviteCode}
                    className="glass-card px-2 xl:px-3 py-1 text-xs text-foreground hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-1.5 transition-all"
                  >
                    <span className="font-mono font-semibold">{inviteCode}</span>
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={onCopyInviteLink}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Share
                  </button>
                </>
              )}
            </div>

            {/* Desktop meeting actions */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Layout Toggle */}
              {onLayoutChange && (
                <div className="flex items-center gap-0.5 glass-card p-0.5 rounded-lg">
                  <button
                    onClick={() => onLayoutChange('grid')}
                    className={`p-1.5 rounded-md transition-all ${layout === 'grid'
                      ? 'bg-foreground/20 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/10'
                      }`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onLayoutChange('spotlight')}
                    className={`p-1.5 rounded-md transition-all ${layout === 'spotlight'
                      ? 'bg-foreground/20 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/10'
                      }`}
                    title="Spotlight View"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onLayoutChange('sidebar')}
                    className={`p-1.5 rounded-md transition-all ${layout === 'sidebar'
                      ? 'bg-foreground/20 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/10'
                      }`}
                    title="Sidebar View"
                  >
                    <SidebarIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Participant Count */}
              {participantCount !== undefined && (
                <div className="flex items-center gap-1.5 glass-card px-2 py-1.5 rounded-full">
                  <Users className="w-3.5 h-3.5 text-foreground" />
                  <span className="text-foreground text-xs font-medium">{participantCount}</span>
                </div>
              )}

              {/* End Meeting (Host Only) */}
              {isHost && onEndMeeting && (
                <Button
                  onClick={onEndMeeting}
                  variant="destructive"
                  size="sm"
                  className="bg-red-500/90 hover:bg-red-600 text-white border-0 shadow-lg h-8 text-xs px-3"
                >
                  End for All
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Desktop nav - centered navigation links */}
            <div className="hidden md:flex items-center justify-center gap-8 flex-1">
              {isLanding && navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isSignedIn ? (
                <>
                  <Link to="/dashboard">
                    <button className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all duration-300">
                      Dashboard
                    </button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 glass-card px-3 py-2 rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user?.imageUrl} />
                          <AvatarFallback className="text-xs bg-foreground/20">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground font-medium hidden lg:inline">
                          {user?.firstName || "Profile"}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-card border border-white/10">
                      <DropdownMenuLabel className="text-foreground">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user?.firstName || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user?.primaryEmailAddress?.emailAddress || "No email"}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem asChild className="text-foreground hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                        <Link to="/settings" className="flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        onClick={() => signOut()}
                        className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth?.("signin")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => onOpenAuth?.("signup")}
                    className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all duration-300"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* Mobile toggle */}
        <button
          className={`${isMeetingRoom ? 'lg:hidden' : 'md:hidden'} text-foreground`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`${isMeetingRoom ? 'lg:hidden' : 'md:hidden'} glass-card mt-2 rounded-2xl overflow-hidden`}
          >
            <div className="flex flex-col gap-1 p-4">
              {isMeetingRoom && meetingTitle ? (
                <>
                  <div className="text-xs text-muted-foreground mb-2">Meeting Controls</div>
                  <div className="text-sm font-display chrome-text-hero mb-2">{meetingTitle.toUpperCase()}</div>
                  {inviteCode && (
                    <button
                      onClick={() => {
                        onCopyInviteCode?.();
                        setMobileOpen(false);
                      }}
                      className="glass-card px-3 py-2 text-sm text-foreground flex items-center gap-2 justify-between"
                    >
                      <span className="font-mono font-semibold">{inviteCode}</span>
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  {onCopyInviteLink && (
                    <button
                      onClick={() => {
                        onCopyInviteLink();
                        setMobileOpen(false);
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 text-left"
                    >
                      Copy Share Link
                    </button>
                  )}
                  {participantCount !== undefined && (
                    <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{participantCount} Participant{participantCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {isHost && onEndMeeting && (
                    <Button
                      onClick={() => {
                        onEndMeeting();
                        setMobileOpen(false);
                      }}
                      variant="destructive"
                      className="bg-red-500/90 hover:bg-red-600 text-white border-0 w-full mt-2"
                    >
                      End Meeting for All
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {isLanding && navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  {isSignedIn ? (
                    <>
                      <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                        <button className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium w-full">
                          Dashboard
                        </button>
                      </Link>
                      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-3 px-2 py-2">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user?.imageUrl} />
                            <AvatarFallback className="text-sm bg-foreground/20">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-foreground">
                              {user?.firstName && user?.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user?.firstName || "User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user?.primaryEmailAddress?.emailAddress || "No email"}
                            </p>
                          </div>
                        </div>
                        <Link to="/settings" onClick={() => setMobileOpen(false)}>
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-2 w-full text-left">
                            <Settings className="w-4 h-4" />
                            Settings
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setMobileOpen(false);
                          }}
                          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors py-2 px-2 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onOpenAuth?.("signin");
                          setMobileOpen(false);
                        }}
                        className="text-sm text-muted-foreground w-full text-left py-2"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => {
                          onOpenAuth?.("signup");
                          setMobileOpen(false);
                        }}
                        className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium w-full"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
