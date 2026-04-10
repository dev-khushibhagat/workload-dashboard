import { useState, useMemo } from "react";
import "@/App.css";
import { Users, Lightbulb, RefreshCw, TrendingUp, AlertTriangle, TrendingDown, Activity, CheckCircle, XCircle, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ========================================
// PRESET SCENARIOS
// ========================================

const presetScenarios = {
  underutilized: {
    employees: [
      { id: "emp1", name: "Sarah Chen", workHours: 2, capacity: 8 },
      { id: "emp2", name: "Marcus Johnson", workHours: 3, capacity: 8 },
      { id: "emp3", name: "Emily Rodriguez", workHours: 4, capacity: 8 },
      { id: "emp4", name: "David Park", workHours: 3.5, capacity: 8 },
      { id: "emp5", name: "Aisha Patel", workHours: 5, capacity: 8 },
      { id: "emp6", name: "James Thompson", workHours: 2.5, capacity: 8 },
      { id: "emp7", name: "Lisa Wong", workHours: 4, capacity: 8 },
    ],
    history: null,
  },
  balanced: {
    employees: [
      { id: "emp1", name: "Sarah Chen", workHours: 6, capacity: 8 },
      { id: "emp2", name: "Marcus Johnson", workHours: 7, capacity: 8 },
      { id: "emp3", name: "Emily Rodriguez", workHours: 8, capacity: 8 },
      { id: "emp4", name: "David Park", workHours: 7.5, capacity: 8 },
      { id: "emp5", name: "Aisha Patel", workHours: 8, capacity: 8 },
      { id: "emp6", name: "James Thompson", workHours: 6.5, capacity: 8 },
      { id: "emp7", name: "Lisa Wong", workHours: 7, capacity: 8 },
    ],
    history: null,
  },
  overutilized: {
    employees: [
      { id: "emp1", name: "Sarah Chen", workHours: 10, capacity: 8 },
      { id: "emp2", name: "Marcus Johnson", workHours: 12, capacity: 8 },
      { id: "emp3", name: "Emily Rodriguez", workHours: 14, capacity: 8 },
      { id: "emp4", name: "David Park", workHours: 16, capacity: 8 },
      { id: "emp5", name: "Aisha Patel", workHours: 11, capacity: 8 },
      { id: "emp6", name: "James Thompson", workHours: 13, capacity: 8 },
      { id: "emp7", name: "Lisa Wong", workHours: 15, capacity: 8 },
    ],
    history: null,
  },
  spike: {
    employees: [
      { id: "emp1", name: "Sarah Chen", workHours: 12, capacity: 8 },
      { id: "emp2", name: "Marcus Johnson", workHours: 14, capacity: 8 },
      { id: "emp3", name: "Emily Rodriguez", workHours: 13, capacity: 8 },
      { id: "emp4", name: "David Park", workHours: 11, capacity: 8 },
      { id: "emp5", name: "Aisha Patel", workHours: 15, capacity: 8 },
      { id: "emp6", name: "James Thompson", workHours: 12, capacity: 8 },
      { id: "emp7", name: "Lisa Wong", workHours: 14, capacity: 8 },
    ],
    history: {
      teamUtilization: [
        { day: "Day 1", utilization: 58 },
        { day: "Day 2", utilization: 61 },
        { day: "Day 3", utilization: 63 },
        { day: "Day 4", utilization: 65 },
        { day: "Day 5", utilization: 70 },
        { day: "Day 6", utilization: 95 },
        { day: "Day 7", utilization: 162.5 },
      ],
    },
  },
  skillMismatch: {
    employees: [
      { id: "emp1", name: "Rahul Kumar", workHours: 14, capacity: 8 },
      { id: "emp2", name: "Priya Singh", workHours: 0, capacity: 8 },
      { id: "emp3", name: "Alex Chen", workHours: 7, capacity: 8 },
      { id: "emp4", name: "Maria Garcia", workHours: 6, capacity: 8 },
      { id: "emp5", name: "John Smith", workHours: 8, capacity: 8 },
      { id: "emp6", name: "Nina Patel", workHours: 7.5, capacity: 8 },
      { id: "emp7", name: "Tom Wilson", workHours: 6.5, capacity: 8 },
    ],
    history: {
      employeeComparison: [
        { day: "Day 1", rahul: 150, priya: 10 },
        { day: "Day 2", rahul: 160, priya: 12 },
        { day: "Day 3", rahul: 165, priya: 8 },
        { day: "Day 4", rahul: 170, priya: 15 },
        { day: "Day 5", rahul: 172, priya: 10 },
        { day: "Day 6", rahul: 175, priya: 5 },
        { day: "Day 7", rahul: 175, priya: 0 },
      ],
    },
  },
};

// Initial employees (mixed scenario)
const initialEmployees = [
  { id: "emp1", name: "Sarah Chen", workHours: 0, capacity: 8 },
  { id: "emp2", name: "Marcus Johnson", workHours: 3, capacity: 8 },
  { id: "emp3", name: "Emily Rodriguez", workHours: 6, capacity: 8 },
  { id: "emp4", name: "David Park", workHours: 7.5, capacity: 8 },
  { id: "emp5", name: "Aisha Patel", workHours: 8, capacity: 8 },
  { id: "emp6", name: "James Thompson", workHours: 12, capacity: 8 },
  { id: "emp7", name: "Lisa Wong", workHours: 16, capacity: 8 },
];

// ========================================
// UTILITY FUNCTIONS
// ========================================

const calculateUtilization = (workHours, capacity) => {
  return (workHours / capacity) * 100;
};

const getStatus = (utilization) => {
  if (utilization < 30) return "idle";
  if (utilization >= 30 && utilization < 70) return "underutilized";
  if (utilization >= 70 && utilization <= 100) return "balanced";
  return "overutilized";
};

const getStatusStyles = (status) => {
  const styles = {
    idle: "bg-yellow-50 text-yellow-700 border-yellow-200",
    underutilized: "bg-blue-50 text-blue-700 border-blue-200",
    balanced: "bg-emerald-50 text-emerald-700 border-emerald-200",
    overutilized: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return styles[status] || "";
};

const getProgressColor = (status) => {
  const colors = {
    idle: "bg-yellow-500",
    underutilized: "bg-blue-500",
    balanced: "bg-emerald-500",
    overutilized: "bg-rose-500",
  };
  return colors[status] || "";
};

// ========================================
// CASE DETECTION LOGIC
// ========================================

const detectCase = (employees, teamUtilization, history) => {
  // Calculate status counts
  const statusCounts = employees.reduce(
    (acc, emp) => {
      const utilization = calculateUtilization(emp.workHours, emp.capacity);
      const status = getStatus(utilization);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { idle: 0, underutilized: 0, balanced: 0, overutilized: 0 }
  );

  const totalEmployees = employees.length;

  // PRIORITY 1: EDGE CASES

  // Edge Case A: Spike
  if (history?.teamUtilization) {
    const firstDay = history.teamUtilization[0].utilization;
    const lastDay = history.teamUtilization[history.teamUtilization.length - 1].utilization;
    if (firstDay <= 70 && lastDay > 130) {
      const highestPerson = [...employees].sort((a, b) => calculateUtilization(b.workHours, b.capacity) - calculateUtilization(a.workHours, a.capacity))[0];
      const lowestPerson = [...employees].sort((a, b) => calculateUtilization(a.workHours, a.capacity) - calculateUtilization(b.workHours, b.capacity))[0];
      return {
        caseType: "edge_spike",
        insight: "Sudden surge in workload compared to previous days",
        action: "Investigate cause and redistribute workload or add temporary resources",
        icon: TrendingUp,
        showChart: true,
        chartType: "teamUtilization",
        chartData: history.teamUtilization,
      };
    }
  }

  // Edge Case B: Skill Mismatch
  if (history?.employeeComparison) {
    const overloadedPerson = employees.find(emp => emp.name === "Rahul Kumar");
    const idlePerson = employees.find(emp => emp.name === "Priya Singh");
    if (overloadedPerson && idlePerson) {
      const overloadedUtil = calculateUtilization(overloadedPerson.workHours, overloadedPerson.capacity);
      const idleUtil = calculateUtilization(idlePerson.workHours, idlePerson.capacity);
      if (overloadedUtil > 100 && idleUtil < 30) {
        return {
          caseType: "edge_skill_mismatch",
          insight: "Persistent imbalance suggests skill mismatch",
          action: `Reassign tasks based on skill or upskill ${idlePerson.name} (idle employee)`,
          icon: AlertTriangle,
          showChart: true,
          chartType: "employeeComparison",
          chartData: history.employeeComparison,
        };
      }
    }
  }

  // PRIORITY 2 & 3: TEAM CASES AND SUBCASES

  // Helper: Get highest and lowest utilization persons
  const getHighestUtilPerson = () => {
    return [...employees].sort((a, b) => calculateUtilization(b.workHours, b.capacity) - calculateUtilization(a.workHours, a.capacity))[0];
  };

  const getLowestUtilPerson = (preferredStatus = null) => {
    const filtered = preferredStatus
      ? employees.filter(emp => getStatus(calculateUtilization(emp.workHours, emp.capacity)) === preferredStatus)
      : employees;
    return [...filtered].sort((a, b) => calculateUtilization(a.workHours, a.capacity) - calculateUtilization(b.workHours, b.capacity))[0];
  };

  const calculateShiftHours = (fromPerson, toPerson) => {
    const fromUtil = calculateUtilization(fromPerson.workHours, fromPerson.capacity);
    const toUtil = calculateUtilization(toPerson.workHours, toPerson.capacity);
    const excess = fromPerson.workHours - fromPerson.capacity;
    const available = toPerson.capacity - toPerson.workHours;
    return Math.min(Math.max(1, Math.floor(Math.min(excess, available))), fromPerson.workHours);
  };

  // OVERUTILIZED TEAM (>100%)
  if (teamUtilization > 100) {
    // A. Each one overutilized
    if (statusCounts.overutilized === totalEmployees) {
      return {
        caseType: "team_overutilized_all",
        insight: "Entire team is overloaded",
        action: "Reduce workload or expand team capacity",
        icon: AlertTriangle,
      };
    }

    // B. Evenly overutilized (all overutilized or balanced, variance low)
    const allOverOrBalanced = statusCounts.overutilized + statusCounts.balanced === totalEmployees;
    if (allOverOrBalanced && statusCounts.balanced > 0) {
      return {
        caseType: "team_overutilized_even",
        insight: "Load is evenly distributed but exceeds capacity",
        action: "Reduce incoming work or increase bandwidth",
        icon: AlertTriangle,
      };
    }

    // E. Some overutilized, some idle (highest priority subcase)
    if (statusCounts.overutilized > 0 && statusCounts.idle > 0) {
      const fromPerson = getHighestUtilPerson();
      const toPerson = getLowestUtilPerson("idle");
      const hours = calculateShiftHours(fromPerson, toPerson);
      return {
        caseType: "team_overutilized_some_idle",
        insight: "Severe imbalance with idle capacity",
        action: `Shift ${hours} hours of work from ${fromPerson.name} to ${toPerson.name}`,
        icon: TrendingDown,
      };
    }

    // D. Some overutilized, some underutilized
    if (statusCounts.overutilized > 0 && statusCounts.underutilized > 0) {
      const fromPerson = getHighestUtilPerson();
      const toPerson = getLowestUtilPerson("underutilized");
      const hours = calculateShiftHours(fromPerson, toPerson);
      return {
        caseType: "team_overutilized_some_under",
        insight: "Uneven workload distribution",
        action: `Shift ${hours} hours of work from ${fromPerson.name} to ${toPerson.name}`,
        icon: TrendingDown,
      };
    }

    // C. Some overutilized, some balanced
    if (statusCounts.overutilized > 0 && statusCounts.balanced > 0) {
      const fromPerson = getHighestUtilPerson();
      const balancedPersons = employees.filter(emp => getStatus(calculateUtilization(emp.workHours, emp.capacity)) === "balanced");
      const toPerson = [...balancedPersons].sort((a, b) => calculateUtilization(a.workHours, a.capacity) - calculateUtilization(b.workHours, b.capacity))[0];
      const hours = calculateShiftHours(fromPerson, toPerson);
      return {
        caseType: "team_overutilized_some_balanced",
        insight: "Partial overload within team",
        action: `Shift ${hours} hours of work from ${fromPerson.name} to ${toPerson.name}`,
        icon: TrendingDown,
      };
    }
  }

  // UNDERUTILIZED TEAM (<70%)
  if (teamUtilization < 70) {
    // D. Each one idle
    if (statusCounts.idle === totalEmployees) {
      return {
        caseType: "team_underutilized_all_idle",
        insight: "Team is completely idle",
        action: "Assign new work immediately",
        icon: AlertTriangle,
      };
    }

    // A. Each one underutilized (includes idle + underutilized)
    const allUnderOrIdle = statusCounts.underutilized + statusCounts.idle === totalEmployees;
    if (allUnderOrIdle) {
      return {
        caseType: "team_underutilized_all",
        insight: "Team capacity is underused",
        action: "Increase workload or optimize team size",
        icon: Lightbulb,
      };
    }

    // C. Some overutilized, some idle
    if (statusCounts.overutilized > 0 && statusCounts.idle > 0) {
      const fromPerson = employees.filter(emp => getStatus(calculateUtilization(emp.workHours, emp.capacity)) === "overutilized")
        .sort((a, b) => calculateUtilization(b.workHours, b.capacity) - calculateUtilization(a.workHours, a.capacity))[0];
      const toPerson = getLowestUtilPerson("idle");
      const hours = calculateShiftHours(fromPerson, toPerson);
      return {
        caseType: "team_underutilized_some_over_idle",
        insight: "Mismatch between allocation and availability",
        action: `Shift ${hours} hours of work from ${fromPerson.name} to ${toPerson.name}`,
        icon: TrendingDown,
      };
    }

    // B. Some overutilized, some underutilized
    if (statusCounts.overutilized > 0 && statusCounts.underutilized > 0) {
      const fromPerson = employees.filter(emp => getStatus(calculateUtilization(emp.workHours, emp.capacity)) === "overutilized")
        .sort((a, b) => calculateUtilization(b.workHours, b.capacity) - calculateUtilization(a.workHours, a.capacity))[0];
      const toPerson = getLowestUtilPerson("underutilized");
      const hours = calculateShiftHours(fromPerson, toPerson);
      return {
        caseType: "team_underutilized_some_over_under",
        insight: "Uneven distribution despite low utilization",
        action: `Shift ${hours} hours of work from ${fromPerson.name} to ${toPerson.name}`,
        icon: TrendingDown,
      };
    }

    // E. Some balanced, some idle
    if (statusCounts.balanced > 0 && statusCounts.idle > 0) {
      const balancedPersons = employees.filter(emp => getStatus(calculateUtilization(emp.workHours, emp.capacity)) === "balanced");
      const fromPerson = [...balancedPersons].sort((a, b) => calculateUtilization(b.workHours, b.capacity) - calculateUtilization(a.workHours, a.capacity))[0];
      const toPerson = getLowestUtilPerson("idle");
      const hours = calculateShiftHours(fromPerson, toPerson);
      return {
        caseType: "team_underutilized_balanced_idle",
        insight: "Idle capacity exists within team",
        action: `Shift ${hours} hours of work from ${fromPerson.name} to ${toPerson.name}`,
        icon: TrendingDown,
      };
    }
  }

  // BALANCED TEAM (70–100%)
  if (teamUtilization >= 70 && teamUtilization <= 100) {
    // D. Each one near upper limit (>90%)
    const allNearMax = employees.every(emp => {
      const util = calculateUtilization(emp.workHours, emp.capacity);
      return util > 90 && util <= 100;
    });
    if (allNearMax) {
      return {
        caseType: "team_balanced_near_max",
        insight: "Team is near maximum capacity",
        action: "Prepare backup resources or reduce incoming tasks",
        icon: AlertTriangle,
      };
    }

    // C. Some overutilized, some balanced, some idle
    if (statusCounts.overutilized > 0 && statusCounts.idle > 0) {
      const fromPerson = employees.filter(emp => getStatus(calculateUtilization(emp.workHours, emp.capacity)) === "overutilized")
        .sort((a, b) => calculateUtilization(b.workHours, b.capacity) - calculateUtilization(a.workHours, a.capacity))[0];
      const toPerson = getLowestUtilPerson("idle");
      const hours = calculateShiftHours(fromPerson, toPerson);
      return {
        caseType: "team_balanced_critical_imbalance",
        insight: "Critical imbalance masked by average",
        action: `Shift ${hours} hours of work from ${fromPerson.name} to ${toPerson.name}`,
        icon: AlertTriangle,
      };
    }

    // B. Some overutilized, some balanced, some underutilized
    if (statusCounts.overutilized > 0 && (statusCounts.underutilized > 0 || statusCounts.idle > 0)) {
      const fromPerson = employees.filter(emp => getStatus(calculateUtilization(emp.workHours, emp.capacity)) === "overutilized")
        .sort((a, b) => calculateUtilization(b.workHours, b.capacity) - calculateUtilization(a.workHours, a.capacity))[0];
      const toPerson = statusCounts.underutilized > 0 ? getLowestUtilPerson("underutilized") : getLowestUtilPerson("idle");
      const hours = calculateShiftHours(fromPerson, toPerson);
      return {
        caseType: "team_balanced_hidden_imbalance",
        insight: "Hidden imbalance within a balanced team",
        action: `Shift ${hours} hours of work from ${fromPerson.name} to ${toPerson.name}`,
        icon: Lightbulb,
      };
    }

    // A. Each one evenly balanced
    const allBalanced = statusCounts.balanced === totalEmployees;
    if (allBalanced) {
      return {
        caseType: "team_balanced_optimal",
        insight: "Workload is optimally distributed",
        action: "Maintain current allocation",
        icon: Lightbulb,
      };
    }
  }

  // Fallback
  return {
    caseType: "unknown",
    insight: "Team status requires review",
    action: "Analyze individual utilization patterns",
    icon: Lightbulb,
  };
};

// ========================================
// MAIN COMPONENT
// ========================================

function App() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [activePreset, setActivePreset] = useState(null);
  const [history, setHistory] = useState(null);
  const [isEdgeCaseMode, setIsEdgeCaseMode] = useState(false);
  const [frozenCase, setFrozenCase] = useState(null);

  // Calculate team metrics
  const teamMetrics = useMemo(() => {
    // In edge case mode, use frozen data
    if (isEdgeCaseMode && frozenCase) {
      return frozenCase;
    }

    const totalWorkHours = employees.reduce((sum, emp) => sum + emp.workHours, 0);
    const totalCapacity = employees.reduce((sum, emp) => sum + emp.capacity, 0);
    const teamUtilization = (totalWorkHours / totalCapacity) * 100;

    // Determine team status
    let teamStatus = "balanced";
    if (teamUtilization < 70) teamStatus = "underutilized";
    if (teamUtilization > 100) teamStatus = "overutilized";

    // Count employees by status
    const statusCounts = employees.reduce(
      (acc, emp) => {
        const utilization = calculateUtilization(emp.workHours, emp.capacity);
        const status = getStatus(utilization);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { idle: 0, underutilized: 0, balanced: 0, overutilized: 0 }
    );

    // Detect case and generate insight/action
    const detectedCase = detectCase(employees, teamUtilization, history);

    return {
      totalWorkHours,
      totalCapacity,
      teamUtilization,
      teamStatus,
      statusCounts,
      detectedCase,
    };
  }, [employees, history, isEdgeCaseMode, frozenCase]);

  // Handle work hours change
  const handleWorkHoursChange = (empId, value) => {
    // Prevent editing in edge case mode
    if (isEdgeCaseMode) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 24) return;

    setEmployees(
      employees.map((emp) =>
        emp.id === empId ? { ...emp, workHours: numValue } : emp
      )
    );
  };

  // Load preset scenario
  const loadPreset = (presetName) => {
    const preset = presetScenarios[presetName];
    setEmployees(preset.employees);
    setHistory(preset.history);
    setActivePreset(presetName);

    // Check if this is an edge case
    if (presetName === "spike" || presetName === "skillMismatch") {
      setIsEdgeCaseMode(true);
      
      // Calculate and freeze the case
      const totalWorkHours = preset.employees.reduce((sum, emp) => sum + emp.workHours, 0);
      const totalCapacity = preset.employees.reduce((sum, emp) => sum + emp.capacity, 0);
      const teamUtilization = (totalWorkHours / totalCapacity) * 100;
      let teamStatus = "balanced";
      if (teamUtilization < 70) teamStatus = "underutilized";
      if (teamUtilization > 100) teamStatus = "overutilized";
      const detectedCase = detectCase(preset.employees, teamUtilization, preset.history);
      
      // Calculate status counts for frozen state
      const statusCounts = preset.employees.reduce(
        (acc, emp) => {
          const utilization = calculateUtilization(emp.workHours, emp.capacity);
          const status = getStatus(utilization);
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { idle: 0, underutilized: 0, balanced: 0, overutilized: 0 }
      );
      
      setFrozenCase({
        totalWorkHours,
        totalCapacity,
        teamUtilization,
        teamStatus,
        statusCounts,
        detectedCase,
      });
    } else {
      // Normal mode
      setIsEdgeCaseMode(false);
      setFrozenCase(null);
    }

    setTimeout(() => setActivePreset(null), 300);
  };

  const InsightIcon = teamMetrics.detectedCase.icon;

  return (
    <div className="App bg-zinc-50 h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 flex-shrink-0">
        <div className="max-w-[1900px] mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://static.prod-images.emergentagent.com/jobs/d18a7f17-be0f-42ea-9778-660ebbf03745/images/961b2c53e52e10a573724d0f6f0fc8611a1b7ab04447ff514d4238b509d920ce.png"
              alt="Logo"
              className="w-7 h-7"
              data-testid="dashboard-logo"
            />
            <h1 className="text-xl font-black tracking-tighter text-zinc-950 font-heading">
              Manpower Utilization
            </h1>
          </div>
          
          {/* Edge Case Mode Indicator */}
          {isEdgeCaseMode && (
            <div className="bg-amber-100 text-amber-900 px-3 py-1 text-xs font-medium border border-amber-300" data-testid="edge-case-indicator">
              📊 Viewing Scenario Simulation (Static)
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-[1900px] mx-auto w-full px-4 py-3 gap-3 overflow-hidden">
        {/* Top Row: Scenario Buttons + Team Summary + Insight & Action */}
        <div className="grid grid-cols-12 gap-3 flex-shrink-0">
          {/* Leftmost: Scenario Buttons (compact) */}
          <div className="col-span-2">
            <div className="bg-white p-3 border border-zinc-200 h-full">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Scenarios
              </h2>
              <div className="flex flex-col gap-1.5" data-testid="preset-buttons-container">
                <button
                  onClick={() => loadPreset("underutilized")}
                  className={`bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1.5 text-[11px] font-medium hover:bg-blue-100 transition-colors text-left ${
                    activePreset === "underutilized" ? "bg-blue-100" : ""
                  }`}
                  data-testid="preset-underutilized-button"
                >
                  <TrendingDown className="inline w-3 h-3 mr-1" />
                  Underutilized
                </button>
                <button
                  onClick={() => loadPreset("balanced")}
                  className={`bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1.5 text-[11px] font-medium hover:bg-emerald-100 transition-colors text-left ${
                    activePreset === "balanced" ? "bg-emerald-100" : ""
                  }`}
                  data-testid="preset-balanced-button"
                >
                  <CheckCircle className="inline w-3 h-3 mr-1" />
                  Balanced
                </button>
                <button
                  onClick={() => loadPreset("overutilized")}
                  className={`bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1.5 text-[11px] font-medium hover:bg-rose-100 transition-colors text-left ${
                    activePreset === "overutilized" ? "bg-rose-100" : ""
                  }`}
                  data-testid="preset-overutilized-button"
                >
                  <XCircle className="inline w-3 h-3 mr-1" />
                  Overutilized
                </button>
                <button
                  onClick={() => loadPreset("spike")}
                  className={`bg-zinc-50 text-zinc-700 border border-zinc-200 px-2 py-1.5 text-[11px] font-medium hover:bg-zinc-100 transition-colors text-left ${
                    activePreset === "spike" ? "bg-zinc-100" : ""
                  }`}
                  data-testid="preset-spike-button"
                >
                  <Zap className="inline w-3 h-3 mr-1" />
                  Spike
                </button>
                <button
                  onClick={() => loadPreset("skillMismatch")}
                  className={`bg-zinc-50 text-zinc-700 border border-zinc-200 px-2 py-1.5 text-[11px] font-medium hover:bg-zinc-100 transition-colors text-left ${
                    activePreset === "skillMismatch" ? "bg-zinc-100" : ""
                  }`}
                  data-testid="preset-skill-mismatch-button"
                >
                  <Activity className="inline w-3 h-3 mr-1" />
                  Skill Mismatch
                </button>
              </div>
            </div>
          </div>

          {/* Middle: Team Summary (wider column) */}
          <div className="col-span-7">
            <div className="bg-white p-4 border border-zinc-200 h-full" data-testid="team-metrics-container">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Team Summary
              </h2>
              {/* First Row: Total Utilization, Team Status, Total Employees */}
              <div className="grid grid-cols-[1fr_2fr_1fr] gap-4 mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    Total Utilization
                  </div>
                  <div className="text-3xl font-data tracking-tight text-zinc-950" data-testid="team-utilization-value">
                    {teamMetrics.teamUtilization.toFixed(1)}%
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    Team Status
                  </div>
                  <div 
                    className={`text-4xl font-data tracking-tight capitalize font-black ${
                      teamMetrics.teamStatus === 'overutilized' ? 'text-rose-600' :
                      teamMetrics.teamStatus === 'underutilized' ? 'text-blue-600' :
                      'text-emerald-600'
                    }`}
                    data-testid="team-status-value"
                  >
                    {teamMetrics.teamStatus}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    <Users className="inline w-4 h-4 mr-1" />
                    Total Employees
                  </div>
                  <div className="text-3xl font-data tracking-tight text-zinc-950" data-testid="total-employees-value">
                    {employees.length}
                  </div>
                </div>
              </div>
              {/* Second Row: Breakdown spanning full width */}
              <div className="border-t border-zinc-200 pt-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
                  Breakdown
                </div>
                <div className="flex items-center gap-6">
                  {teamMetrics.statusCounts.overutilized > 0 && (
                    <div className="flex items-center gap-2" data-testid="count-overutilized">
                      <span className="text-2xl font-data text-rose-600 font-bold">{teamMetrics.statusCounts.overutilized}</span>
                      <span className="text-sm text-zinc-700 uppercase tracking-wide">Overutilized</span>
                    </div>
                  )}
                  {teamMetrics.statusCounts.balanced > 0 && (
                    <div className="flex items-center gap-2" data-testid="count-balanced">
                      <span className="text-2xl font-data text-emerald-600 font-bold">{teamMetrics.statusCounts.balanced}</span>
                      <span className="text-sm text-zinc-700 uppercase tracking-wide">Balanced</span>
                    </div>
                  )}
                  {teamMetrics.statusCounts.underutilized > 0 && (
                    <div className="flex items-center gap-2" data-testid="count-underutilized">
                      <span className="text-2xl font-data text-blue-600 font-bold">{teamMetrics.statusCounts.underutilized}</span>
                      <span className="text-sm text-zinc-700 uppercase tracking-wide">Underutilized</span>
                    </div>
                  )}
                  {teamMetrics.statusCounts.idle > 0 && (
                    <div className="flex items-center gap-2" data-testid="count-idle">
                      <span className="text-2xl font-data text-yellow-600 font-bold">{teamMetrics.statusCounts.idle}</span>
                      <span className="text-sm text-zinc-700 uppercase tracking-wide">Idle</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rightmost: Insight & Action (compact) */}
          <div className="col-span-3">
            <div className="bg-zinc-950 text-white p-4 border border-zinc-900 h-full flex flex-col justify-center">
              <div className="space-y-5">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
                    Insight
                  </h2>
                  <div className="flex items-start gap-3">
                    <InsightIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <p className="text-base leading-snug font-medium" data-testid="insight-text">
                      {teamMetrics.detectedCase.insight}
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
                    Action
                  </h2>
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <p className="text-base leading-snug font-medium" data-testid="action-text">
                      {teamMetrics.detectedCase.action}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Employee Table */}
        <div className={`bg-white border border-zinc-200 flex-1 flex flex-col overflow-hidden ${isEdgeCaseMode ? 'min-h-0' : ''}`} data-testid="employee-table-container">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-3 py-2 border-b border-zinc-200 flex-shrink-0">
            Employee Breakdown
          </h2>
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-50">
                <tr className="border-b border-zinc-200">
                  <th className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Name
                  </th>
                  <th className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 text-center">
                    Work Hours
                  </th>
                  <th className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 text-center">
                    Capacity
                  </th>
                  <th className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Utilization %
                  </th>
                  <th className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const utilization = calculateUtilization(emp.workHours, emp.capacity);
                  const status = getStatus(utilization);
                  const statusStyles = getStatusStyles(status);
                  const progressColor = getProgressColor(status);
                  const progressWidth = Math.min(utilization, 100);

                  return (
                    <tr
                      key={emp.id}
                      className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors"
                      data-testid={`employee-row-${emp.id}`}
                    >
                      <td className="px-3 py-1.5 text-xs align-middle">
                        <div className="font-medium text-zinc-950" data-testid={`employee-name-${emp.id}`}>
                          {emp.name}
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-xs align-middle text-center">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={emp.workHours}
                          onChange={(e) => handleWorkHoursChange(emp.id, e.target.value)}
                          disabled={isEdgeCaseMode}
                          className={`border-zinc-300 focus:border-zinc-950 focus:ring-0 px-2 py-1 text-[10px] font-data w-16 text-zinc-950 text-center ${
                            isEdgeCaseMode ? "bg-zinc-100 cursor-not-allowed" : "bg-zinc-50"
                          }`}
                          data-testid={`edit-hours-input-${emp.id}`}
                        />
                      </td>
                      <td className="px-3 py-1.5 text-xs align-middle text-center">
                        <span className="font-data text-zinc-600 text-[10px]" data-testid={`employee-capacity-${emp.id}`}>
                          {emp.capacity}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-xs align-middle">
                        <div className="w-40">
                          <div className="font-data text-zinc-950 mb-1 text-[10px]" data-testid={`employee-utilization-${emp.id}`}>
                            {utilization.toFixed(1)}%
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 overflow-hidden">
                            <div
                              className={`h-full ${progressColor} progress-fill`}
                              style={{ width: `${progressWidth}%` }}
                              data-testid={`employee-progress-${emp.id}`}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-xs align-middle text-center">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border font-data ${statusStyles}`}
                          data-testid={`employee-status-${emp.id}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Row: Edge Case Chart (only when edge case) */}
        {teamMetrics.detectedCase.showChart && (
          <div className="bg-white p-3 border border-zinc-200 flex-shrink-0" data-testid="edge-case-chart-container">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">
              Edge Case Analysis
            </h2>
            {teamMetrics.detectedCase.chartType === "teamUtilization" && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-950 mb-2">
                  7-Day Team Utilization Trend
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={teamMetrics.detectedCase.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#71717a" 
                      style={{ fontSize: "10px" }}
                      label={{ value: 'Days', position: 'insideBottom', offset: -5, style: { fontSize: '11px', fill: '#52525b' } }}
                    />
                    <YAxis 
                      stroke="#71717a" 
                      style={{ fontSize: "10px" }}
                      label={{ value: 'Utilization %', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#52525b' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e4e4e7",
                        borderRadius: "0",
                        fontSize: "10px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "10px",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="utilization"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={{ fill: "#f43f5e", r: 3 }}
                      name="Utilization %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {teamMetrics.detectedCase.chartType === "employeeComparison" && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-950 mb-2">
                  7-Day Employee Comparison
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={teamMetrics.detectedCase.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#71717a" 
                      style={{ fontSize: "10px" }}
                      label={{ value: 'Days', position: 'insideBottom', offset: -5, style: { fontSize: '11px', fill: '#52525b' } }}
                    />
                    <YAxis 
                      stroke="#71717a" 
                      style={{ fontSize: "10px" }}
                      label={{ value: 'Utilization %', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#52525b' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e4e4e7",
                        borderRadius: "0",
                        fontSize: "10px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "10px",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rahul"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={{ fill: "#f43f5e", r: 3 }}
                      name="Rahul Kumar (Overutilized)"
                    />
                    <Line
                      type="monotone"
                      dataKey="priya"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={{ fill: "#eab308", r: 3 }}
                      name="Priya Singh (Idle)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
