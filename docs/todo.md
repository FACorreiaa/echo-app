# Echo Money OS - Implementation Roadmap

## Overview
This document outlines the transformation of Echo from a budgeting app into an intelligent "Money Operating System" with real-time health monitoring, predictive insights, and behavioral coaching.

---

## Phase 1: System Health Score (SHS) - Core Engine

### 1.1 Backend Go Service - GetSystemHealth RPC
**Location:** Go backend service (insights package)

**Status:** Not Implemented

**Description:** Create a new RPC endpoint that calculates the System Health Score by comparing the Active Plan against Net Worth.

**Implementation Details:**
```go
// Service: InsightService.GetSystemHealth
// Returns: HealthReport with score, status, and detailed metrics

type HealthReport struct {
    Score              int     // 0-100 overall health score
    Status             string  // "HEALTHY" | "WARNING" | "CRITICAL"
    LiquidityRatio     float64 // Net Worth / Total Monthly Expenses
    BurnRatePacing     float64 // (Current Spend / Planned Spend) vs (Days Elapsed / Total Days)
    GoalVelocity       float64 // Surplus Remaining / Total Monthly Goal Targets
    FundingGap         int64   // If negative: Net Worth - Plan Cost (in cents)
    DailyAllowance     int64   // Remaining budget / days left (in cents)
    InsightMessages    []string
}
```

**Tasks:**
- [ ] Create `InsightService.GetSystemHealth` RPC in proto definitions
- [ ] Implement health score calculation algorithm:
  - [ ] Liquidity Ratio: (Net Worth / Total Plan Expenses)
  - [ ] Burn Rate Pacing: Compare actual spending pace vs time elapsed
  - [ ] Goal Velocity: Track if savings goals are being funded
- [ ] Calculate weighted composite score (0-100)
- [ ] Generate insight messages based on thresholds
- [ ] Calculate daily allowance: (Remaining Budget / Days Left)
- [ ] Add unit tests for score calculation logic

**Dependencies:**
- Access to user's Net Worth (Balance service)
- Access to Active Plan data (Plan service)
- Access to transaction data (Finance service)

---

### 1.2 Frontend React Hook - useSystemHealth
**Location:** `lib/hooks/use-system-health.ts`

**Status:** Not Implemented

**Tasks:**
- [x] Create `useSystemHealth()` React Query hook
- [x] Fetch data from `InsightService.GetSystemHealth` (Simulated/Calculated Client-side)
- [x] Transform proto response to TypeScript types
- [x] Add proper caching (staleTime: 60s)
- [x] Handle loading and error states

**TypeScript Interface:**
```typescript
export interface SystemHealth {
  score: number;              // 0-100
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  liquidityRatio: number;
  burnRatePacing: number;
  goalVelocity: number;
  fundingGap: number;         // In major units (euros)
  dailyAllowance: number;     // In major units
  insightMessages: string[];
}
```

---

## Phase 2: Home Tab - Command Center Widgets

### 2.1 System Health Score Widget
**Location:** `widgets/insights/SystemHealthScoreCard.tsx`

**Status:** Not Implemented

**Description:** Replace or enhance the existing NetWorthCard with a System Health Score display that shows the overall financial system status.

**Features:**
- Large numeric score (0-100) with color coding:
  - **90-100:** Green "SYSTEMS OPTIMAL"
  - **60-89:** Yellow "PACING WARNING"
  - **< 60:** Red "LIQUIDITY CRISIS"
- Animated pulsing circle (Moti) that changes color based on health
- Quick insight message (e.g., "You're on track to fund all goals")
- Tap to expand for detailed breakdown

**Tasks:**
- [ ] Create `SystemHealthScoreCard.tsx` component
- [ ] Integrate with `useSystemHealth()` hook
- [ ] Add Moti animations for pulsing health indicator
- [ ] Implement color theming based on score ranges
- [ ] Add tap gesture to show detailed breakdown modal
- [ ] Write unit tests

---

### 2.2 Daily Allowance Widget - "Safe to Spend Today"
**Location:** `widgets/insights/DailyAllowanceWidget.tsx`

**Status:** Not Implemented (Note: NetWorthCard has "Safe to Spend" but it's based on bills, not daily allowance)

**Description:** Display the exact amount the user can safely spend TODAY to stay on track with their monthly plan.

**Logic:**
```
Daily Allowance = (Remaining Budget - Remaining Recurring Bills) / Days Left in Month
```

**Features:**
- Large, prominent number: "€45.20"
- Subtitle: "Safe to Spend Today"
- Context text: "Based on 12 days remaining"
- Color coding:
  - **Green:** Daily allowance > €30
  - **Yellow:** Daily allowance €15-30 (tight budget)
  - **Red:** Daily allowance < €15 (critical)

**Tasks:**
- [ ] Create `DailyAllowanceWidget.tsx` component
- [ ] Extract `dailyAllowance` from `useSystemHealth()`
- [ ] Calculate days remaining in current month
- [ ] Implement dynamic color theming
- [ ] Add "How is this calculated?" info tooltip
- [ ] Write unit tests

---

### 2.3 Enhanced Pacing Widget with Ghost Indicator
**Location:** `widgets/insights/PacingMeter.tsx`

**Status:** Partially Implemented (Current PacingMeter compares to last month, not time progress)

**Description:** Upgrade the existing PacingMeter to show a "Ghost" time indicator that visualizes if spending is ahead/behind the calendar.

**Features:**
- Progress bar showing spending progress (0-100%)
- Vertical "Ghost" line showing time progress (Day X / Total Days)
- If spending bar passes ghost line: **OVER-PACING** (red)
- If spending bar is behind ghost line: **ON TRACK** (green)
- Animated flickering of the ghost line (Moti pulse)

**Tasks:**
- [ ] Update `PacingMeter.tsx` to include ghost time indicator
- [ ] Calculate `timeProgress = (currentDay / daysInMonth) * 100`
- [ ] Calculate `spendingProgress = (currentSpend / monthlyBudget) * 100`
- [ ] Add vertical line at `timeProgress` position
- [ ] Add Moti pulse animation to ghost line (opacity: 0.4 → 0.8)
- [ ] Update messaging: "You're spending 2x faster than the calendar"
- [ ] Write unit tests

---

### 2.4 Insight Summary Cards
**Location:** `widgets/insights/InsightSummaryCard.tsx`

**Status:** Partially Implemented (Dashboard blocks exist but lack specific logic)

**Description:** Generate actionable insight cards based on the System Health Score calculation.

**Insight Types:**

| Insight Type | Condition | Message | Icon |
|-------------|-----------|---------|------|
| **Pacing Alert** | Actual Spend > (Days Elapsed / Total Days) * Budget | "You're spending 2x faster than planned." | ⚠️ |
| **Funding Gap** | Net Worth < (Planned Recurring + Planned Budgets) | "Deposit €200 to fund your 'Rent' recurring item." | 💰 |
| **Goal Pulse** | Surplus > Monthly Goal Target | "You've already funded your 'New Macbook' for Jan!" | ✅ |
| **Liquidity Crisis** | Liquidity Ratio < 1.0 | "Your plan exceeds current liquidity by €500." | 🚨 |

**Tasks:**
- [ ] Create `InsightSummaryCard.tsx` component
- [ ] Parse `insightMessages` from `useSystemHealth()`
- [ ] Map messages to icons and colors
- [ ] Add tap actions for each insight type (e.g., navigate to Planning tab)
- [ ] Write unit tests

---

### 2.5 Update Home Tab Layout
**Location:** `app/(tabs)/index.tsx`

**Status:** Needs Refactoring

**Tasks:**
- [ ] Add `SystemHealthScoreCard` above or replacing PacingMeter
- [ ] Add `DailyAllowanceWidget` as prominent hero card
- [ ] Keep enhanced `PacingMeter` with ghost indicator
- [ ] Replace generic dashboard blocks with `InsightSummaryCard`
- [ ] Reorganize layout for "Command Center" feel:
  ```
  1. System Health Score (Hero)
  2. Daily Allowance (Prominent)
  3. Pacing Meter (Visual timeline)
  4. Insight Summary Cards (Grid)
  5. Net Worth Card (Existing)
  6. Recent Activity (Existing)
  ```

---

## Phase 3: Planning Tab - Enhanced Active Plan Header

### 3.1 Upgrade ActivePlanHeader with SHS Integration
**Location:** `widgets/planning/ActivePlanHeader.tsx`

**Status:** Partially Implemented (Shows basic execution and funding)

**Tasks:**
- [x] Integrate `useSystemHealth()` hook
- [x] Replace current "System Health" text with numeric score
- [x] Add score badge (90+ green, 60-89 yellow, <60 red)
- [x] Show "Burn Rate Pacing" metric: "Spending 1.2x faster than planned"
- [x] Show "Goal Velocity" metric: "Goals 80% funded"
- [x] Add expandable section for detailed health breakdown
- [x] Write unit tests

---

## Phase 4: Landing Page - Trust & Privacy Section

### 4.1 Create Privacy Motto Section
**Location:** Website/Landing Page (separate from app)

**Status:** Not Implemented

**Description:** Create a prominent "Trust & Privacy" section for the Echo landing page that establishes user trust and emphasizes data ownership.

**Content Structure:**

```markdown
## Your Money, Your Data, Your Terms

### The Read-Only Promise
Echo is architected to be a "Read-Only" operating system. We analyze your financial
history to give you insights, but we never have the power to move, touch, or access
your real-world funds.

### No Data Silos
Your financial plan shouldn't be a secret held by a corporation. With our "Bring Your
Own Spreadsheet" philosophy, you maintain the master copy of your strategy in Excel
or CSV; we simply provide the high-performance engine to bring it to life.

### Local-First Privacy
We use industry-standard encryption to ensure that your ingested bank strings are
processed securely and remain invisible to everyone but you.

### Data Ownership Forever
Your data is your legacy. We don't just protect it—we ensure you own it, forever.
```

**Tasks:**
- [ ] Design privacy section UI (Hero section or dedicated page)
- [ ] Add icons for each trust pillar (Read-Only, No Silos, Privacy, Ownership)
- [ ] Create "How Echo Works" diagram showing data flow
- [ ] Add "Export Your Data" CTA to emphasize portability
- [ ] Include testimonials or trust badges (if applicable)

---

## Phase 5: Advanced Features (Future)

### 5.1 Burn Rate Alerts (Push Notifications)
- [ ] Send alert when spending > 120% of time-based budget
- [ ] Daily digest showing health score trend

### 5.2 "What-If" Scenarios
- [ ] Allow user to simulate plan changes
- [ ] Show projected health score impact

### 5.3 Goal Funding Autopilot
- [ ] Automatically suggest moving surplus to goals
- [ ] "Smart allocator" for leftover budget

### 5.4 Historical Health Score Trend
- [ ] Track health score over 3-6 months
- [ ] Show correlation between actions and score improvement

---

## Implementation Priority

### Immediate (Sprint 1-2 weeks)
1. ✅ **Phase 1.1:** Backend Go Service - GetSystemHealth RPC
2. ✅ **Phase 1.2:** Frontend Hook - useSystemHealth
3. ✅ **Phase 2.2:** Daily Allowance Widget

### Near-term (Sprint 2-4 weeks)
4. ✅ **Phase 2.1:** System Health Score Widget
5. ✅ **Phase 2.3:** Enhanced Pacing Widget with Ghost Indicator
6. ✅ **Phase 2.5:** Update Home Tab Layout

### Medium-term (Sprint 5-8 weeks)
7. ✅ **Phase 2.4:** Insight Summary Cards
8. ✅ **Phase 3.1:** Upgrade ActivePlanHeader

### Long-term (After MVP launch)
9. ✅ **Phase 4.1:** Landing Page Privacy Section
10. ✅ **Phase 5.x:** Advanced Features

---

## Technical Considerations

### Performance
- Cache System Health Score for 60 seconds to avoid excessive recalculation
- Use React Query's staleTime and cacheTime appropriately
- Optimize Go calculations to run in < 100ms

### Error Handling
- Handle missing Active Plan gracefully (show "Create a Plan" CTA)
- Handle zero Net Worth scenario (show onboarding)
- Provide fallback UI when health score calculation fails

### Testing
- Unit tests for all score calculation logic (Go)
- Unit tests for all React components
- Integration tests for E2E health score flow
- Visual regression tests for widget UI

### Accessibility
- Ensure all score indicators have text alternatives
- Use semantic color naming (not just red/yellow/green)
- Add aria-labels for screen readers

---

## Success Metrics

### User Engagement
- Daily active users viewing System Health Score
- Average time spent on Home tab (Command Center)
- Tap rate on insight cards

### Financial Outcomes
- % of users with "HEALTHY" score (target: 60%+)
- Average improvement in health score over 30 days
- % of users who stay within daily allowance

### Product Metrics
- Retention rate (D1, D7, D30)
- Feature adoption: Daily Allowance Widget
- User feedback score on "Command Center" experience

---

## Notes

### Already Implemented ✅
- Home tab with NetWorthCard, basic PacingMeter, DashboardBlocks
- ActivePlanHeader with basic "System Health" display
- Planning tab with budgets, goals, recurring items
- Edit Plan functionality (EditPlanSheet)
- Insights hooks: useSpendingPulse, useDashboardBlocks, useMonthlyInsights

### Key Differentiators
- **Liquidity Awareness:** Unlike other apps, Echo knows if your plan is "fundable"
- **Real-Time Pacing:** Visual feedback on spending vs time (not just totals)
- **Daily Coaching:** "Safe to Spend Today" removes decision paralysis
- **OS Metaphor:** Not just tracking—it's a financial operating system

---

## Future Enhancements (Existing Items)

### Balance Engine UI
- [ ] **24h change per account** - Show change indicator next to each account balance
- [ ] **Visual differentiation for cash vs investment accounts** - Different icons/colors for account types
- [ ] Account detail view with individual balance history chart
- [ ] Swipe actions on account cards (hide, favorite, etc.)
