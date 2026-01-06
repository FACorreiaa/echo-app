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
export { Input } from "./ui/Input";
export { PasswordInput } from "./ui/PasswordInput";

// Animations (now in components/animations/)
export { GradientBackground } from "./animations/GradientBackground";
export { LoginSuccessAnimation as LoginTransition } from "./animations/LoginTransition";

// Widgets - Re-export for backward compatibility
// These are now in @/widgets but exported here to avoid breaking changes
export { AlertBell } from "@/widgets/alerts/AlertBellWidget";
export { BalanceHistoryChart } from "@/widgets/balance/BalanceHistoryWidget";
export { NetWorthCard } from "@/widgets/balance/NetWorthWidget";
export { PacingMeter } from "@/widgets/insights/PacingWidget";
export { EchoSplashScreen } from "@/widgets/onboarding/SplashWidget";
export { QuickCapture } from "@/widgets/transactions/QuickCaptureWidget";

// Bento - Re-export
export * from "@/widgets/bento";

// Import/Ingestion - Re-export as 'import' path
export * from "@/widgets/ingestion";

// Plan - Re-export
export * from "@/widgets/planning";
