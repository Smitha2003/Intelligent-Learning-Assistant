import { useQuery } from "@tanstack/react-query";
import { fetchInsights, APICrossDomainInsight } from "@/lib/api";
import { trajectory, CrossDomainInsight } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Sparkles, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function mapInsight(ins: APICrossDomainInsight, idx: number): CrossDomainInsight {
  return {
    id: `live-ins-${idx}`,
    domainA: ins.domain_a,
    domainB: ins.domain_b,
    title: `Transfer to ${ins.recommended_name}`,
    body: `Leverage your foundational knowledge of ${ins.current_name} to bridge the gap and accelerate your understanding of ${ins.recommended_name}.`,
    bridgeConcepts: [ins.current_name, ins.recommended_name],
  };
}

export default function InsightsTab() {
  const { data: insightsData = [] } = useQuery({
    queryKey: ['insights', 1],
    queryFn: () => fetchInsights(1),
  });

  const crossDomainInsights = insightsData.map(mapInsight);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant="outline"
          className="text-[10px] uppercase tracking-widest border-primary/40 text-primary"
        >
          <Eye className="h-3 w-3 mr-1.5" />
          View only · no belief updates
        </Badge>
        <span className="text-xs text-muted-foreground">
          Suggestions surfaced from cross-domain co-activation patterns · purely informational
        </span>
      </div>

      <Card className="bg-card border-card-border p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Learning Trajectory</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Population mean mastery over the last 9 weeks
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Current
            </div>
            <div className="font-mono text-2xl text-primary text-glow">
              {Math.round(trajectory[trajectory.length - 1].mastery * 100)}%
            </div>
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectory} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="trajFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(78 90% 55%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(78 90% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(150 8% 18%)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="hsl(80 8% 60%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(80 8% 60%)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                domain={[0, 1]}
              />
              <Tooltip
                cursor={{ stroke: "hsl(78 90% 55%)", strokeOpacity: 0.3 }}
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${Math.round(v * 100)}%`, "mastery"]}
              />
              <Area
                type="monotone"
                dataKey="mastery"
                stroke="hsl(78 90% 55%)"
                strokeWidth={2}
                fill="url(#trajFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Cross-domain transfer signals</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crossDomainInsights.map((ins, i) => (
            <Card
              key={ins.id}
              className="bg-card border-card-border p-5 hover-elevate animate-fade-in-up relative overflow-hidden"
              style={{ animationDelay: `${i * 40}ms` }}
              data-testid={`insight-${ins.id}`}
            >
              {/* Bridge gradient */}
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant="outline"
                  className="text-[11px] border-chart-3/40 text-chart-3 bg-chart-3/5 font-medium"
                >
                  {ins.domainA}
                </Badge>
                <div className="flex-1 h-px bg-gradient-to-r from-chart-3/60 via-primary/60 to-chart-2/60" />
                <span className="text-primary text-sm">🔗</span>
                <div className="flex-1 h-px bg-gradient-to-r from-chart-2/60 via-primary/60 to-chart-3/60" />
                <Badge
                  variant="outline"
                  className="text-[11px] border-chart-2/40 text-chart-2 bg-chart-2/5 font-medium"
                >
                  {ins.domainB}
                </Badge>
              </div>

              <h3 className="font-medium text-base leading-tight mb-2">{ins.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ins.body}
              </p>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ins.bridgeConcepts.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      · {c.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground"
                >
                  signal
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
