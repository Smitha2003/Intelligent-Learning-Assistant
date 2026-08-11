import { useEffect, useMemo, useRef, useState } from "react";
import { concepts as mockConcepts, type Concept } from "@/data/mockData";
import { useQuery } from "@tanstack/react-query";
import { fetchLearnerState } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Eye, Info } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Node {
  id: string;
  name: string;
  domain: string;
  mastery: number;
  uncertainty: number;
  importance: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Edge {
  source: string;
  target: string;
}

const W = 1000;
const H = 640;

function nodeFill(m: number, domain?: string) {
  if (domain === "Document") return "hsl(0 0% 95%)";
  if (m >= 0.7) return "hsl(78 90% 55%)";
  if (m >= 0.5) return "hsl(165 75% 50%)";
  if (m >= 0.35) return "hsl(35 95% 60%)";
  return "hsl(8 80% 58%)";
}

function nodeRadius(c: Concept) {
  if (c.domain === "Document") return 26;
  return 10 + c.importance * 14;
}

function buildGraph(conceptsList: Concept[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = conceptsList.map((c, i) => {
    const angle = (i / conceptsList.length) * Math.PI * 2;
    const r = 240;
    return {
      id: c.id,
      name: c.name,
      domain: c.domain,
      mastery: c.mastery,
      uncertainty: c.uncertainty,
      importance: c.importance,
      x: W / 2 + Math.cos(angle) * r,
      y: H / 2 + Math.sin(angle) * r,
      vx: 0,
      vy: 0,
    };
  });

  const edges: Edge[] = [];
  const nodeIds = new Set(conceptsList.map(c => c.id));
  
  conceptsList.forEach((c) => {
    c.prerequisites.forEach((p) => {
      if (nodeIds.has(p)) {
        edges.push({ source: p, target: c.id });
      }
    });
  });

  // Tiny force simulation
  const idMap = new Map(nodes.map((n) => [n.id, n]));
  const RADIUS_REPEL = 1800;
  const LINK_DIST = 130;
  const CENTER = 0.012;

  for (let iter = 0; iter < 320; iter++) {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) d2 = 1;
        let r_repel = RADIUS_REPEL;
        if (a.domain === "Document" || b.domain === "Document") r_repel *= 2.5; // Documents repel strongly
        const force = r_repel / d2;
        const d = Math.sqrt(d2);
        const fx = (dx / d) * force;
        const fy = (dy / d) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }
    // Link spring
    edges.forEach((e) => {
      const a = idMap.get(e.source);
      const b = idMap.get(e.target);
      if (!a || !b) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = (a.domain === "Document" || b.domain === "Document") ? 90 : LINK_DIST;
      const diff = (d - targetDist) / d;
      const fx = dx * diff * 0.06;
      const fy = dy * diff * 0.06;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    });
    // Center pull + damping
    nodes.forEach((n) => {
      n.vx += (W / 2 - n.x) * CENTER;
      n.vy += (H / 2 - n.y) * CENTER;
      n.vx *= 0.78;
      n.vy *= 0.78;
      n.x += Math.max(-12, Math.min(12, n.vx));
      n.y += Math.max(-12, Math.min(12, n.vy));
      n.x = Math.max(40, Math.min(W - 40, n.x));
      n.y = Math.max(40, Math.min(H - 40, n.y));
    });
  }

  return { nodes, edges };
}

export default function GraphTab() {
  const { data: stateData = [] } = useQuery({
    queryKey: ['learnerState', 1],
    queryFn: () => fetchLearnerState(1),
  });

  const liveConcepts = useMemo(() => {
    return stateData.map(s => {
      const mock = mockConcepts.find(mc => mc.id === s.concept_id);
      return {
        id: s.concept_id,
        name: s.name || (mock ? mock.name : s.concept_id),
        domain: s.domain || (mock ? mock.domain : "Unknown"),
        mastery: s.mastery,
        uncertainty: s.uncertainty,
        lastAssessed: s.last_updated,
        confidence: s.uncertainty < 0.3 ? "High" : s.uncertainty < 0.6 ? "Medium" : "Low" as any,
        importance: mock ? mock.importance : 0.5,
        prerequisites: s.prerequisites || []
      };
    });
  }, [stateData]);

  const graph = useMemo(() => buildGraph(liveConcepts), [liveConcepts]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const selected = selectedId
    ? liveConcepts.find((c) => c.id === selectedId) ?? null
    : null;

  const neighborIds = useMemo(() => {
    const focus = hoverId ?? selectedId;
    if (!focus) return null;
    const set = new Set<string>([focus]);
    graph.edges.forEach((e) => {
      if (e.source === focus) set.add(e.target);
      if (e.target === focus) set.add(e.source);
    });
    return set;
  }, [hoverId, selectedId, graph.edges]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-widest border-primary/40 text-primary"
          >
            <Eye className="h-3 w-3 mr-1.5" />
            View only · no belief updates
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Explainability layer · clicks do not feed inference
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Legend />
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: selected ? "minmax(0,1fr) 320px" : "minmax(0,1fr)" }}>
        <Card className="bg-card border-card-border overflow-hidden relative bg-grid">
          <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-[640px] block"
            data-testid="graph-svg"
          >
            <defs>
              {graph.nodes.map((n) => (
                <radialGradient key={`grad-${n.id}`} id={`grad-${n.id}`}>
                  <stop offset="0%" stopColor={nodeFill(n.mastery, n.domain)} stopOpacity="1" />
                  <stop offset="100%" stopColor={nodeFill(n.mastery, n.domain)} stopOpacity={n.domain === "Document" ? "0.9" : "0.55"} />
                </radialGradient>
              ))}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Standard Edges (Underneath Nodes) */}
            {graph.edges.map((e, i) => {
              const a = graph.nodes.find((n) => n.id === e.source)!;
              const b = graph.nodes.find((n) => n.id === e.target)!;
              const dim = neighborIds && !(neighborIds.has(a.id) && neighborIds.has(b.id));
              const highlight = neighborIds && neighborIds.has(a.id) && neighborIds.has(b.id);
              
              const isDocEdge = a.domain === "Document" || b.domain === "Document";
              const isCrossDomain = !isDocEdge && a.domain !== b.domain;
              
              if (isCrossDomain) return null; // Render these on top later!
              
              let strokeColor = "hsl(150 20% 40%)"; // Default Inter-domain
              let strokeWidth = highlight ? 1.4 : 0.8;
              let dash = "none";
              let opacity = dim ? 0.08 : highlight ? 0.7 : 0.22;

              if (isDocEdge) {
                strokeColor = "hsl(0 0% 50%)"; // Neutral gray
                dash = "4, 4";
                opacity = dim ? 0.05 : highlight ? 0.5 : 0.2;
              } else if (highlight) {
                strokeColor = "hsl(78 90% 55%)";
              }

              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={strokeColor}
                  strokeOpacity={opacity}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dash}
                />
              );
            })}

            {/* Nodes */}
            {graph.nodes.map((n) => {
              const r = nodeRadius(liveConcepts.find((c) => c.id === n.id)!);
              const dim = neighborIds && !neighborIds.has(n.id);
              const isSelected = selectedId === n.id;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  style={{ cursor: "pointer", opacity: dim ? 0.25 : 1, transition: "opacity 200ms" }}
                  onClick={() => setSelectedId(n.id === selectedId ? null : n.id)}
                  onMouseEnter={() => setHoverId(n.id)}
                  onMouseLeave={() => setHoverId(null)}
                  data-testid={`node-${n.id}`}
                >
                  {/* uncertainty halo (animated) */}
                  {n.uncertainty > 0.3 && n.domain !== "Document" && (
                    <circle
                      r={r + 6 + n.uncertainty * 8}
                      fill="none"
                      stroke={nodeFill(n.mastery, n.domain)}
                      strokeOpacity={0.35}
                      strokeWidth={1}
                      className="animate-pulse-glow"
                      style={{ transformOrigin: "center" }}
                    />
                  )}
                  <circle
                    r={r}
                    fill={`url(#grad-${n.id})`}
                    stroke={isSelected ? "hsl(78 90% 70%)" : n.domain === "Document" ? "hsl(0 0% 40%)" : "hsl(150 8% 18%)"}
                    strokeWidth={isSelected ? (n.domain === "Document" ? 4 : 2.5) : (n.domain === "Document" ? 2 : 1)}
                    filter={isSelected || hoverId === n.id ? "url(#glow)" : undefined}
                  />
                  <text
                    y={r + 14}
                    textAnchor="middle"
                    fontSize={n.domain === "Document" ? "12" : "11"}
                    fontWeight={n.domain === "Document" ? "600" : "400"}
                    fontFamily="Inter, sans-serif"
                    fill={n.domain === "Document" ? "hsl(0 0% 100%)" : "hsl(80 15% 92%)"}
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {n.name}
                  </text>
                </g>
              );
            })}

            {/* Cross-Domain Edges (Rendered ON TOP of nodes for maximum visibility!) */}
            {graph.edges.map((e, i) => {
              const a = graph.nodes.find((n) => n.id === e.source)!;
              const b = graph.nodes.find((n) => n.id === e.target)!;
              const dim = neighborIds && !(neighborIds.has(a.id) && neighborIds.has(b.id));
              const highlight = neighborIds && neighborIds.has(a.id) && neighborIds.has(b.id);
              
              const isDocEdge = a.domain === "Document" || b.domain === "Document";
              const isCrossDomain = !isDocEdge && a.domain !== b.domain;
              
              if (!isCrossDomain) return null;
              
              return (
                <line
                  key={`cross-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="hsl(280 90% 65%)" // Vibrant purple
                  strokeOpacity={dim ? 0.15 : highlight ? 1.0 : 0.8}
                  strokeWidth={highlight ? 3.5 : 2.0} // Thicker line
                  className="animate-pulse" // Make the line pulse to draw attention
                  style={{ filter: "drop-shadow(0 0 4px hsl(280 90% 65% / 0.5))" }} // Glowing effect
                />
              );
            })}
          </svg>
        </Card>

        {selected && (
          <Card className="bg-card border-card-border p-5 animate-fade-in-up" data-testid="panel-node-detail">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {selected.domain}
                </div>
                <h3 className="text-lg font-semibold leading-tight">{selected.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSelectedId(null)}
                data-testid="button-close-panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <Stat label="Mastery" value={`${Math.round(selected.mastery * 100)}%`} accent />
              <Stat label="Confidence" value={selected.confidence} />
              <Stat label="Uncertainty σ" value={selected.uncertainty.toFixed(2)} />
              <Stat label="Importance" value={selected.importance.toFixed(2)} />
              <Stat
                label="Last assessed"
                value={format(parseISO(selected.lastAssessed), "PP")}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                Prerequisites
              </div>
              {selected.prerequisites.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">none — root concept</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selected.prerequisites.map((p) => {
                    const target = liveConcepts.find((c) => c.id === p);
                    return (
                      <Badge
                        key={p}
                        variant="outline"
                        className="text-[11px] cursor-pointer hover-elevate"
                        onClick={() => setSelectedId(p)}
                      >
                        {target?.name ?? p}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                Dependents
              </div>
              <div className="flex flex-wrap gap-1.5">
                {liveConcepts
                  .filter((c) => c.prerequisites.includes(selected.id))
                  .map((c) => (
                    <Badge
                      key={c.id}
                      variant="outline"
                      className="text-[11px] cursor-pointer hover-elevate"
                      onClick={() => setSelectedId(c.id)}
                    >
                      {c.name}
                    </Badge>
                  ))}
                {liveConcepts.filter((c) => c.prerequisites.includes(selected.id)).length === 0 && (
                  <span className="text-xs text-muted-foreground italic">none</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-start gap-2 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
              <p className="leading-relaxed">
                This panel is purely explanatory. Inspecting nodes does not modify
                belief state, mastery, or uncertainty in the underlying model.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${accent ? "text-primary" : ""}`}>{value}</span>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-col items-end gap-1.5 text-[11px]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span>high mastery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(165 75% 50%)" }} />
          <span>mid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(35 95% 60%)" }} />
          <span>weak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
          <span>at-risk</span>
        </div>
        <div className="h-3 w-px bg-border mx-1" />
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-primary/60 animate-pulse-glow" />
          <span>uncertainty halo</span>
        </div>
      </div>
      
      {/* Edge Legend */}
      <div className="flex flex-wrap items-center gap-3 opacity-80">
        <div className="flex items-center gap-1.5">
          <svg width="24" height="4" className="overflow-visible"><line x1="0" y1="2" x2="24" y2="2" stroke="hsl(0 0% 50%)" strokeWidth="1.5" strokeDasharray="4,4" /></svg>
          <span>document source</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="24" height="4" className="overflow-visible"><line x1="0" y1="2" x2="24" y2="2" stroke="hsl(150 20% 40%)" strokeWidth="1.5" /></svg>
          <span>inter-domain</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="24" height="4" className="overflow-visible"><line x1="0" y1="2" x2="24" y2="2" stroke="hsl(280 90% 65%)" strokeWidth="2.5" /></svg>
          <span className="text-[hsl(280,90%,75%)]">cross-domain transfer</span>
        </div>
      </div>
    </div>
  );
}
