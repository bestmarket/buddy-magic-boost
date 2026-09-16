import { createFileRoute } from "@tanstack/react-router";
import { Check, Clapperboard, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

import { ProductionDialog } from "@/components/ProductionDialog";
import { Button } from "@/components/ui/button";
import type { Scene, VideoStyle } from "@/lib/studio.functions";
import { VIDEO_STYLES } from "@/lib/studio.functions";
import { cn } from "@/lib/utils";
import { useRefreshWorkspace, useWorkspace } from "@/lib/useWorkspace";

export const Route = createFileRoute("/_authenticated/app/produce")({
  head: () => ({
    meta: [
      { title: "Make video — Channel Studio" },
      {
        name: "description",
        content: "Pick one or many scripts, choose a look, and generate your videos.",
      },
      { property: "og:title", content: "Make video — Channel Studio" },
      {
        property: "og:description",
        content: "Pick one or many scripts, choose a look, and generate your videos.",
      },
    ],
  }),
  component: ProducePage,
});

function ProducePage() {
  const workspace = useWorkspace();
  const refresh = useRefreshWorkspace();
  const projectId = workspace.data?.project.id;
  const scripts = workspace.data?.scripts ?? [];

  const [picked, setPicked] = useState<string[]>([]);
  const [openStyle, setOpenStyle] = useState<VideoStyle | null>(null);

  if (workspace.isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your scripts…
      </div>
    );
  }

  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-medium text-foreground">Make a video</h1>
            <p className="text-sm text-muted-foreground">
              Tick one script for a single video, or several to generate them all at once.
            </p>
          </div>
          {scripts.length > 0 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPicked(picked.length === scripts.length ? [] : scripts.map((s) => s.id))
              }
            >
              {picked.length === scripts.length ? "Clear all" : "Select all"}
            </Button>
          ) : null}
        </div>

        {scripts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No scripts yet — write one in the Chat tab, then it appears here.
          </p>
        ) : (
          <ul className="space-y-2">
            {scripts.map((row) => {
              const on = picked.includes(row.id);
              const scenes = ((row.scenes as unknown as Scene[]) ?? []).length;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(row.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      on ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {on ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileText className="h-4 w-4 shrink-0" />
                        {row.title}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {scenes} scenes
                        {row.tags?.length ? ` · ${row.tags.slice(0, 4).join(", ")}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium text-foreground">Pick a look and generate</h2>
          <p className="text-sm text-muted-foreground">
            {picked.length === 0
              ? "Tick at least one script above."
              : `${picked.length} script${picked.length > 1 ? "s" : ""} ready — choose a video style.`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {VIDEO_STYLES.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={picked.length === 0}
              onClick={() => setOpenStyle(option)}
              className={cn(
                "overflow-hidden rounded-lg border border-border text-left transition-colors",
                "hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring",
                picked.length === 0 && "cursor-not-allowed opacity-50",
              )}
            >
              <span className="block h-16 w-full" style={{ background: option.swatch }} />
              <span className="block p-3">
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{option.blurb}</span>
              </span>
            </button>
          ))}
        </div>
        {picked.length > 0 ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clapperboard className="h-3.5 w-3.5" /> Your picked scripts are already ticked in the
            production settings.
          </p>
        ) : null}
      </section>

      <ProductionDialog
        style={openStyle}
        projectId={projectId}
        scripts={scripts}
        initialScriptIds={picked}
        onClose={() => setOpenStyle(null)}
        onQueued={refresh}
      />
    </div>
  );
}
