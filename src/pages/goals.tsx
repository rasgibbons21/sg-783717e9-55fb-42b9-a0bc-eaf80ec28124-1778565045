import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authService } from "@/services/authService";
import { goalsService } from "@/services/goalsService";
import { SEO } from "@/components/SEO";
import {
  Plus,
  Trash2,
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  Check,
  Loader2,
  Trophy,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

interface SavingsGoal {
  id: string;
  title: string;
  category: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  completed: boolean;
  created_at: string;
}

const GOAL_CATEGORIES = [
  "Emergency Fund",
  "Vacation",
  "Home Down Payment",
  "Car",
  "Wedding",
  "Education",
  "Custom",
];

const CATEGORY_EMOJIS: Record<string, string> = {
  "Emergency Fund": "🛡️",
  Vacation: "✈️",
  "Home Down Payment": "🏡",
  Car: "🚗",
  Wedding: "💍",
  Education: "📚",
  Custom: "🎯",
};

export default function Goals() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingProgress, setIsAddingProgress] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState("");

  // Confetti celebration when goal is completed
  const celebrateGoalCompletion = () => {
    // Fire confetti from multiple angles for a premium celebration
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 9999,
      colors: ['#3d7a54', '#c8953a', '#d4788a', '#f0f0f8']
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire from left and right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Emergency Fund");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuthAndLoadGoals();
  }, []);

  const checkAuthAndLoadGoals = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }
    await loadGoals();
  };

  const loadGoals = async () => {
    setIsLoading(true);
    const data = await goalsService.getGoals();
    setGoals(data as SavingsGoal[]);
    setIsLoading(false);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const session = await authService.getCurrentSession();
    if (!session) return;

    const newGoal = await goalsService.createGoal({
      user_id: session.user.id,
      title,
      category,
      target_amount: parseFloat(targetAmount),
      current_amount: 0,
      deadline: deadline || null,
    });

    if (newGoal) {
      await loadGoals();
      setIsDialogOpen(false);
      resetForm();
    }

    setIsSubmitting(false);
  };

  const handleAddProgress = async (goalId: string) => {
    if (!progressAmount || parseFloat(progressAmount) <= 0) return;

    const amount = parseFloat(progressAmount);
    
    // Find the goal to check if it will be completed
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const wasCompleted = goal.completed;
    const newAmount = Number(goal.current_amount) + amount;
    const willBeCompleted = newAmount >= Number(goal.target_amount);

    const result = await goalsService.addProgress(
      goalId,
      amount
    );

    if (result) {
      // Trigger confetti if goal just became complete
      if (!wasCompleted && willBeCompleted) {
        celebrateGoalCompletion();
      }
      
      await loadGoals();
      setIsAddingProgress(null);
      setProgressAmount("");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    const success = await goalsService.deleteGoal(goalId);
    if (success) {
      await loadGoals();
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory("Emergency Fund");
    setTargetAmount("");
    setDeadline("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getPansyMessage = (progress: number) => {
    if (progress === 0) {
      return "Every journey starts with a single step girl! Let's get this money 💰";
    } else if (progress < 25) {
      return "You're off to a great start! Keep that momentum going sis 🌱";
    } else if (progress < 50) {
      return "Look at you go! Almost halfway there and killing it 💪";
    } else if (progress < 75) {
      return "Over halfway! The finish line is in sight babe 🎯";
    } else if (progress < 100) {
      return "SO CLOSE! You're literally almost there, don't stop now 🔥";
    } else {
      return "YESSS! Goal crushed! Time to celebrate and set the next one 🎉";
    }
  };

  const getTotalSaved = () => {
    return goals.reduce((sum, goal) => sum + Number(goal.current_amount), 0);
  };

  const getCompletedCount = () => {
    return goals.filter((g) => g.completed).length;
  };

  return (
    <Layout>
      <SEO
        title="Savings Goals - Bloom"
        description="Track your financial goals with visual progress"
      />
      <div className="container-full py-6 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Your Goals 🎯
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your progress and watch your dreams become reality
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-foreground">
                  Create a New Goal
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">
                    Goal Name
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Paris Vacation"
                    required
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {GOAL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-foreground">
                          {CATEGORY_EMOJIS[cat]} {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target" className="text-foreground">
                    Target Amount
                  </Label>
                  <Input
                    id="target"
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="5000"
                    required
                    min="1"
                    step="0.01"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-foreground">
                    Deadline (Optional)
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Goal"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card border-border rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold text-foreground">{goals.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(getTotalSaved())}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-rose" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {getCompletedCount()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pansy's Tip */}
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <img
              src="/bloom-logo.png"
              alt="Pansy"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-foreground">Pansy</p>
                <Badge className="bg-primary text-primary-foreground text-xs">
                  Available 24/7
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "Having clear financial goals isn't just about the numbers girl — it's about creating the life you want. Break down big dreams into smaller milestones and celebrate each one 🌸"
              </p>
            </div>
          </div>
        </Card>

        {/* Goals List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : goals.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border rounded-2xl">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">
              No goals yet!
            </h3>
            <p className="text-muted-foreground mb-6">
              Let's get started on building your future. What are you saving for?
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = getProgress(
                Number(goal.current_amount),
                Number(goal.target_amount)
              );
              return (
                <Card
                  key={goal.id}
                  className="p-6 bg-card border-border rounded-2xl"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                          {CATEGORY_EMOJIS[goal.category]}
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-bold text-foreground">
                            {goal.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {goal.category}
                          </p>
                          {goal.deadline && (
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Deadline:{" "}
                                {new Date(goal.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {goal.completed && (
                          <Badge className="bg-primary text-primary-foreground">
                            <Check className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-semibold">
                          {formatCurrency(Number(goal.current_amount))}
                        </span>
                        <span className="text-muted-foreground">
                          of {formatCurrency(Number(goal.target_amount))}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <p className="text-xs text-muted-foreground">
                        {progress.toFixed(1)}% complete
                      </p>
                    </div>

                    {/* Pansy's Message */}
                    <Card className="p-3 bg-accent/5 border-accent/20 rounded-xl">
                      <p className="text-sm text-muted-foreground italic">
                        {getPansyMessage(progress)}
                      </p>
                    </Card>

                    {/* Add Progress */}
                    {!goal.completed && (
                      <div className="flex gap-2">
                        {isAddingProgress === goal.id ? (
                          <>
                            <Input
                              type="number"
                              value={progressAmount}
                              onChange={(e) => setProgressAmount(e.target.value)}
                              placeholder="Amount to add"
                              min="0.01"
                              step="0.01"
                              className="flex-1 bg-background border-border text-foreground"
                            />
                            <Button
                              onClick={() => handleAddProgress(goal.id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Add
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddingProgress(null);
                                setProgressAmount("");
                              }}
                              className="border-border text-foreground"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => setIsAddingProgress(goal.id)}
                            variant="outline"
                            className="w-full border-border text-foreground hover:bg-primary/10"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Add Progress
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <Card className="p-3 bg-muted border-muted-foreground/20 rounded-2xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial
            advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </Card>
      </div>
    </Layout>
  );
}