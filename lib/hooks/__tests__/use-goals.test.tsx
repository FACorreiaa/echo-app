/**
 * Tests for goals-related hooks in use-goals.ts
 */

import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import {
  useGoals,
  useGoal,
  useGoalProgress,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useContributeToGoal,
} from "../use-goals";

// Mock the financeClient
jest.mock("@/lib/api/client", () => ({
  financeClient: {
    listGoals: jest.fn(),
    getGoal: jest.fn(),
    getGoalProgress: jest.fn(),
    createGoal: jest.fn(),
    updateGoal: jest.fn(),
    deleteGoal: jest.fn(),
    contributeToGoal: jest.fn(),
  },
}));

import { financeClient } from "@/lib/api/client";

const mockedFinanceClient = financeClient as jest.Mocked<typeof financeClient>;

// Test wrapper with fresh QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe("useGoals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches goals successfully", async () => {
    const mockGoals = [
      {
        id: "goal-1",
        name: "Emergency Fund",
        type: 1, // SAVE
        status: 1, // ACTIVE
        target: { amountMinor: BigInt(1000000), currencyCode: "EUR" }, // €10,000
        currentAmountMinor: BigInt(350000), // €3,500
        startAt: { seconds: BigInt(1704067200), nanos: 0 },
        endAt: { seconds: BigInt(1735689600), nanos: 0 },
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 35.0,
        pacePercent: 110.0,
        isBehindPace: false,
        paceMessage: "2 months ahead",
        daysRemaining: 365,
        amountNeededPerDay: { amountMinor: BigInt(1808), currencyCode: "EUR" },
      },
      {
        id: "goal-2",
        name: "New Laptop",
        type: 1, // SAVE
        status: 1, // ACTIVE
        target: { amountMinor: BigInt(250000), currencyCode: "EUR" }, // €2,500
        currentAmountMinor: BigInt(80000), // €800
        startAt: { seconds: BigInt(1704067200), nanos: 0 },
        endAt: { seconds: BigInt(1719792000), nanos: 0 },
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 32.0,
        pacePercent: 85.0,
        isBehindPace: true,
        paceMessage: "1 month behind",
        daysRemaining: 180,
        amountNeededPerDay: { amountMinor: BigInt(944), currencyCode: "EUR" },
      },
    ];

    mockedFinanceClient.listGoals.mockResolvedValueOnce({
      goals: mockGoals,
    });

    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].name).toBe("Emergency Fund");
    expect(result.current.data?.[0].target).toBe(10000);
    expect(result.current.data?.[0].current).toBe(3500);
    expect(result.current.data?.[0].type).toBe("save");
    expect(result.current.data?.[0].status).toBe("active");
    expect(result.current.data?.[0].progressPercent).toBe(35);
    expect(result.current.data?.[0].isBehindPace).toBe(false);
    expect(mockedFinanceClient.listGoals).toHaveBeenCalledWith({
      statusFilter: undefined,
    });
  });

  it("filters goals by status", async () => {
    mockedFinanceClient.listGoals.mockResolvedValueOnce({
      goals: [],
    });

    const { result } = renderHook(() => useGoals("completed"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedFinanceClient.listGoals).toHaveBeenCalledWith({
      statusFilter: 3, // GOAL_STATUS_COMPLETED
    });
  });

  it("returns empty array when no goals", async () => {
    mockedFinanceClient.listGoals.mockResolvedValueOnce({
      goals: [],
    });

    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(0);
  });

  it("handles fetch error", async () => {
    mockedFinanceClient.listGoals.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe("useGoal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches a single goal by ID", async () => {
    const mockGoal = {
      id: "goal-1",
      name: "Vacation Fund",
      type: 1, // SAVE
      status: 1, // ACTIVE
      target: { amountMinor: BigInt(300000), currencyCode: "EUR" },
      currentAmountMinor: BigInt(120000),
      startAt: { seconds: BigInt(1704067200), nanos: 0 },
      endAt: { seconds: BigInt(1722470400), nanos: 0 },
      createdAt: { seconds: BigInt(1704067200), nanos: 0 },
      updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
      progressPercent: 40.0,
      pacePercent: 100.0,
      isBehindPace: false,
      paceMessage: "On track",
      daysRemaining: 210,
      amountNeededPerDay: { amountMinor: BigInt(857), currencyCode: "EUR" },
    };

    mockedFinanceClient.getGoal.mockResolvedValueOnce({
      goal: mockGoal,
    });

    const { result } = renderHook(() => useGoal("goal-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe("Vacation Fund");
    expect(result.current.data?.target).toBe(3000);
    expect(result.current.data?.current).toBe(1200);
    expect(mockedFinanceClient.getGoal).toHaveBeenCalledWith({ goalId: "goal-1" });
  });

  it("handles goal not found error", async () => {
    mockedFinanceClient.getGoal.mockResolvedValueOnce({});

    const { result } = renderHook(() => useGoal("nonexistent"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useGoalProgress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches goal progress with milestones and contributions", async () => {
    const mockProgress = {
      goal: {
        id: "goal-1",
        name: "Emergency Fund",
        type: 1,
        status: 1,
        target: { amountMinor: BigInt(1000000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(550000),
        startAt: { seconds: BigInt(1704067200), nanos: 0 },
        endAt: { seconds: BigInt(1735689600), nanos: 0 },
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 55.0,
        pacePercent: 105.0,
        isBehindPace: false,
        paceMessage: "Slightly ahead",
        daysRemaining: 300,
        amountNeededPerDay: { amountMinor: BigInt(1500), currencyCode: "EUR" },
      },
      milestones: [
        { percent: 25, reached: true, reachedAt: { seconds: BigInt(1709251200), nanos: 0 } },
        { percent: 50, reached: true, reachedAt: { seconds: BigInt(1714435200), nanos: 0 } },
        { percent: 75, reached: false, expectedBy: { seconds: BigInt(1725148800), nanos: 0 } },
        { percent: 100, reached: false, expectedBy: { seconds: BigInt(1735689600), nanos: 0 } },
      ],
      recentContributions: [
        {
          id: "contrib-1",
          amount: { amountMinor: BigInt(50000), currencyCode: "EUR" },
          contributedAt: { seconds: BigInt(1720137600), nanos: 0 },
          note: "Monthly savings",
        },
        {
          id: "contrib-2",
          amount: { amountMinor: BigInt(20000), currencyCode: "EUR" },
          contributedAt: { seconds: BigInt(1717459200), nanos: 0 },
        },
      ],
      needsAttention: false,
      nudgeMessage: "Great progress! Keep it up!",
      suggestedContribution: { amountMinor: BigInt(15000), currencyCode: "EUR" },
    };

    mockedFinanceClient.getGoalProgress.mockResolvedValueOnce(mockProgress);

    const { result } = renderHook(() => useGoalProgress("goal-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.goal.name).toBe("Emergency Fund");
    expect(result.current.data?.milestones).toHaveLength(4);
    expect(result.current.data?.milestones[0].reached).toBe(true);
    expect(result.current.data?.milestones[1].reached).toBe(true);
    expect(result.current.data?.milestones[2].reached).toBe(false);
    expect(result.current.data?.recentContributions).toHaveLength(2);
    expect(result.current.data?.recentContributions[0].amount).toBe(500);
    expect(result.current.data?.recentContributions[0].note).toBe("Monthly savings");
    expect(result.current.data?.needsAttention).toBe(false);
    expect(result.current.data?.nudgeMessage).toBe("Great progress! Keep it up!");
    expect(result.current.data?.suggestedContribution).toBe(150);
  });

  it("handles empty contributions and milestones", async () => {
    const mockProgress = {
      goal: {
        id: "goal-1",
        name: "New Goal",
        type: 1,
        status: 1,
        target: { amountMinor: BigInt(500000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(0),
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 0,
        pacePercent: 0,
        isBehindPace: true,
        paceMessage: "Just started",
        daysRemaining: 365,
        amountNeededPerDay: { amountMinor: BigInt(1370), currencyCode: "EUR" },
      },
      milestones: [],
      recentContributions: [],
      needsAttention: true,
      nudgeMessage: "Start contributing to reach your goal!",
      suggestedContribution: { amountMinor: BigInt(10000), currencyCode: "EUR" },
    };

    mockedFinanceClient.getGoalProgress.mockResolvedValueOnce(mockProgress);

    const { result } = renderHook(() => useGoalProgress("goal-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.milestones).toHaveLength(0);
    expect(result.current.data?.recentContributions).toHaveLength(0);
    expect(result.current.data?.needsAttention).toBe(true);
  });
});

describe("useCreateGoal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a goal successfully", async () => {
    const newGoal = {
      id: "goal-new",
      name: "New Car",
      type: 1,
      status: 1,
      target: { amountMinor: BigInt(2000000), currencyCode: "EUR" },
      currentAmountMinor: BigInt(0),
      startAt: { seconds: BigInt(1704067200), nanos: 0 },
      endAt: { seconds: BigInt(1767139200), nanos: 0 },
      createdAt: { seconds: BigInt(1704067200), nanos: 0 },
      updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
      progressPercent: 0,
      pacePercent: 0,
      isBehindPace: false,
      paceMessage: "Just started",
      daysRemaining: 730,
      amountNeededPerDay: { amountMinor: BigInt(2740), currencyCode: "EUR" },
    };

    mockedFinanceClient.createGoal.mockResolvedValueOnce({
      goal: newGoal,
    });

    const { result } = renderHook(() => useCreateGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: "New Car",
      type: "save",
      target: 20000,
      startAt: new Date("2024-01-01"),
      endAt: new Date("2026-01-01"),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe("New Car");
    expect(result.current.data?.target).toBe(20000);
    expect(mockedFinanceClient.createGoal).toHaveBeenCalledWith({
      name: "New Car",
      type: 1, // SAVE
      target: {
        amountMinor: BigInt(2000000),
        currencyCode: "EUR",
      },
      startAt: expect.anything(),
      endAt: expect.anything(),
    });
  });

  it("handles creation error", async () => {
    mockedFinanceClient.createGoal.mockRejectedValueOnce(new Error("Invalid target amount"));

    const { result } = renderHook(() => useCreateGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ name: "Test Goal", type: "save", target: -100 });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useUpdateGoal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates a goal successfully", async () => {
    const updatedGoal = {
      id: "goal-1",
      name: "Updated Emergency Fund",
      type: 1,
      status: 1,
      target: { amountMinor: BigInt(1200000), currencyCode: "EUR" },
      currentAmountMinor: BigInt(350000),
      createdAt: { seconds: BigInt(1704067200), nanos: 0 },
      updatedAt: { seconds: BigInt(1720137600), nanos: 0 },
      progressPercent: 29.17,
      pacePercent: 105.0,
      isBehindPace: false,
      paceMessage: "On track",
      daysRemaining: 365,
      amountNeededPerDay: { amountMinor: BigInt(2329), currencyCode: "EUR" },
    };

    mockedFinanceClient.updateGoal.mockResolvedValueOnce({
      goal: updatedGoal,
    });

    const { result } = renderHook(() => useUpdateGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      goalId: "goal-1",
      name: "Updated Emergency Fund",
      target: 12000,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe("Updated Emergency Fund");
    expect(result.current.data?.target).toBe(12000);
    expect(mockedFinanceClient.updateGoal).toHaveBeenCalledWith({
      goalId: "goal-1",
      name: "Updated Emergency Fund",
      target: {
        amountMinor: BigInt(1200000),
        currencyCode: "EUR",
      },
      endAt: undefined,
      status: undefined,
    });
  });

  it("updates only specific fields", async () => {
    const updatedGoal = {
      id: "goal-1",
      name: "Emergency Fund",
      type: 1,
      status: 2, // PAUSED
      target: { amountMinor: BigInt(1000000), currencyCode: "EUR" },
      currentAmountMinor: BigInt(350000),
      createdAt: { seconds: BigInt(1704067200), nanos: 0 },
      updatedAt: { seconds: BigInt(1720137600), nanos: 0 },
      progressPercent: 35.0,
      pacePercent: 0,
      isBehindPace: false,
      paceMessage: "Paused",
      daysRemaining: 365,
      amountNeededPerDay: { amountMinor: BigInt(0), currencyCode: "EUR" },
    };

    mockedFinanceClient.updateGoal.mockResolvedValueOnce({
      goal: updatedGoal,
    });

    const { result } = renderHook(() => useUpdateGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      goalId: "goal-1",
      status: "paused",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.status).toBe("paused");
    expect(mockedFinanceClient.updateGoal).toHaveBeenCalledWith({
      goalId: "goal-1",
      name: undefined,
      target: undefined,
      endAt: undefined,
      status: 2, // PAUSED
    });
  });
});

describe("useDeleteGoal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes a goal successfully", async () => {
    mockedFinanceClient.deleteGoal.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeleteGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("goal-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedFinanceClient.deleteGoal).toHaveBeenCalledWith({
      goalId: "goal-1",
    });
  });

  it("handles delete error", async () => {
    mockedFinanceClient.deleteGoal.mockRejectedValueOnce(new Error("Goal not found"));

    const { result } = renderHook(() => useDeleteGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("nonexistent");

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useContributeToGoal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("contributes to a goal successfully", async () => {
    const mockResponse = {
      goal: {
        id: "goal-1",
        name: "Emergency Fund",
        type: 1,
        status: 1,
        target: { amountMinor: BigInt(1000000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(550000), // Was 350000, added 200000
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1720137600), nanos: 0 },
        progressPercent: 55.0,
        pacePercent: 110.0,
        isBehindPace: false,
        paceMessage: "Ahead of schedule",
        daysRemaining: 300,
        amountNeededPerDay: { amountMinor: BigInt(1500), currencyCode: "EUR" },
      },
      contribution: {
        id: "contrib-new",
        amount: { amountMinor: BigInt(200000), currencyCode: "EUR" },
        contributedAt: { seconds: BigInt(1720137600), nanos: 0 },
        note: "Bonus money",
      },
      milestoneReached: true,
      milestonePercent: 50,
      feedbackMessage: "Great job! You're 50% there!",
    };

    mockedFinanceClient.contributeToGoal.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useContributeToGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      goalId: "goal-1",
      amount: 2000,
      note: "Bonus money",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.goal.current).toBe(5500);
    expect(result.current.data?.contribution.amount).toBe(2000);
    expect(result.current.data?.contribution.note).toBe("Bonus money");
    expect(result.current.data?.milestoneReached).toBe(true);
    expect(result.current.data?.milestonePercent).toBe(50);
    expect(result.current.data?.feedbackMessage).toBe("Great job! You're 50% there!");
    expect(mockedFinanceClient.contributeToGoal).toHaveBeenCalledWith({
      goalId: "goal-1",
      amount: {
        amountMinor: BigInt(200000),
        currencyCode: "EUR",
      },
      note: "Bonus money",
    });
  });

  it("contributes without note", async () => {
    const mockResponse = {
      goal: {
        id: "goal-1",
        name: "Emergency Fund",
        type: 1,
        status: 1,
        target: { amountMinor: BigInt(1000000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(400000),
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1720137600), nanos: 0 },
        progressPercent: 40.0,
        pacePercent: 100.0,
        isBehindPace: false,
        paceMessage: "On track",
        daysRemaining: 365,
        amountNeededPerDay: { amountMinor: BigInt(1644), currencyCode: "EUR" },
      },
      contribution: {
        id: "contrib-new",
        amount: { amountMinor: BigInt(50000), currencyCode: "EUR" },
        contributedAt: { seconds: BigInt(1720137600), nanos: 0 },
      },
      milestoneReached: false,
      feedbackMessage: "Keep going!",
    };

    mockedFinanceClient.contributeToGoal.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useContributeToGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      goalId: "goal-1",
      amount: 500,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.contribution.note).toBeUndefined();
    expect(result.current.data?.milestoneReached).toBe(false);
  });

  it("handles contribution error", async () => {
    mockedFinanceClient.contributeToGoal.mockRejectedValueOnce(new Error("Invalid amount"));

    const { result } = renderHook(() => useContributeToGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      goalId: "goal-1",
      amount: -100,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("Type conversions", () => {
  it("correctly converts goal types", async () => {
    const mockGoals = [
      {
        id: "goal-1",
        name: "Savings Goal",
        type: 1, // SAVE
        status: 1,
        target: { amountMinor: BigInt(100000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(0),
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 0,
        pacePercent: 0,
        isBehindPace: false,
        paceMessage: "",
        daysRemaining: 365,
        amountNeededPerDay: { amountMinor: BigInt(0), currencyCode: "EUR" },
      },
      {
        id: "goal-2",
        name: "Pay Down Debt",
        type: 2, // PAY_DOWN_DEBT
        status: 1,
        target: { amountMinor: BigInt(100000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(0),
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 0,
        pacePercent: 0,
        isBehindPace: false,
        paceMessage: "",
        daysRemaining: 365,
        amountNeededPerDay: { amountMinor: BigInt(0), currencyCode: "EUR" },
      },
      {
        id: "goal-3",
        name: "Spend Cap",
        type: 3, // SPEND_CAP
        status: 1,
        target: { amountMinor: BigInt(100000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(0),
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 0,
        pacePercent: 0,
        isBehindPace: false,
        paceMessage: "",
        daysRemaining: 365,
        amountNeededPerDay: { amountMinor: BigInt(0), currencyCode: "EUR" },
      },
    ];

    mockedFinanceClient.listGoals.mockResolvedValueOnce({
      goals: mockGoals,
    });

    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0].type).toBe("save");
    expect(result.current.data?.[1].type).toBe("pay_down_debt");
    expect(result.current.data?.[2].type).toBe("spend_cap");
  });

  it("correctly converts goal statuses", async () => {
    const mockGoals = [
      {
        id: "goal-1",
        name: "Active Goal",
        type: 1,
        status: 1, // ACTIVE
        target: { amountMinor: BigInt(100000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(0),
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 0,
        pacePercent: 0,
        isBehindPace: false,
        paceMessage: "",
        daysRemaining: 365,
        amountNeededPerDay: { amountMinor: BigInt(0), currencyCode: "EUR" },
      },
      {
        id: "goal-2",
        name: "Paused Goal",
        type: 1,
        status: 2, // PAUSED
        target: { amountMinor: BigInt(100000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(0),
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 0,
        pacePercent: 0,
        isBehindPace: false,
        paceMessage: "",
        daysRemaining: 365,
        amountNeededPerDay: { amountMinor: BigInt(0), currencyCode: "EUR" },
      },
      {
        id: "goal-3",
        name: "Completed Goal",
        type: 1,
        status: 3, // COMPLETED
        target: { amountMinor: BigInt(100000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(100000),
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 100,
        pacePercent: 100,
        isBehindPace: false,
        paceMessage: "",
        daysRemaining: 0,
        amountNeededPerDay: { amountMinor: BigInt(0), currencyCode: "EUR" },
      },
      {
        id: "goal-4",
        name: "Archived Goal",
        type: 1,
        status: 4, // ARCHIVED
        target: { amountMinor: BigInt(100000), currencyCode: "EUR" },
        currentAmountMinor: BigInt(0),
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
        updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
        progressPercent: 0,
        pacePercent: 0,
        isBehindPace: false,
        paceMessage: "",
        daysRemaining: 0,
        amountNeededPerDay: { amountMinor: BigInt(0), currencyCode: "EUR" },
      },
    ];

    mockedFinanceClient.listGoals.mockResolvedValueOnce({
      goals: mockGoals,
    });

    const { result } = renderHook(() => useGoals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0].status).toBe("active");
    expect(result.current.data?.[1].status).toBe("paused");
    expect(result.current.data?.[2].status).toBe("completed");
    expect(result.current.data?.[3].status).toBe("archived");
  });

  it("correctly converts currency amounts", async () => {
    const mockGoal = {
      id: "goal-1",
      name: "Test Goal",
      type: 1,
      status: 1,
      target: { amountMinor: BigInt(123456), currencyCode: "EUR" }, // €1,234.56
      currentAmountMinor: BigInt(67890), // €678.90
      createdAt: { seconds: BigInt(1704067200), nanos: 0 },
      updatedAt: { seconds: BigInt(1704067200), nanos: 0 },
      progressPercent: 55.0,
      pacePercent: 100.0,
      isBehindPace: false,
      paceMessage: "On track",
      daysRemaining: 100,
      amountNeededPerDay: { amountMinor: BigInt(546), currencyCode: "EUR" }, // €5.46
    };

    mockedFinanceClient.getGoal.mockResolvedValueOnce({
      goal: mockGoal,
    });

    const { result } = renderHook(() => useGoal("goal-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.target).toBe(1234.56);
    expect(result.current.data?.current).toBe(678.9);
    expect(result.current.data?.amountNeededPerDay).toBe(5.46);
  });
});
