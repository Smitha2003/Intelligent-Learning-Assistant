import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLearnerState, fetchContradictions, APIConceptState, APIContradiction } from "@/lib/api";
import { type Domain, Concept, GapEntry } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Layers,
  Activity,
  TrendingUp,
  ClockAlert,
  Search,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";
import { format, formatDistanceToNow, parseISO } from "date-fns";

const DOMAINS: ("All" | Domain)[] = [
  "All",
  "Computer Science",
  "Mathematics",
  "Biology",
  "Neuroscience",
  "Physics",
];

function masteryColor(m: number) {
  if (m >= 0.7) return "text-primary";
  if (m >= 0.5) return "text-chart-3";
  if (m >= 0.35) return "text-chart-4";
  return "text-destructive";
}

function masteryFill(m: number) {
  if (m >= 0.7) return "hsl(var(--primary))";
  if (m >= 0.5) return "hsl(var(--chart-3))";
  if (m >= 0.35) return "hsl(var(--chart-4))";
  return "hsl(var(--destructive))";
}

function confidenceVariant(c: string) {
  if (c === "High") return "border-primary/40 text-primary bg-primary/5";
  if (c === "Medium") return "border-chart-3/40 text-chart-3 bg-chart-3/5";
  return "border-destructive/40 text-destructive bg-destructive/5";
}

function mapStateToConcept(s: APIConceptState): Concept {
  const confidence = s.uncertainty < 0.3 ? "High" : s.uncertainty < 0.6 ? "Medium" : "Low";
  return {
    id: s.concept_id,
    name: s.name || s.concept_id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    domain: (s.domain as Domain) || "Computer Science",
    mastery: s.mastery,
    confidence: confidence as any,
    uncertainty: s.uncertainty,
    lastAssessed: s.last_updated,
    prerequisites: [],
    importance: 0.5,
    history: [s.mastery, s.mastery], // mocked sparkline
  };
}

function mapContradictionToGap(c: APIContradiction, idx: number): GapEntry {
  return {
    id: `live-gap-${idx}`,
    type: "prerequisite_violation",
    title: `Mastery violation: ${c.advanced_concept_id} > ${c.prerequisite_concept_id}`,
    detail: c.reason,
    conceptIds: [c.advanced_concept_id, c.prerequisite_concept_id],
  };
}

export default function OverviewTab() {
  const { data: stateData = [] } = useQuery({
    queryKey: ['learnerState', 1],
    queryFn: () => fetchLearnerState(1),
  });

  const { data: gapsData = [] } = useQuery({
    queryKey: ['contradictions', 1],
    queryFn: () => fetchContradictions(1),
  });

  const allConcepts = useMemo(() => stateData.map(mapStateToConcept), [stateData]);
  const gaps = useMemo(() => gapsData.map(mapContradictionToGap), [gapsData]);

  const [domain, setDomain] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return allConcepts.filter((c) => {
      if (domain !== "All" && c.domain !== domain) return false;
      if (query && !c.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [domain, query]);

  const stats = useMemo(() => {
    const total = allConcepts.length;
    const avg =
      allConcepts.reduce((s, c) => s + c.mastery, 0) / Math.max(1, total);
    const atRisk = allConcepts.filter((c) => c.mastery < 0.4).length;
    const stale = allConcepts.filter((c) => {
      const age =
        (Date.now() - parseISO(c.lastAssessed).getTime()) /
        (1000 * 60 * 60 * 24);
      return age > 12;
    }).length;
    return { total, avg, atRisk, stale };
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={<Layers className="h-4 w-4" />}
          label="Concepts tracked"
          value={String(stats.total)}
          hint="active in posterior"
        />
        <KpiCard
          icon={<Activity className="h-4 w-4" />}
          label="Mean mastery"
          value={`${Math.round(stats.avg * 100)}%`}
          hint="population posterior"
          accent
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="At-risk concepts"
          value={String(stats.atRisk)}
          hint="mastery < 40%"
          danger
        />
        <KpiCard
          icon={<ClockAlert className="h-4 w-4" />}
          label="Stale evidence"
          value={String(stats.stale)}
          hint="> 12 days since assessment"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search concepts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-card/60 border-border"
            data-testid="input-search-concepts"
          />
        </div>
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-[220px] bg-card/60 border-border" data-testid="select-domain">
            <SelectValue placeholder="Domain" />
          </SelectTrigger>
          <SelectContent>
            {DOMAINS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs text-muted-foreground font-mono">
          {filtered.length} / {allConcepts.length} shown
        </div>
      </div>

      {/* Concept grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((c, i) => {
          const masteryPct = Math.round(c.mastery * 100);
          const fill = masteryFill(c.mastery);
          const data = c.history.map((m, idx) => ({ idx, m }));
          return (
            <Card
              key={c.id}
              className="p-4 bg-card border-card-border hover-elevate animate-fade-in-up"
              style={{ animationDelay: `${i * 30}ms` }}
              data-testid={`card-concept-${c.id}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-xs text-muted-foreground tracking-wide">
                    {c.domain}
                  </div>
                  <div className="font-medium text-base leading-tight">
                    {c.name}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase tracking-wider ${confidenceVariant(c.confidence)}`}
                >
                  {c.confidence}
                </Badge>
              </div>

              <div className="flex items-baseline gap-2 mt-3">
                <span
                  className={`text-2xl font-semibold font-mono ${masteryColor(c.mastery)}`}
                >
                  {masteryPct}%
                </span>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  mastery
                </span>
              </div>

              <div className="mt-2">
                <Progress
                  value={masteryPct}
                  className="h-1.5 bg-muted"
                  style={{ ["--progress-fill" as string]: fill }}
                />
              </div>

              <div className="h-12 mt-3 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id={`g-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={fill} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={fill} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="m"
                      stroke={fill}
                      strokeWidth={1.5}
                      fill={`url(#g-${c.id})`}
                      isAnimationActive={false}
                    />
                    <RTooltip
                      cursor={false}
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                      formatter={(v: number) => [`${Math.round(v * 100)}%`, "mastery"]}
                      labelFormatter={() => ""}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  σ {c.uncertainty.toFixed(2)}
                </span>
                <span title={format(parseISO(c.lastAssessed), "PPP")}>
                  {formatDistanceToNow(parseISO(c.lastAssessed), { addSuffix: true })}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Gaps & violations */}
      <Card className="bg-card border-card-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-chart-4" />
              <h2 className="font-semibold">Gaps & Violations</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Posterior inconsistencies surfaced by the inference engine
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-mono">
            {gaps.length} flagged
          </Badge>
        </div>

        <div className="space-y-2">
          {gaps.map((g, i) => (
            <div
              key={g.id}
              className="rounded-md border border-border bg-background/40 p-3 animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
              data-testid={`gap-${g.id}`}
            >
              <div className="flex items-start gap-3">
                <GapIcon type={g.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm">{g.title}</span>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground"
                    >
                      {g.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {g.detail}
                  </p>
                  {g.type === "prerequisite_violation" && g.conceptIds.length >= 2 && (
                    <div className="mt-2 font-mono text-[11px] text-chart-4 flex items-center gap-2">
                      {g.conceptIds[0]} → {g.conceptIds[1]}{" "}
                      <span className="text-muted-foreground">prerequisite mismatch</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  accent,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <Card className="bg-card border-card-border p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className={accent ? "text-primary" : danger ? "text-destructive" : "text-muted-foreground"}>
          {icon}
        </span>
      </div>
      <div
        className={`text-3xl font-semibold font-mono ${
          accent ? "text-primary text-glow" : danger ? "text-destructive" : ""
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </Card>
  );
}

function GapIcon({ type }: { type: string }) {
  if (type === "prerequisite_violation")
    return <AlertTriangle className="h-4 w-4 text-chart-4 mt-0.5" />;
  if (type === "low_mastery")
    return <TrendingUp className="h-4 w-4 text-destructive mt-0.5 rotate-180" />;
  return <ClockAlert className="h-4 w-4 text-chart-3 mt-0.5" />;
}
