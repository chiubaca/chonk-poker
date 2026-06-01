import { useState } from "react";

import { createFileRoute, Link } from "@tanstack/react-router";

import { authClient } from "@/features/auth/hooks/auth-client";
import { useMeetSdk } from "@/features/meet/hooks/useMeetSdk";

const HARDCODED_PROJECT_NUMBER = "947535178278";
const CLOUD_PROJECT_NUMBER =
  (import.meta.env.VITE_MEET_CLOUD_PROJECT_NUMBER as string | undefined) ??
  HARDCODED_PROJECT_NUMBER;

export const Route = createFileRoute("/meet/sidepanel")({
  component: RouteComponent,
});

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    idle: "bg-base-300",
    initializing: "bg-info animate-pulse",
    ready: "bg-success",
    error: "bg-error",
    unsupported: "bg-warning",
  };
  return <span className={`w-2 h-2 rounded-full ${colorMap[status] ?? "bg-base-300"}`} />;
}

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();
  const {
    status,
    meetingInfo,
    frameOpenReason,
    events,
    error,
    isActivityActive,
    diagnostics,
    initSdk,
    startActivity,
    endActivity,
    notifyMainStage,
    closeAddon,
  } = useMeetSdk(CLOUD_PROJECT_NUMBER);

  const [notifyPayload, setNotifyPayload] = useState('{"hello":"from side panel"}');
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const isReady = status === "ready";

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-4 py-3 border-b-2 border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">😸</span>
            <h1 className="font-black text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chonk Poker
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot status={status} />
            <span className="text-[10px] font-mono uppercase opacity-60">{status}</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* SDK Status Card */}
        <div className="card bg-base-200 border-2 border-base-300 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold opacity-60 uppercase tracking-wider">
              Meet SDK Status
            </h2>
            <button
              type="button"
              className="text-[10px] btn btn-xs btn-ghost"
              onClick={() => setShowDiagnostics((v) => !v)}
            >
              {showDiagnostics ? "Hide" : "Show"} diagnostics
            </button>
          </div>

          {status === "idle" && <div className="text-sm opacity-70">Waiting to initialize...</div>}

          {status === "initializing" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="loading loading-spinner loading-xs text-info" />
              <span className="opacity-70">Initializing SDK...</span>
            </div>
          )}

          {status === "unsupported" && (
            <div className="text-sm text-warning">
              <p className="font-bold">No cloudProjectNumber configured</p>
              <p className="text-xs opacity-60 mt-1">
                Set{" "}
                <code className="font-mono bg-base-300 px-1 rounded">
                  VITE_MEET_CLOUD_PROJECT_NUMBER
                </code>{" "}
                to test inside Meet.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-sm text-error">
              <p className="font-bold">SDK Error</p>
              <p className="text-xs opacity-70 mt-1 break-all">{error}</p>
              <p className="text-xs opacity-50 mt-1">
                {diagnostics.inIframe
                  ? "Inside iframe — this should work. Check console for details."
                  : "Not inside an iframe — SDK only works inside Google Meet."}
              </p>
              <button
                type="button"
                className="btn btn-xs btn-ghost mt-2"
                onClick={() => void initSdk()}
              >
                Retry
              </button>
            </div>
          )}

          {isReady && (
            <div className="text-sm text-success">
              <p className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                SDK Ready
              </p>
            </div>
          )}

          {/* Diagnostics Panel */}
          {showDiagnostics && (
            <div className="mt-2 p-2 bg-base-300/40 rounded-xl">
              <h3 className="text-[10px] font-bold opacity-50 uppercase mb-1">Diagnostics</h3>
              <div className="space-y-0.5 text-[10px] font-mono opacity-70">
                {Object.entries(diagnostics).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="opacity-50">{key}</span>
                    <span className="truncate max-w-[180px]">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Meeting Info (only when ready) */}
        {isReady && meetingInfo && (
          <div className="card bg-success/10 border-2 border-success/30 rounded-2xl p-3">
            <h2 className="text-xs font-bold text-success mb-2 uppercase tracking-wider">
              Meeting Info
            </h2>
            <div className="space-y-1 text-xs font-mono opacity-80">
              <div className="flex justify-between">
                <span className="opacity-50">meetingId</span>
                <span className="truncate max-w-[140px]">{meetingInfo.meetingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-50">openReason</span>
                <span>{frameOpenReason ?? "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Demo Actions */}
        <div className="card bg-base-200 border-2 border-base-300 rounded-2xl p-3">
          <h2 className="text-xs font-bold opacity-60 mb-3 uppercase tracking-wider">
            Demo Actions
          </h2>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="btn btn-sm btn-primary w-full rounded-xl font-bold"
              onClick={() =>
                void startActivity({
                  additionalData: JSON.stringify({ roomId: "DEMO123" }),
                })
              }
              disabled={!isReady || isActivityActive}
            >
              {isActivityActive ? "Activity Active" : "Start Activity"}
            </button>

            <button
              type="button"
              className="btn btn-sm btn-warning w-full rounded-xl font-bold"
              onClick={() => void endActivity()}
              disabled={!isReady || !isActivityActive}
            >
              End Activity
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                className="input input-sm input-bordered flex-1 rounded-xl text-xs font-mono"
                placeholder="notifyMainStage payload"
                value={notifyPayload}
                onChange={(e) => setNotifyPayload(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-sm btn-secondary rounded-xl font-bold"
                onClick={() => void notifyMainStage(notifyPayload)}
                disabled={!isReady}
              >
                Send
              </button>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-ghost w-full rounded-xl opacity-70 hover:opacity-100"
              onClick={() => void closeAddon()}
              disabled={!isReady}
            >
              Close Add-on
            </button>
          </div>
        </div>

        {/* User Status */}
        {isPending ? (
          <div className="flex items-center justify-center py-4">
            <span className="loading loading-spinner loading-sm text-primary" />
          </div>
        ) : session ? (
          <div className="card bg-base-200 border-2 border-base-300 rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold border-2 border-primary/50">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm">{session.user.name}</p>
                <p className="text-xs opacity-50">Signed in</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-warning/10 border-2 border-warning/30 rounded-2xl p-3">
            <p className="text-sm font-bold text-warning">Not signed in</p>
            <p className="text-xs opacity-60 mt-1">Sign in to use Chonk Poker in Meet</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="flex flex-col gap-2">
          <Link
            to="/"
            className="btn btn-primary btn-sm w-full rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-bold"
          >
            <span className="text-lg">+</span>
            Create Room
          </Link>
          <Link
            to="/"
            className="btn btn-secondary btn-sm w-full rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-bold"
          >
            Join Room
          </Link>
        </div>

        {/* Event Log */}
        <div className="card bg-base-200 border-2 border-base-300 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold opacity-60 uppercase tracking-wider">SDK Event Log</h2>
            <span className="text-[10px] opacity-40 font-mono">{events.length} events</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {events.length === 0 && (
              <p className="text-xs opacity-40 text-center py-2">No events yet</p>
            )}
            {events.map((evt, i) => (
              <div key={i} className="text-[10px] font-mono bg-base-300/30 rounded-lg px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className="opacity-40">
                    {new Date(evt.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </span>
                  <span className="font-bold text-primary">{evt.type}</span>
                </div>
                {evt.data && (
                  <pre className="mt-0.5 opacity-60 break-all whitespace-pre-wrap">
                    {JSON.stringify(evt.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div className="card bg-base-200 border-2 border-base-300 rounded-2xl p-3 opacity-60">
          <p className="text-[10px] font-mono">
            Route: /meet/sidepanel
            <br />
            Frame: sidepanel
            <br />
            SDK: @googleworkspace/meet-addons
            <br />
            Mode: prototype
          </p>
        </div>
      </div>
    </div>
  );
}
