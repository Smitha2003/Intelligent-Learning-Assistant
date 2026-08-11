import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Network, ClipboardList, Sparkles } from "lucide-react";
import OverviewTab from "@/components/dashboard/OverviewTab";
import GraphTab from "@/components/dashboard/GraphTab";
import AssessmentsTab from "@/components/dashboard/AssessmentsTab";
import InsightsTab from "@/components/dashboard/InsightsTab";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function Dashboard() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-radial-glow">
        <DashboardHeader tab={tab} />

        <main className="mx-auto max-w-[1400px] px-6 pb-16">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="bg-card/60 border border-border backdrop-blur rounded-lg p-1 h-auto gap-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4 py-2 text-sm font-medium"
                data-testid="tab-overview"
              >
                <Activity className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="graph"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4 py-2 text-sm font-medium"
                data-testid="tab-graph"
              >
                <Network className="h-4 w-4" />
                Graph
              </TabsTrigger>
              <TabsTrigger
                value="assessments"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4 py-2 text-sm font-medium"
                data-testid="tab-assessments"
              >
                <ClipboardList className="h-4 w-4" />
                Assessments
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 px-4 py-2 text-sm font-medium"
                data-testid="tab-insights"
              >
                <Sparkles className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 focus-visible:outline-none">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="graph" className="mt-6 focus-visible:outline-none">
              <GraphTab />
            </TabsContent>
            <TabsContent value="assessments" className="mt-6 focus-visible:outline-none">
              <AssessmentsTab />
            </TabsContent>
            <TabsContent value="insights" className="mt-6 focus-visible:outline-none">
              <InsightsTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
