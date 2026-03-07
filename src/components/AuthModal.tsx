import silkBg from "@/assets/silk-bg-2.jpg";
import { SignIn, SignUp } from "@clerk/react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: "signin" | "signup";
    onSwitchMode: (mode: "signin" | "signup") => void;
}

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative w-full max-w-5xl h-[600px] bg-background rounded-3xl overflow-hidden shadow-2xl pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-all duration-300"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex h-full">
                                {/* Left side - Branding with background */}
                                <motion.div
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
                                >
                                    {/* Background image */}
                                    <img
                                        src={silkBg}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />

                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/50 to-black/70" />

                                    {/* Animated gradient overlay */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10"
                                        animate={{
                                            opacity: [0.3, 0.5, 0.3],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />

                                    {/* Content */}
                                    <div className="relative z-10 p-12 text-white">
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <span className="font-display font-bold text-3xl tracking-wide block mb-6">
                                                NOVA<span className="text-white/60 italic">ARC</span>
                                            </span>
                                            <h2 className="font-display text-5xl font-bold leading-tight mb-4">
                                                CONNECT BEYOND
                                                <br />
                                                BOUNDARIES
                                            </h2>
                                            <p className="text-white/80 text-base max-w-md leading-relaxed">
                                                Crystal-clear video meetings with real-time collaboration for teams who demand excellence.
                                            </p>
                                        </motion.div>

                                        {/* Decorative elements */}
                                        <motion.div
                                            className="absolute bottom-12 left-12 right-12"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            <div className="flex items-center gap-8 text-white/60 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                    <span>Secure & Encrypted</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                                    <span>HD Quality</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>

                                {/* Right side - Auth form */}
                                <motion.div
                                    initial={{ x: 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-y-auto"
                                >
                                    <div className="w-full max-w-md">
                                        {/* Mobile branding */}
                                        <div className="lg:hidden mb-8 text-center">
                                            <span className="font-display font-bold text-2xl tracking-wide text-foreground">
                                                NOVA<span className="text-muted-foreground italic">ARC</span>
                                            </span>
                                        </div>

                                        {/* Clerk Auth Components */}
                                        <div className="clerk-modal-container">
                                            {mode === "signin" ? (
                                                <SignIn
                                                    appearance={{
                                                        elements: {
                                                            rootBox: "w-full",
                                                            card: "bg-transparent shadow-none w-full",
                                                            headerTitle: "text-foreground font-display text-2xl",
                                                            headerSubtitle: "text-muted-foreground",
                                                            socialButtonsBlockButton: "bg-card border border-border hover:bg-accent transition-all",
                                                            socialButtonsBlockButtonText: "text-foreground font-medium",
                                                            formButtonPrimary: "bg-foreground text-background hover:bg-foreground/90 transition-all",
                                                            formFieldLabel: "text-muted-foreground text-xs uppercase tracking-wider",
                                                            formFieldInput: "bg-card border-border text-foreground rounded-xl",
                                                            footerActionLink: "text-foreground hover:text-foreground/80",
                                                            identityPreviewText: "text-foreground",
                                                            formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                                                            dividerLine: "bg-border",
                                                            dividerText: "text-muted-foreground text-xs",
                                                            footer: "hidden", // We'll add custom footer
                                                        },
                                                    }}
                                                    routing="hash"
                                                    signUpUrl="#"
                                                    afterSignInUrl="/dashboard"
                                                />
                                            ) : (
                                                <SignUp
                                                    appearance={{
                                                        elements: {
                                                            rootBox: "w-full",
                                                            card: "bg-transparent shadow-none w-full",
                                                            headerTitle: "text-foreground font-display text-2xl",
                                                            headerSubtitle: "text-muted-foreground",
                                                            socialButtonsBlockButton: "bg-card border border-border hover:bg-accent transition-all",
                                                            socialButtonsBlockButtonText: "text-foreground font-medium",
                                                            formButtonPrimary: "bg-foreground text-background hover:bg-foreground/90 transition-all",
                                                            formFieldLabel: "text-muted-foreground text-xs uppercase tracking-wider",
                                                            formFieldInput: "bg-card border-border text-foreground rounded-xl",
                                                            footerActionLink: "text-foreground hover:text-foreground/80",
                                                            identityPreviewText: "text-foreground",
                                                            formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                                                            dividerLine: "bg-border",
                                                            dividerText: "text-muted-foreground text-xs",
                                                            footer: "hidden", // We'll add custom footer
                                                        },
                                                    }}
                                                    routing="hash"
                                                    signInUrl="#"
                                                    afterSignUpUrl="/dashboard"
                                                />
                                            )}

                                            {/* Custom footer for switching modes */}
                                            <div className="mt-6 text-center">
                                                <p className="text-sm text-muted-foreground">
                                                    {mode === "signin" ? (
                                                        <>
                                                            Don't have an account?{" "}
                                                            <button
                                                                onClick={() => onSwitchMode("signup")}
                                                                className="text-foreground font-medium hover:underline"
                                                            >
                                                                Sign up
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            Already have an account?{" "}
                                                            <button
                                                                onClick={() => onSwitchMode("signin")}
                                                                className="text-foreground font-medium hover:underline"
                                                            >
                                                                Sign in
                                                            </button>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
