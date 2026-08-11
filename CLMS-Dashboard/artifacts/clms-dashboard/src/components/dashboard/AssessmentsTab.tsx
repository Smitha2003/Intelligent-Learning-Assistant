import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAssessments, APIAssessmentRecommendation } from "@/lib/api";
import {
  assessmentHistory,
  quizBank,
  concepts,
  AssessmentRecommendation
} from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Clock,
  Target,
  Check,
  TrendingUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";

function mapAssessment(a: APIAssessmentRecommendation, index: number): AssessmentRecommendation {
  return {
    priority: index + 1,
    conceptId: a.concept_id,
    conceptName: a.concept_id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    reason: a.reason,
    estimatedMinutes: 10, // mock
    type: "diagnostic", // mock
  };
}

export default function AssessmentsTab() {
  const { data: assessmentsData = [] } = useQuery({
    queryKey: ['assessments', 1],
    queryFn: () => fetchAssessments(1),
  });

  const recommendations = useMemo(() => assessmentsData.map(mapAssessment), [assessmentsData]);

  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  const startConcept = activeQuiz
    ? concepts.find((c) => c.id === activeQuiz)
    : null;

  return (
    <div className="space-y-6">
      {/* Recommendations table */}
      <Card className="bg-card border-card-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Next Best Assessments</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ranked by expected information gain · prerequisite criticality · evidence age
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-widest font-mono border-primary/40 text-primary"
          >
            {recommendations.length} queued
          </Badge>
        </div>

        <div className="space-y-2">
          {recommendations.map((r, i) => (
            <div
              key={r.conceptId}
              className="grid grid-cols-12 gap-3 items-center rounded-md border border-border bg-background/40 p-3 hover-elevate animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
              data-testid={`recommendation-${r.conceptId}`}
            >
              <div className="col-span-1 flex items-center justify-center">
                <span className="font-mono text-lg text-primary text-glow">
                  {r.priority}
                </span>
              </div>
              <div className="col-span-12 sm:col-span-3">
                <div className="font-medium text-sm">{r.conceptName}</div>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-widest font-mono mt-1 text-muted-foreground"
                >
                  {r.type.replace("_", " ")}
                </Badge>
              </div>
              <div className="col-span-12 sm:col-span-5 text-sm text-muted-foreground leading-relaxed">
                {r.reason}
              </div>
              <div className="col-span-6 sm:col-span-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {r.estimatedMinutes}m
              </div>
              <div className="col-span-6 sm:col-span-2 flex justify-end">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                  onClick={() => setActiveQuiz(r.conceptId)}
                  data-testid={`button-start-${r.conceptId}`}
                >
                  Start Assessment
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* History */}
      <Card className="bg-card border-card-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Recent Assessment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Concept</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium text-right">Score</th>
                <th className="pb-2 font-medium text-right">Δ Mastery</th>
              </tr>
            </thead>
            <tbody>
              {assessmentHistory.map((h) => (
                <tr key={h.id} className="border-b border-border/40 last:border-0">
                  <td className="py-2.5 font-mono text-xs text-muted-foreground">
                    {format(parseISO(h.date), "MMM d")}
                  </td>
                  <td className="py-2.5">{h.conceptName}</td>
                  <td className="py-2.5 text-muted-foreground text-xs">{h.type}</td>
                  <td className="py-2.5 text-right font-mono">
                    {Math.round(h.score * 100)}%
                  </td>
                  <td className="py-2.5 text-right font-mono text-primary">
                    +{(h.delta * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <QuizDialog
        conceptName={startConcept?.name ?? null}
        currentMastery={startConcept?.mastery ?? null}
        open={!!activeQuiz}
        onClose={() => setActiveQuiz(null)}
      />
    </div>
  );
}

function QuizDialog({
  conceptName,
  currentMastery,
  open,
  onClose,
}: {
  conceptName: string | null;
  currentMastery: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [done, setDone] = useState(false);

  const questions = quizBank.default;
  const q = questions[step];

  const reset = () => {
    setStep(0);
    setAnswers({});
    setDone(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const submit = () => setDone(true);

  const projected = currentMastery
    ? Math.min(0.95, currentMastery + 0.17)
    : 0.58;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-xl bg-card border-card-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Assessment · {conceptName}
          </DialogTitle>
          <DialogDescription>
            {done
              ? "Belief update preview — pending engine commit."
              : `Question ${step + 1} of ${questions.length}`}
          </DialogDescription>
        </DialogHeader>

        {!done ? (
          <div className="space-y-4">
            <Progress
              value={((step + 1) / questions.length) * 100}
              className="h-1 bg-muted"
            />
            <div className="space-y-3">
              <div className="text-sm font-medium leading-relaxed">{q.prompt}</div>
              {q.type === "mcq" ? (
                <div className="space-y-2">
                  {q.options!.map((opt, idx) => {
                    const selected = answers[q.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnswers({ ...answers, [q.id]: idx })}
                        className={`w-full text-left rounded-md border p-3 text-sm transition hover-elevate ${
                          selected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background/40"
                        }`}
                        data-testid={`option-${idx}`}
                      >
                        <span className="font-mono text-xs text-muted-foreground mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Textarea
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Your answer…"
                  className="bg-background/40"
                  data-testid="textarea-answer"
                />
              )}
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
              {step < questions.length - 1 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={submit}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-submit"
                >
                  Submit
                  <Check className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="rounded-md border border-primary/40 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Belief update preview</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <Stat label="Prior mastery" value={`${Math.round((currentMastery ?? 0) * 100)}%`} />
                <Stat label="Posterior" value={`~${Math.round(projected * 100)}%`} accent />
                <Stat
                  label="Δ"
                  value={`+${Math.round((projected - (currentMastery ?? 0)) * 100)}%`}
                  accent
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Once committed, this evidence will propagate to dependent concepts and
                may trigger re-prioritization of downstream assessments.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleClose}>
                Discard
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleClose}
                data-testid="button-commit"
              >
                Commit to model
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md bg-background/60 border border-border p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className={`font-mono text-base mt-0.5 ${accent ? "text-primary" : ""}`}>
        {value}
      </div>
    </div>
  );
}
