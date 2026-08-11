import { learner } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Brain, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  tab: string;
}

const tabSubtitles: Record<string, string> = {
  overview: "Mastery posterior across the active concept set",
  graph: "Read-only knowledge cartography · explainability layer",
  assessments: "Engine-prioritized probes ranked by expected information gain",
  insights: "Cross-domain transfer signals · view-only",
};

export default function DashboardHeader({ tab }: Props) {
  const queryClient = useQueryClient();

  return (
    <header className="border-b border-border/60">
      <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="h-11 w-11 rounded-lg border border-primary/40 bg-primary/10 flex items-center justify-center glow-primary">
                <Brain className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-app-title">
                  CLMS <span className="text-muted-foreground font-light">/ Learner Intelligence Console</span>
                </h1>
                <Badge variant="outline" className="text-[10px] tracking-widest uppercase font-mono border-primary/40 text-primary">
                  v0.4 · alpha
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {tabSubtitles[tab]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Learner</div>
              <div className="font-medium" data-testid="text-learner-name">{learner.name}</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Cohort</div>
              <div className="font-mono text-sm">{learner.cohort}</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Status</div>
              <div className="flex items-center gap-2 justify-end">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                <span className="text-sm mr-2">Live</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 gap-2"
                  onClick={() => queryClient.invalidateQueries()}
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
