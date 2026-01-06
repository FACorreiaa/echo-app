# Echo App Architecture

## Directory Structure

```
app/                    # Expo Router - File-based routing
├── (auth)/            # Auth-protected routes (login, register)
├── (public)/          # Public routes (landing, pricing, features)
└── (tabs)/            # Tab navigation routes (index, transactions, planning, etc.)

components/            # Reusable UI primitives & animations
├── ui/                # Pure UI components (no business logic)
│   ├── Avatar.tsx
│   ├── GlassyButton.tsx
│   ├── GlassyCard.tsx
│   ├── Input.tsx
│   ├── PasswordInput.tsx
│   └── ThemeToggle.tsx
├── animations/        # Reusable animations
│   ├── GradientBackground.tsx
│   └── LoginTransition.tsx
└── auth/              # Auth-specific components
    ├── AliveBackground.tsx
    └── AliveInitialScreen.tsx

widgets/               # Domain-specific composite widgets
├── alerts/            # Alert system widgets
│   ├── AlertBell.tsx
│   └── index.ts
├── balance/           # Balance & net worth widgets
│   ├── BalanceHistoryChart.tsx
│   ├── NetWorthCard.tsx
│   └── index.ts
├── bento/             # Bento grid system widgets
│   ├── BentoCard.tsx
│   ├── BentoGrid.tsx
│   ├── HookCard.tsx
│   ├── InboxBadge.tsx
│   └── WhatIfSlider.tsx
├── ingestion/         # Data import/ingestion widgets
│   ├── ImportProgress.tsx
│   ├── ImportSuccessSummary.tsx
│   ├── IngestionPulse.tsx
│   └── MappingWizard.tsx
├── insights/          # Financial insights widgets
│   └── PacingMeter.tsx
├── onboarding/        # Onboarding flow widgets
│   └── SplashScreen.tsx
├── planning/          # Budget planning widgets
│   ├── CategoryDetailCard.tsx
│   ├── CategoryGroupCard.tsx
│   ├── CategorySpendingChart.tsx
│   ├── CreatePlanSheet.tsx
│   ├── GoalActualProgress.tsx
│   ├── GridCell.tsx
│   ├── MonthlyGridView.tsx
│   ├── PlanCard.tsx
│   └── PlanDashboard.tsx
├── transactions/      # Transaction widgets
│   └── QuickCapture.tsx
├── types.ts           # Shared widget types
└── index.ts           # Barrel exports

lib/                   # Business logic, hooks, utilities
├── hooks/             # React Query hooks & custom hooks
│   ├── use-balance.ts
│   ├── use-import.ts
│   ├── use-insights.ts
│   ├── use-plans.ts
│   └── use-transactions.ts
├── supabase/          # Supabase client & types
└── utils/             # Utility functions
```

## Component vs Widget

### Components (`components/`)
**Pure UI primitives with minimal or no business logic**

- **Characteristics:**
  - Reusable across the entire app
  - No direct API calls or data fetching
  - Accept all data via props
  - No domain knowledge (don't know about "transactions" or "plans")
  - Highly composable

- **Examples:**
  - `GlassyCard` - A glassmorphic card container
  - `GlassyButton` - A glassmorphic button
  - `Input` - A themed text input
  - `Avatar` - A user avatar component
  - `ThemeToggle` - Light/dark theme toggle

- **When to create a component:**
  - When you need a styled UI primitive
  - When you're repeating the same UI pattern 3+ times
  - When the element has no domain-specific logic

### Widgets (`widgets/`)
**Domain-specific composite components that combine UI with business logic**

- **Characteristics:**
  - Domain-aware (knows about transactions, plans, alerts, etc.)
  - May fetch data using React Query hooks
  - Composes multiple UI components
  - Self-contained functionality
  - Organized by feature/domain

- **Examples:**
  - `NetWorthCard` - Displays net worth with balance breakdown (uses `useBalance` hook)
  - `QuickCapture` - Quick transaction entry widget (uses `useCreateTransaction`)
  - `AlertBell` - Alert notification system (uses `useAlerts`)
  - `PlanDashboard` - Complete planning dashboard view

- **When to create a widget:**
  - When building a feature-specific component
  - When combining multiple UI components with data fetching
  - When the component represents a complete user workflow
  - When the component belongs to a specific domain (alerts, planning, etc.)

## Naming Conventions

### Components
- Use descriptive names: `GlassyButton`, `ThemeToggle`, `PasswordInput`
- No suffixes needed (folder structure makes it clear)
- Export as named export: `export function GlassyButton() {}`

### Widgets
- Use descriptive names based on function: `NetWorthCard`, `AlertBell`, `QuickCapture`
- **NO** `*Widget` suffix (folder structure makes it obvious)
- Organize in domain folders: `widgets/balance/`, `widgets/alerts/`, etc.
- Export as named export: `export function NetWorthCard() {}`

### Files & Folders
- PascalCase for components: `GlassyCard.tsx`
- lowercase for folders: `widgets/planning/`
- `index.ts` for barrel exports in each widget domain folder

## Import Paths

### Preferred Imports
```typescript
// UI Components
import { GlassyCard, GlassyButton, Input } from "@/components/ui";

// Animations
import { GradientBackground } from "@/components/animations";

// Widgets - Import from domain folders
import { NetWorthCard } from "@/widgets/balance";
import { QuickCapture } from "@/widgets/transactions";
import { PlanDashboard } from "@/widgets/planning";

// Or use barrel export (less preferred - harder to tree-shake)
import { NetWorthCard, BalanceHistoryChart } from "@/widgets";
```

### Migration Note
The `components/index.ts` file re-exports widgets for backward compatibility. New code should import directly from `@/widgets/*`.

## Widget Organization

Widgets are organized by domain/feature:

- **`alerts/`** - Alert & notification system
- **`balance/`** - Balance, net worth, account summaries
- **`bento/`** - Bento grid layout system
- **`ingestion/`** - Data import & CSV mapping
- **`insights/`** - Financial insights & analytics
- **`onboarding/`** - User onboarding flows
- **`planning/`** - Budget planning & tracking
- **`transactions/`** - Transaction management

## Best Practices

### 1. Keep Widgets Modular
✅ **Good:**
```typescript
// Small, focused widgets
export function PlanCard({ plan }: PlanCardProps) {
  return <GlassyCard>...</GlassyCard>;
}
```

❌ **Bad:**
```typescript
// 600-line mega-widget that does everything
export function PlanningDashboardWithFormAndImportAndEverything() {
  // Too much responsibility
}
```

### 2. Compose Widgets
✅ **Good:**
```typescript
export function PlanDashboard() {
  return (
    <YStack>
      <PlanCard plan={plan} />
      <CategorySpendingChart data={data} />
      <GoalActualProgress pillars={pillars} />
    </YStack>
  );
}
```

### 3. Keep Business Logic in Hooks
✅ **Good:**
```typescript
// In lib/hooks/use-balance.ts
export function useBalance() {
  return useQuery({
    queryKey: ["balance"],
    queryFn: fetchBalance,
  });
}

// In widgets/balance/NetWorthCard.tsx
export function NetWorthCard() {
  const { data } = useBalance();
  return <GlassyCard>{data.netWorth}</GlassyCard>;
}
```

❌ **Bad:**
```typescript
// Widget doing API calls directly
export function NetWorthCard() {
  const [data, setData] = useState();
  useEffect(() => {
    fetch("/api/balance").then(setData);
  }, []);
  // ...
}
```

### 4. Use TypeScript Interfaces
```typescript
// Export types for reusability
export interface NetWorthCardProps {
  accountId?: string;
  showBreakdown?: boolean;
}

export function NetWorthCard({ accountId, showBreakdown = true }: NetWorthCardProps) {
  // ...
}
```

### 5. Barrel Exports
Each widget domain folder should have an `index.ts`:

```typescript
// widgets/balance/index.ts
export { BalanceHistoryChart } from "./BalanceHistoryChart";
export { NetWorthCard } from "./NetWorthCard";
```

## Migration Guide

When refactoring old code:

1. **Identify the type:**
   - Is it a pure UI component? → `components/ui/`
   - Is it an animation? → `components/animations/`
   - Is it domain-specific? → `widgets/{domain}/`

2. **Remove `*Widget` suffixes** from component names and filenames

3. **Update imports** to use new paths

4. **Break down large widgets** (>300 lines) into smaller, focused components

5. **Extract business logic** into hooks if needed

## Testing

- **Components:** Test props, rendering, and user interactions
- **Widgets:** Test integration with hooks, data flow, and workflows
- Place tests in `__tests__` folders within each directory

## Performance

- Use React.memo() for expensive widgets
- Lazy load heavy widgets with dynamic imports
- Keep widget re-renders minimal by proper prop design
- Use React Query for caching and data synchronization

## Questions?

- **"Should this be a component or a widget?"** → Does it know about your domain (transactions, plans, etc.)? Widget. Pure UI? Component.
- **"Where should I put this file?"** → What domain does it belong to? Create a new domain folder if needed.
- **"Can I use components inside widgets?"** → Yes! Widgets compose components.
- **"Can I use widgets inside components?"** → No. Components should be domain-agnostic.
