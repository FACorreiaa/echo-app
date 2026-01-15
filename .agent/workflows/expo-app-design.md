---
description: Design patterns and UI guidelines for the Expo React Native app
---

# Expo App Design Workflow

## Component Architecture

### 1. Component Types
The app follows a **Components + Widgets** architecture:

- **Components** (`/components/ui/`): Atomic, reusable UI primitives
  - `GlassyCard`, `GlassyButton`, `Input`, `Avatar`
  - Stateless, theme-aware, no data fetching

- **Widgets** (`/widgets/`): Intelligent, data-aware components
  - Fetch their own data via React Query hooks
  - Handle Loading, Error, Empty, Success states
  - Examples: `NetWorthCard`, `PacingMeter`, `AlertBell`

### 2. Creating a New Widget

```tsx
// widgets/example/ExampleWidget.tsx
import { GlassWidget } from "@/components/GlassWidget";
import { useExampleData } from "@/lib/hooks/use-example";

export const ExampleWidget = () => {
  const { data, isLoading, error } = useExampleData();
  
  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError message={error.message} />;
  if (!data) return <WidgetEmpty />;
  
  return (
    <GlassWidget>
      {/* Widget content */}
    </GlassWidget>
  );
};
```

### 3. Theme Tokens

Always use semantic theme tokens for WCAG AA compliance:

| Token | Use Case |
|-------|----------|
| `$color` | Primary text (headings, important content) |
| `$secondaryText` | Secondary text (labels, descriptions) |
| `$accentColor` | Interactive elements, links |
| `$background` | Page backgrounds |
| `$backgroundHover` | Card backgrounds, inputs |
| `$borderColor` | Borders, separators |
| `$formInputBackground` | Form input backgrounds |
| `$formInputPlaceholder` | Placeholder text |

### 4. Glassmorphism Standards

```tsx
// Use GlassyCard for cards
<GlassyCard>
  <Text color="$color">Content</Text>
</GlassyCard>

// Use GlassWidget for data widgets
<GlassWidget marginBottom="$4">
  <YStack gap="$2">...</YStack>
</GlassWidget>
```

### 5. Typography

- **Headings**: `fontFamily="$heading"`, `fontWeight="bold"` or `"900"`
- **Body**: `fontFamily="$body"` (Outfit font family)
- **Size scale**: `$1` (11px) to `$16` (134px)

### 6. Spacing

Use Tamagui space tokens:
- `$1` = 4px, `$2` = 8px, `$3` = 12px, `$4` = 16px, `$5` = 20px

### 7. Animation

Use Moti for declarative animations:
```tsx
import { MotiView } from "moti";

<MotiView
  from={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "timing", duration: 300 }}
>
  {children}
</MotiView>
```

## Accessibility Checklist

- [ ] All text uses `$color` or `$secondaryText` (no raw opacity)
- [ ] Interactive elements have proper tap targets (min 44px)
- [ ] Icons use `$secondaryText` or semantic colors
- [ ] Form inputs use `$formInputBackground` and `$formInputPlaceholder`
- [ ] Error states use `#ef4444` for visibility
- [ ] Success states use `#22c55e`
