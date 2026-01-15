/**
 * Components Index
 *
 * Re-exports for backward compatibility during migration.
 * Import from @/components/ui or @/widgets for new code.
 */

// UI Components (now in components/ui/)
export { Avatar } from "./ui/Avatar";
export { GlassyButton } from "./ui/GlassyButton";
export { GlassyCard } from "./ui/GlassyCard";
export { ThemeToggle } from "./ui/ThemeToggle";

// Input components (now in components/ui/)
export { FormField, GlassInput, GlassPasswordInput, PasswordField } from "./ui/GlassInput";
export { Input } from "./ui/Input";
export { PasswordInput } from "./ui/PasswordInput";

// Animations (now in components/animations/)
export { GradientBackground } from "./animations/GradientBackground";
export { LoginSuccessAnimation as LoginTransition } from "./animations/LoginTransition";

// Widgets - Re-export for backward compatibility
// These are now in @/widgets but exported here to avoid breaking changes
export { AlertBell } from "@/widgets/alerts/AlertBell";
export { BalanceHistoryChart } from "@/widgets/balance/BalanceHistoryChart";
export { NetWorthCard } from "@/widgets/balance/NetWorthCard";
export { PacingMeter } from "@/widgets/insights/PacingMeter";
export { SplashScreen } from "@/widgets/onboarding/SplashScreen";
export { QuickCapture } from "@/widgets/transactions/QuickCapture";

// Bento - Re-export
export * from "@/widgets/bento";

// Import/Ingestion - Re-export as 'import' path
export * from "@/widgets/ingestion";

// Plan - Re-export
export * from "@/widgets/planning";
