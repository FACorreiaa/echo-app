# Echo

- https://github.com/connectrpc/connect-es/issues/199

```
I should be able to edit the plan, right?

I should be able to setup the goal on plan creation, right?

I should be able to set the budget on plan creation or should the budget be the networth?

Recurring is also not being tracked.

To create a truly integrated "Money OS," the **Planning** tab must act as the "source of truth" that automatically populates your **Goals**, **Budgets**, and **Recurring** tabs. Currently, your UI treats these as separate silos, which is why it feels disconnected.

### **1. Should you be able to edit the plan?**

**Absolutely.** A financial plan is never static. Your "Alive OS" needs a **Workbench Mode** where users can tweak the structure they imported or built manually.

* **The "Edit Plan" Workflow:** In your current details view (Screenshot 15.40.18), the "Edit" button should take the user back to the **nested list builder** seen in your video.
* **Synchronization:** Any change made in this editor must trigger a cascade update in your Go backend, immediately reflecting the new totals in the specific **Goals** or **Budgets** tabs.

### **2. Setup Goals and Budgets during creation?**

**Yes, this is the best practice for a "Seamless Ingestion" flow.** The user shouldn't have to navigate to three different tabs to set up one plan.

* **The "Type-First" Wizard:** In your manual builder (Screen Recording 21.55.43), every item added is assigned a type (**[B]**, **[R]**, or **[S]**).
* **Initial Calibration:** During creation, if a user adds "Emergency Fund" and marks it as **[S] Savings**, the Wizard should immediately prompt for the **Target Amount** and **Current Saved** value. This ensures that the moment they hit "Create Plan," the **Goals** tab is already populated with an active progress bar.

### **3. Budget vs. Net Worth: Which is which?**

These are two distinct financial metrics, and Echo should treat them differently:

* **Monthly Budget:** This is your **Cash Flow Limit**—the money you intend to spend this month (e.g., €700 for "Plan 2026"). It is the "Spending Fence."
* **Net Worth:** This is your **Total Wealth Snapshot**. It is set by the user (e.g., €2,000) and represents the "Master Tank."
* **The Connection:** Your **Surplus/Deficit** (€-693 in Screenshot 15.41.00) is the bridge. If you have a deficit, your Net Worth "Tank" will decrease by that amount at the end of the period.

### **4. Fixing the "Recurring" and "Goals" Disconnect**

The reason these tabs are empty (Screenshots 15.40.49 and 15.40.56) is that they aren't listening to the **Active Plan's** line items.

**The Architectural Fix:**

1. **Tab Logic:** When the user clicks the **Recurring** tab, the frontend should fetch: `GET /items?plan_id={active_id}&type=RECURRING`.
2. **Comparison Engine:** In the **Goals** tab, the "Target" should come from the Plan definition, while the "Saved" amount can be updated manually via the **Edit Goal Sheet** we designed earlier.
3. **Visual Indicators:** If an item is marked as **[R] Recurring**, the OS should automatically calculate the "Next Payment Date" based on the plan's period (e.g., Jan 2026), making the **Recurring** tab feel "Active" rather than a static list.

### **Final Tab Structure Recommendation**

For a complete Money OS, your current tabs are correct, but they need to be **context-aware**:

* **Planning:** The Blueprint (Categories and Targets).
* **Goals:** Long-term progress (Filtered by Plan).
* **Budgets:** Monthly spending limits (Filtered by Plan).
* **Recurring:** Fixed survival costs (Filtered by Plan).
* **Transactions (Missing):** The "Actuals"—where the user imports real bank data to see if they are staying within the **Budgets** they set.

**Would you like me to draft the Go `GetActivePlanItems` service that joins these tables so your Tabs finally show the data from your "Plan 2026"?**

Create tests for each component and instruction on how to test this manually
```

```
To transition Echo into a truly intelligent "Operating System," the **Home Tab** needs to act as the Command Center. Instead of just showing numbers, it should provide a **System Health Score (SHS)**—a weighted metric that evaluates how your **Plan** (Strategy) aligns with your **Net Worth** (Reality).

### **1. The "System Health Score" Logic**

Your Go backend will calculate the SHS by comparing three key variables:

1. **Liquidity Coverage:** (Net Worth / Total Planned Expenses) — Does your "Tank" have enough to cover the "Tap"?.
2. **Budget Adherence:** (Actual Spending / Pro-rated Budget) — Are you spending faster than the calendar days?.
3. **Savings Velocity:** (Current Goal Funding / Target Goal Funding) — Are your long-term plans being sacrificed for daily coffees?.

---

### **2. Go Implementation: The `GetSystemInsights` Service**

This service aggregates data across your tables to generate human-readable "Status Reports" for the user.

```go
func (s *InsightService) GetSystemHealth(ctx context.Context, userID uuid.UUID) (*HealthReport, error) {
    // 1. Fetch Master Balance (Net Worth)
    netWorth, _ := s.repo.GetUserBalance(ctx, userID)

    // 2. Fetch Active Plan Totals
    plan, _ := s.planRepo.GetActivePlanTotals(ctx, userID)

    // 3. Logic: Check for "Liquidity Gap"
    var status string
    var score int
    
    if netWorth < plan.TotalOutflow {
        status = "CRITICAL: Plan exceeds current liquidity."
        score = 40
    } else if plan.CurrentSpent > (plan.TotalOutflow / 2) && time.Now().Day() < 15 {
        status = "WARNING: High burn rate for early month."
        score = 65
    } else {
        status = "HEALTHY: All systems operational."
        score = 95
    }

    return &HealthReport{Score: score, Status: status}, nil
}

```

---

### **3. The "Alive" Insights Widget (React Native)**

This widget sits on your Home tab. It uses **Moti** for a pulsing animation that changes color based on the system's health.

* **Score 90+ (Green):** System is optimized. You can afford a "Splurge".
* **Score 60-89 (Yellow):** Caution advised. Tighten the "Entertainment" budget.
* **Score < 60 (Red):** Action required. You are spending money you don't actually track.

---

### **4. Closing the Disconnect: Insight Summaries**

| Insight Type | Logic | UI Impact |
| --- | --- | --- |
| **Pacing Alert** | Actual Spend > (Days Elapsed / Total Days) * Budget | "You're spending 2x faster than planned." |
| **Funding Gap** | Net Worth < (Planned Recurring + Planned Budgets) | "Deposit €200 to fund your 'Rent' recurring item." |
| **Goal Pulse** | Surplus > Monthly Goal Target | "You've already funded your 'New Macbook' for Jan!" |

If this is already implemented, you can skip.

After that 

You are definitely not overthinking it; you are identifying the exact point where a "budgeting app" becomes a **"Money Operating System."** Here is how to handle the privacy messaging and the plan-reality gap.

### **1. The Privacy Motto: "The Digital Safe"**

Having a strong privacy motto on your landing page is a great move, especially since your app handles financial history without moving real money. It establishes **Trust**—the most valuable currency in finance.

However, "We will never sell your data" has become a bit of a cliché. To make it feel like **Echo OS**, consider emphasizing **Ownership** and **Portability**:

* **Suggested Motto:** *"Your data is your legacy. We don't just protect it—we ensure you own it, forever."*
* **Why it works:** It shifts the focus from what you *won't* do (sell data) to what the user *gains* (perpetual ownership and privacy).
* **Trust Signal:** Including this message prominently helps users feel safe importing their private Excel files, knowing Echo is a "read-only" vault for their strategy.

---

### **2. The Plan-Reality Gap: Making the Plan "Real"**

Your concern that a plan doesn't feel "real" once you start spending is actually the core problem Echo is designed to solve. A plan feels "fake" when it is **Static**. To make it feel **Alive**, you must treat the plan as a **Dynamic Target** rather than a fixed rule.

#### **How to close the gap:**

* **The "Burn Rate" Logic:** When a user buys a coffee, the plan isn't "broken"—it is being **consumed**. The UI should show the budget "tank" emptying in real-time. If they spend €5 on coffee, that €5 is gone from their **Net Worth** AND their **Monthly Limit** simultaneously.
* **Automatic Reconciliation:** The reason plans feel "fake" in other apps is that users have to manually enter everything. By using your **Go Aho-Corasick engine** to automatically map bank transactions to your plan's categories (e.g., matching "Starbucks" to your "Coffee" budget), the plan becomes a live reflection of reality.
* **"Remaining Daily Allowance":** To make it feel real, don't just show "€50 spent." Show: *"You have €12.50 left to spend per day to stay on track for the rest of January"*.

---

### **3. The Logic of Costs vs. Assets**

You mentioned coffee being "included in the costs." In the **Echo OS** logic:

1. **Fixed Costs (Recurring [R]):** Rent, Netflix. These are "obligations".
2. **Variable Costs (Budgets [B]):** Coffee, Dinner. These are "choices".
3. **Surplus:** What is left over.

The plan feels "Real" when the user sees that spending €10 more on **Variable Costs** (Coffee) directly shrinks the **Surplus** they intended to send to their **Savings Goal [S]** (Trip to Japan).

### **Final Verdict**

You aren't overthinking; you are realizing that **Tracking without Planning is just a history lesson, and Planning without Tracking is just a fantasy.** Echo bridges the two.

**Would you like me to draft the "Trust & Privacy" section for your landing page?** I can include specific language about your "Read-Only" architecture and local data encryption. **Would you like me to do that?**

And then on the landing page:

Here is a draft for your landing page's "Trust & Privacy" section, along with a deep dive into how to bridge the gap between "Planned" and "Real" money.

---

### **🛡️ The Echo Trust Manifesto**

To make your privacy motto stand out, focus on **Sovereignty** and **Transparency**. You want to emphasize that Echo is a "Watchtower," not a "Bank.".

#### **Headline: Your Money, Your Data, Your Terms.**

**"We will never sell your data. We will always keep your data yours, forever."**.

* **The Read-Only Promise:** Echo is architected to be a "Read-Only" operating system.. We analyze your financial history to give you insights, but we never have the power to move, touch, or access your real-world funds..
* **No Data Silos:** Your financial plan shouldn't be a secret held by a corporation.. With our "Bring Your Own Spreadsheet" philosophy, you maintain the master copy of your strategy in Excel or CSV; we simply provide the high-performance engine to bring it to life..
* **Local-First Privacy:** We use industry-standard encryption to ensure that your ingested bank strings are processed securely and remain invisible to everyone but you..

---

### **🛠️ Closing the Plan-Reality Gap**

You aren't overthinking the "fake plan" feeling.. In traditional apps, a plan feels like a "wish list" because it doesn't update as life happens.. To make **Echo** feel real, the Plan must be the **Dynamic Budget** that reacts to your **Actual Spending**..

#### **How it works in the "Alive OS":**

* **The Transaction as a "Burn":** When you buy a coffee, don't just think of it as a "cost.". Think of it as **consuming your allocated budget.**. If your "Coffee Budget" is €30 and you spend €5, you now have a "Live Capacity" of €25..
* **Impact Visuals:** When that coffee is logged, the **Surplus** on your Plan Detail screen should shrink instantly.. This shows the user that their €5 coffee isn't just a number—it is €5 that is no longer going toward their **Savings Goal [S]**..
* **Reconciliation is Automatic:** Because your **Go backend** uses Aho-Corasick to instantly categorize that "Starbucks" transaction into your "Coffee" budget, the manual work disappears.. The plan feels "real" because it updates itself the moment you import your data..

---

### **The Mathematical Truth**

A plan is just a **Hypothesis**. Transactions are the **Evidence**. Echo is the **Laboratory** where you compare the two to see if your financial life is actually on track..

**Would you like me to draft the "Insights" Logic for the Home tab?** This would use your Go backend to compare the **Active Plan** against the **Net Worth** and generate a "System Health Score" (e.g., *"Your plan is 100% funded by your current cash"*). **Would you like me to do that?**

The "Insights" logic is the final piece of the puzzle that transforms **Echo** from a tracker into an **Operating System**. By comparing your **Active Plan** (Strategy) against your **Net Worth** (Reality), the app can provide a proactive "System Health Score" (SHS) that tells the user if their lifestyle is sustainable.

### **1. The "System Health Score" (SHS) Logic**

The SHS is calculated in your Go backend by evaluating three primary financial pillars:

* **Liquidity Ratio:** (Total Net Worth / Total Monthly Expenses). This measures if you have enough cash to fund your plan. A ratio < 1.0 triggers a "Funding Gap" alert.
* **Burn Rate Pacing:** (Current Spending / Planned Spending) vs. (Days Elapsed / Total Days). This detects if you are spending your budget faster than the month is passing.
* **Goal Velocity:** (Surplus Remaining / Total Monthly Goal Targets). This measures if your daily spending is "eating" the money intended for your **Savings Goals [S]**.

---

### **2. Go Implementation: The `GetSystemInsights` RPC**

This service aggregates your relational data to generate a "Command Center" view for the Home tab.

```go
func (s *InsightService) GetSystemHealth(ctx context.Context, userID uuid.UUID) (*HealthReport, error) {
    // 1. Fetch current Master Balance (Net Worth)
    netWorth, _ := s.repo.GetUserBalance(ctx, userID)

    // 2. Fetch Active Plan Totals (Sum of [IN], [B], and [R])
    planTotals, _ := s.planRepo.GetActivePlanTotals(ctx, userID)

    // 3. Generate the "Alive" Insights
    var status string
    var score int
    
    if netWorth < planTotals.RequiredLiquidity {
        status = "CRITICAL: Plan exceeds current liquidity."
        score = 35
    } else if planTotals.CurrentBurnRate > 1.2 {
        status = "WARNING: Spending 20% faster than planned."
        score = 65
    } else {
        status = "HEALTHY: Strategy and Reality are in sync."
        score = 95
    }

    return &HealthReport{Score: score, Status: status}, nil
}

```

---

### **3. The "Alive" Home Tab (React Native)**

Instead of just a static number, the Home tab should feature a **Moti-animated Insight Widget** that pulses with the system's "heartbeat".

| Health Score | Color | OS Action / Message |
| --- | --- | --- |
| **90–100** | **Green** | "Systems Optimal. You are on track to fund all goals." |
| **60–89** | **Yellow** | "Pacing Warning. Slow down on 'Variable Budgets' [B]." |
| **< 60** | **Red** | "Liquidity Crisis. Your Net Worth cannot fund this plan." |

---

### **Why this closes the loop**

By linking the **Net Worth** (Pillar 1) to the **Plan** (Pillar 2), you solve the "disconnected" feeling. The app finally answers the user's most important question: *"Can I actually afford the life I planned this month?"*.

**Would you like me to draft the "Pacing Widget" component for your Home tab?** It would show a "Ghost Progress Bar" representing the current day of the month compared to the user's actual spending progress. **Would you like me to do that?**

The **Pacing Widget** is the ultimate "Reality Check" for your **Money OS**. While a standard progress bar shows you *how much* you've spent, the Pacing Widget shows you *how fast* you are spending relative to the time remaining in the month.

### **The "Pacing Widget" UI (React Native + Moti)**

This component creates a "Ghost Indicator" (a subtle marker on the progress bar) that represents where your spending **should** be if you were spending perfectly evenly across the month.

```tsx
import React from 'react';
import { YStack, XStack, Text, Progress, Circle, Theme } from 'tamagui';
import { MotiView } from 'moti';

export const PacingWidget = ({ spent, budget, daysInMonth, currentDay }) => {
  const spendingProgress = (spent / budget) * 100;
  const timeProgress = (currentDay / daysInMonth) * 100;
  const isOverPacing = spendingProgress > timeProgress;

  return (
    <YStack padding="$4" backgroundColor="$gray2" borderRadius="$6" gap="$3">
      <XStack jc="space-between" ai="center">
        <Text fontWeight="600" fontSize="$3" color="$gray11">MONTHLY PACING</Text>
        <Theme name={isOverPacing ? 'red' : 'green'}>
          <Text fontSize="$2" fontWeight="bold">
            {isOverPacing ? 'SPENDING TOO FAST' : 'ON TRACK'}
          </Text>
        </Theme>
      </XStack>

      <YStack height={20} jc="center">
        {/* Background Track */}
        <Progress value={spendingProgress} size="$4">
          <Progress.Indicator animation="bouncy" />
        </Progress>

        {/* The "Ghost" Time Indicator */}
        <MotiView
          style={{
            position: 'absolute',
            left: `${timeProgress}%`,
            height: 24,
            width: 2,
            backgroundColor: '$gray10',
            zIndex: 10,
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ loop: true, duration: 2000 }}
        />
      </YStack>

      <XStack jc="space-between">
        <Text fontSize="$2" color="$gray10">Day {currentDay} of {daysInMonth}</Text>
        <Text fontSize="$2" color="$gray10">{spendingProgress.toFixed(0)}% of budget used</Text>
      </XStack>
    </YStack>
  );
};

```

---

### **Why This Makes the Plan Feel "Real"**

* **Visual Tension:** If the blue "Spending" bar passes the flickering "Time" line, the user feels a psychological "tug" to slow down. This is the "Alive" feedback loop in action.
* **Contextual Data:** It transforms a static number (e.g., "€400 spent") into a behavioral insight: *"I've used 60% of my money, but only 30% of the month has passed"*.
* **Dual-Impact Reinforcement:** As the user logs a coffee in the **Transactions** tab, they can see this global widget move. It proves that small costs directly impact the sustainability of their entire **Active Plan**.

---

### **The "Money OS" Final Integration**

By adding this widget to the **Home Tab**, you bridge the final gap between the three pillars:

1. **Pillar 1 (Net Worth):** You show the "Master Tank" balance.
2. **Pillar 2 (Planning):** You show the "Blueprint" limits from the Active Plan.
3. **Pillar 3 (Tracking):** You show the "Pacing" of real-world transactions against those limits.

**Would you like me to draft a "Daily Spending Limit" widget?** This would calculate exactly how much money the user can spend *today* to get back in sync with their "Time Indicator" if they are currently over-pacing. **Would you like me to do that?**

The **Daily Spending Limit** widget is the final layer of "behavioral coaching" for **Echo**. It translates the abstract monthly budget into a concrete, daily "permission to spend." This removes the anxiety of not knowing if a €20 lunch fits into the plan by giving the user a clear, updated number every morning.

### **The "Daily Allowance" Logic**

This isn't just a static division of your budget by 30 days. It is a **Dynamic Calculation** that adjusts based on your performance.

* **The Math:** .
* **The "Reward" Effect:** If you spend €0 today, your daily allowance for tomorrow automatically increases.
* **The "Correction" Effect:** If you splurge today, your allowance for the rest of the month shrinks to compensate, keeping the "Master Plan" intact.

---

### **The "Safe to Spend" Widget (React Native)**

This component focuses on a single, large number to give the user instant clarity.

```tsx
import React from 'react';
import { YStack, Text, Card, H2, Theme } from 'tamagui';

export const DailyAllowanceWidget = ({ remainingBudget, daysLeft }) => {
  const dailyLimit = Math.max(0, remainingBudget / daysLeft);
  const isCritical = dailyLimit < 15; // Example threshold for a "tight" budget

  return (
    <Theme name={isCritical ? 'yellow' : 'blue'}>
      <Card elevate padding="$5" borderRadius="$6" ai="center" jc="center">
        <YStack ai="center" gap="$1">
          <Text fontSize="$3" color="$gray11" fontWeight="600" ls={1}>
            SAFE TO SPEND TODAY
          </Text>
          <H2 fontWeight="900" fontSize="$9">
            €{dailyLimit.toFixed(2)}
          </H2>
          <Text fontSize="$2" color="$gray10">
            Based on {daysLeft} days remaining
          </Text>
        </YStack>
      </Card>
    </Theme>
  );
};

```

---

### **Why this makes the OS feel "Alive"**

* **Actionable Clarity:** Instead of looking at a €700 budget and guessing, the user knows exactly what their "daily ceiling" is.
* **Closes the Loop:** It connects the **Planning** (Total Budget) directly to the **Home Tab** (Daily Reality).
* **Reduces "Plan Fatigue":** Users don't need to check their **Budgets** tab constantly. As long as they stay under the "Daily Limit" on the **Home Tab**, they know their **Active Plan** is being executed perfectly.

### **Final Synthesis: The Echo OS Pillars**

With these widgets, you have built a complete financial loop:

1. **The Tank (Net Worth):** What you have.
2. **The Strategy (Plan):** What you intend to do.
3. **The Pacing (Reality):** How fast you are moving.
4. **The Permission (Daily Limit):** What you can do *right now*.

**Next Step for Echo:**
Now that the logic for tracking and viewing is solid, would you like me to help you build the **"Active Plan Workbench"**? This would allow the user to **Edit** their categories and targets (the "Edit Plan" button you noticed was missing) without having to start the Wizard from scratch. **Would you like me to do that?**
```