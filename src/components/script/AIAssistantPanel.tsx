import { useState } from "react";
import { Sparkles, Lightbulb, List, X, ChevronDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const suggestions = [
  "Add a visual motif — rain on the window — to mirror Marlowe's emotional state",
  "Vivian's dialogue in Scene 1 could hint at her deception earlier",
  "Scene 3 needs a turning point — what does Marlowe do after seeing Vivian?",
];

const breakdownData = {
  characters: [
    "Detective Marlowe", "Vivian Cross", "Eddie Rossi", "Bartender"
  ],
  locations: [
    "Marlowe's Office", "Rain-Slicked Alley", "The Blue Note Jazz Club"
  ],
  props: [
    "Manila envelope", "Whiskey bottle", "Photograph"
  ],
};

export function AIAssistantPanel() {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);
  const [fullScriptOpen, setFullScriptOpen] = useState(false);

  return (
    <div className="w-[300px] flex-shrink-0 border-l border-border bg-card flex flex-col h-full">
      <Tabs defaultValue="generate" className="flex flex-col h-full">
        <TabsList className="mx-3 mt-3 bg-secondary">
          <TabsTrigger value="generate" className="gap-1.5 text-xs data-[state=active]:text-accent-foreground">
            <Sparkles className="w-3 h-3" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-1.5 text-xs">
            <Lightbulb className="w-3 h-3" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="gap-1.5 text-xs">
            <List className="w-3 h-3" />
            Breakdown
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Scene prompt</label>
            <Textarea
              placeholder="Describe what happens in this scene..."
              className="bg-secondary border-border text-sm resize-none min-h-[100px] font-sans"
            />
          </div>
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Scene
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground uppercase">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Collapsible open={fullScriptOpen} onOpenChange={setFullScriptOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
              <span>Generate full script from concept</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", fullScriptOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <Textarea
                placeholder="Describe your film idea in a few sentences..."
                className="bg-secondary border-border text-sm resize-none min-h-[80px] font-sans"
              />
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                <Sparkles className="w-4 h-4" />
                Write Full Script
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="flex-1 overflow-y-auto p-4 space-y-3">
          {suggestions.map((s, i) =>
            dismissedSuggestions.includes(i) ? null : (
              <div key={i} className="rounded-lg border border-border bg-secondary/50 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/90 leading-relaxed">{s}</p>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] text-accent hover:text-accent">
                    Apply
                  </Button>
                  <button
                    onClick={() => setDismissedSuggestions(prev => [...prev, i])}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="flex-1 overflow-y-auto p-4 space-y-5">
          <BreakdownSection title="Characters" count={4} icon="user" items={breakdownData.characters} />
          <BreakdownSection title="Locations" count={3} icon="map" items={breakdownData.locations} />
          <BreakdownSection title="Props" count={3} icon="box" items={breakdownData.props} />

          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 mt-4">
            Extract All to Project
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BreakdownSection({ title, count, items }: { title: string; count: number; icon: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title} ({count})
      </p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 text-xs text-foreground/90 cursor-pointer hover:bg-secondary/50 rounded px-2 py-1.5 transition-colors">
            <Checkbox className="h-3.5 w-3.5" />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
