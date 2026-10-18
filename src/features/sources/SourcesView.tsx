"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FlaskConical,
  Loader2,
  Plug,
  PlugZap,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, QueryBoundary, SampleDataBadge } from "@/components/feedback";
import { usePermission } from "@/providers/session-provider";
import { formatBytes, formatDateTime, formatPercent, humanize } from "@/lib/formatters";
import {
  useConnectors,
  useCreateSource,
  useIngestionJobs,
  useLoadDemoData,
  useSources,
  useUpload,
} from "@/features/sources/api";
import type { IngestionJob, Source, SourceState } from "@/api/types";

const ACCEPTED_EXTENSIONS = [".pdf", ".md", ".txt", ".docx", ".html"];
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const STATE_STYLES: Record<SourceState, string> = {
  connected: "text-success border-success/30 bg-success/5",
  disconnected: "text-muted-foreground",
  error: "text-[var(--destructive)] border-[var(--destructive-border)] bg-[var(--destructive-subtle)]",
};

const STATE_ICON: Record<SourceState, React.ComponentType<{ className?: string }>> = {
  connected: CheckCircle2,
  disconnected: Plug,
  error: AlertCircle,
};

export function SourcesView() {
  const canWrite = usePermission("sources:write");
  const canUpload = usePermission("sources:upload");
  const canLoadDemo = usePermission("demo:load");

  const sources = useSources();
  const jobs = useIngestionJobs();
  const connectors = useConnectors();
  const loadDemo = useLoadDemoData();

  const [chosenSourceId, setChosenSourceId] = React.useState<string | null>(null);
  const selectedSourceId = chosenSourceId ?? sources.data?.items[0]?.id ?? null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Knowledge sources</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Connected systems, uploaded documents and the ingestion pipeline that turns them into
            knowledge.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canLoadDemo && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              disabled={loadDemo.isPending}
              onClick={() =>
                loadDemo.mutate(undefined, {
                  onSuccess: (result) =>
                    toast.success(
                      result.jobs.length > 0
                        ? `Demonstration data queued: ${result.jobs.length} ingestion ${
                            result.jobs.length === 1 ? "job" : "jobs"
                          }.`
                        : "Demonstration data loaded.",
                    ),
                })
              }
            >
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              {loadDemo.isPending ? "Loading…" : "Load demonstration data"}
            </Button>
          )}
          {canWrite && <CreateSourceDialog />}
        </div>
      </header>

      <Tabs defaultValue="sources">
        <TabsList>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="jobs">Ingestion</TabsTrigger>
          <TabsTrigger value="connectors">Connectors</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="mt-4">
          <QueryBoundary
            query={sources}
            errorTitle="Could not load sources"
            isEmpty={(page) => page.items.length === 0}
            empty={
              <EmptyState
                icon={<Database className="h-4 w-4" />}
                title="No sources yet"
                description="Create a source, then upload documents into it to start building the knowledge graph."
              />
            }
          >
            {(page) => <SourceTable sources={page.items} />}
          </QueryBoundary>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          {canUpload ? (
            <UploadPanel
              sources={sources.data?.items ?? []}
              selectedSourceId={selectedSourceId}
              onSelectSource={setChosenSourceId}
            />
          ) : (
            <EmptyState
              icon={<UploadCloud className="h-4 w-4" />}
              title="Uploading is not available to you"
              description="Your role does not include sources:upload. An administrator can grant it."
            />
          )}
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <QueryBoundary
            query={jobs}
            errorTitle="Could not load ingestion jobs"
            isEmpty={(page) => page.items.length === 0}
            empty={
              <EmptyState
                title="No ingestion jobs"
                description="Jobs appear here as soon as a document is uploaded."
              />
            }
          >
            {(page) => <JobTable jobs={page.items} />}
          </QueryBoundary>
        </TabsContent>

        <TabsContent value="connectors" className="mt-4">
          <ConnectorCatalog query={connectors} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SourceTable({ sources }: { sources: Source[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="text-[11px] hover:bg-transparent">
              <TableHead>Source</TableHead>
              <TableHead className="w-[110px]">Type</TableHead>
              <TableHead className="w-[140px]">State</TableHead>
              <TableHead className="w-[180px]">Last sync</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {sources.map((source) => {
              const StateIcon = STATE_ICON[source.state] ?? Plug;
              return (
                <TableRow key={source.id}>
                  <TableCell className="font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      {source.name}
                      {source.isSampleData && <SampleDataBadge />}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {humanize(source.type)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${STATE_STYLES[source.state] ?? ""}`}>
                      <StateIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                      {humanize(source.state)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    {source.lastSync ? formatDateTime(source.lastSync) : "Never"}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {source.errorSummary ?? "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CreateSourceDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const createSource = useCreateSource();

  return (
    <>
      <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <Database className="h-3.5 w-3.5" aria-hidden="true" />
        New source
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an upload source</DialogTitle>
            <DialogDescription>
              Documents are uploaded into a source, which owns their access control.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="source-name" className="text-xs">
              Name
            </Label>
            <Input
              id="source-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Engineering handbook"
              className="h-9 text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!name.trim() || createSource.isPending}
              onClick={() =>
                createSource.mutate(
                  { name: name.trim(), type: "upload" },
                  {
                    onSuccess: (source) => {
                      toast.success(`Source "${source.name}" created.`);
                      setName("");
                      setOpen(false);
                    },
                  },
                )
              }
            >
              {createSource.isPending ? "Creating…" : "Create source"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UploadPanel({
  sources,
  selectedSourceId,
  onSelectSource,
}: {
  sources: Source[];
  selectedSourceId: string | null;
  onSelectSource: (id: string) => void;
}) {
  const { entries, upload, clear, isUploading } = useUpload(selectedSourceId);
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);

    const tooLarge = files.filter((file) => file.size > MAX_UPLOAD_BYTES);
    if (tooLarge.length > 0) {
      toast.error(
        `${tooLarge.length === 1 ? "That file is" : "Those files are"} larger than ${formatBytes(
          MAX_UPLOAD_BYTES,
        )}.`,
      );
    }
    const accepted = files.filter((file) => file.size <= MAX_UPLOAD_BYTES);
    if (accepted.length > 0) void upload(accepted);
  };

  if (sources.length === 0) {
    return (
      <EmptyState
        icon={<Database className="h-4 w-4" />}
        title="Create a source first"
        description="Documents are uploaded into a source. Create one to enable uploads."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="upload-source" className="text-xs">
            Upload into
          </Label>
          <Select value={selectedSourceId ?? undefined} onValueChange={onSelectSource}>
            <SelectTrigger id="upload-source" className="h-9 w-56 text-xs">
              <SelectValue placeholder="Select a source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.id} value={source.id} className="text-xs">
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {entries.length > 0 && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clear}>
            Clear list
          </Button>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border bg-card/50"
        }`}
      >
        <UploadCloud className="mb-2 h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Drop documents here</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {ACCEPTED_EXTENSIONS.join(", ")} up to {formatBytes(MAX_UPLOAD_BYTES)} each
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3 h-8 text-xs"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(",")}
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {entries.length > 0 && (
        <Card>
          <CardHeader className="border-b border-border p-4">
            <CardTitle className="text-sm font-semibold">This upload</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border text-xs">
              {entries.map((entry) => (
                <li key={entry.key} className="flex items-center justify-between gap-3 p-3">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">
                      {entry.file.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatBytes(entry.file.size)}
                      {entry.jobId ? ` · job ${entry.jobId}` : ""}
                    </span>
                    {entry.error && (
                      <span className="mt-0.5 block text-[11px] text-[var(--destructive)]">
                        {entry.error}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0">
                    {entry.status === "uploading" && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-label="Uploading" />
                    )}
                    {entry.status === "accepted" && (
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                        <Link href={`/sources/${entry.jobId}`}>Track job</Link>
                      </Button>
                    )}
                    {entry.status === "failed" && (
                      <XCircle className="h-3.5 w-3.5 text-[var(--destructive)]" aria-label="Failed" />
                    )}
                    {entry.status === "pending" && (
                      <span className="font-mono text-[10px] text-muted-foreground">Queued</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const JOB_STATUS_STYLES: Record<string, string> = {
  queued: "text-muted-foreground",
  running: "text-primary border-primary/30 bg-primary/5",
  done: "text-success border-success/30 bg-success/5",
  failed: "text-[var(--destructive)] border-[var(--destructive-border)] bg-[var(--destructive-subtle)]",
};

function JobTable({ jobs }: { jobs: IngestionJob[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="text-[11px] hover:bg-transparent">
              <TableHead>Job</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[140px]">Stage</TableHead>
              <TableHead className="w-[110px] text-right">Progress</TableHead>
              <TableHead className="w-[180px]">Created</TableHead>
              <TableHead className="w-[90px]" />
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-[11px] text-foreground">
                  <span className="flex items-center gap-2">
                    {job.id}
                    {job.isSampleData && <SampleDataBadge />}
                  </span>
                  {job.error && (
                    <span className="mt-0.5 block font-sans text-[11px] text-[var(--destructive)]">
                      {job.error}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] ${JOB_STATUS_STYLES[job.status] ?? ""}`}>
                    {job.status === "running" && (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden="true" />
                    )}
                    {humanize(job.status)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {humanize(job.stage)}
                </TableCell>
                <TableCell className="text-right font-mono text-[11px] tabular-nums">
                  {job.progress === undefined ? "-" : formatPercent(job.progress)}
                </TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {formatDateTime(job.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                    <Link href={`/sources/${job.id}`}>Open</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ConnectorCatalog({ query }: { query: ReturnType<typeof useConnectors> }) {
  if (query.isError) {
    return (
      <EmptyState
        icon={<Plug className="h-4 w-4" />}
        title="No connector catalog"
        description="This deployment does not expose a connector catalog. Documents are ingested by upload."
      />
    );
  }

  return (
    <QueryBoundary
      query={query}
      errorTitle="Could not load connectors"
      isEmpty={(data) => data.items.length === 0}
      empty={
        <EmptyState
          icon={<Plug className="h-4 w-4" />}
          title="No connectors listed"
          description="Nothing is published in the connector catalog yet."
        />
      }
    >
      {(data) => (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((connector) => {
            const planned = connector.state === "planned";
            return (
              <Card
                key={connector.id}
                aria-disabled={planned}
                className={`p-4 ${planned ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2">
                    {planned ? (
                      <Plug className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <PlugZap className="h-4 w-4 text-success" aria-hidden="true" />
                    )}
                    <span className="text-sm font-medium text-foreground">{connector.name}</span>
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {planned ? "Planned" : "Available"}
                  </Badge>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {planned
                    ? "Not implemented yet. It cannot be connected."
                    : "Available in this deployment."}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 h-7 w-full text-xs"
                  disabled={planned}
                  onClick={() => toast.info("Connector setup is handled by an administrator.")}
                >
                  {planned ? "Planned" : "Connect"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </QueryBoundary>
  );
}
