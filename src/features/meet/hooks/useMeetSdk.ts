import { useCallback, useEffect, useRef, useState } from "react";

import type {
  AddonSession,
  FrameOpenReason,
  FrameToFrameMessage,
  MeetingInfo,
  MeetSidePanelClient,
} from "@googleworkspace/meet-addons";

const SDK_SCRIPT_URL = "https://www.gstatic.com/meetjs/addons/1.0.0/meet.addons.js";

export type SdkStatus = "idle" | "initializing" | "ready" | "error" | "unsupported";

export interface MeetSdkState {
  status: SdkStatus;
  meetingInfo?: MeetingInfo;
  frameOpenReason?: FrameOpenReason;
  events: Array<{
    type: string;
    data?: Record<string, unknown>;
    timestamp: number;
  }>;
  error?: string;
  isActivityActive: boolean;
  /** Diagnostic info about the environment */
  diagnostics: Record<string, string | boolean | undefined>;
}

function loadSdkScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${SDK_SCRIPT_URL}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Meet SDK script from gstatic"));
    document.head.appendChild(script);
  });
}

function getMeetGlobal() {
  // The official SDK sets window.meet.addon
  // The npm package also exports it, but in case bundling breaks it,
  // we fall back to the global.
  const win = window as typeof window & { meet?: { addon?: unknown } };
  return win.meet?.addon ?? null;
}

function isInsideMeetIframe(): boolean {
  try {
    // If we can't access parent, we're in a cross-origin iframe (like Meet)
    return window.self !== window.top;
  } catch {
    return true; // cross-origin = definitely in an iframe
  }
}

export function useMeetSdk(cloudProjectNumber?: string) {
  const [state, setState] = useState<MeetSdkState>({
    status: "idle",
    events: [],
    isActivityActive: false,
    diagnostics: {
      inIframe: isInsideMeetIframe(),
      userAgent: navigator.userAgent.slice(0, 60),
      origin: window.location.origin,
    },
  });

  const clientRef = useRef<MeetSidePanelClient | null>(null);

  const appendEvent = useCallback((event: { type: string; data?: Record<string, unknown> }) => {
    setState((prev) => ({
      ...prev,
      events: [...prev.events, { ...event, timestamp: Date.now() }].slice(-50),
    }));
  }, []);

  const initSdk = useCallback(async () => {
    if (!cloudProjectNumber) {
      setState((prev) => ({
        ...prev,
        status: "unsupported",
        error: "No cloudProjectNumber provided.",
        diagnostics: {
          ...prev.diagnostics,
          cloudProjectNumber: "undefined",
        },
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "initializing",
      error: undefined,
      diagnostics: {
        ...prev.diagnostics,
        cloudProjectNumber,
        step: "checking-global",
      },
    }));

    try {
      // Step 1: Ensure the SDK is loaded
      let globalAddon = getMeetGlobal();
      if (!globalAddon) {
        appendEvent({ type: "DIAG", data: { msg: "Global meet.addon not found, loading script" } });
        await loadSdkScript();
        globalAddon = getMeetGlobal();
      }

      if (!globalAddon) {
        throw new Error(
          "meet.addon not available even after loading script. Not inside a Meet iframe?",
        );
      }

      appendEvent({ type: "DIAG", data: { msg: "Creating addon session", cloudProjectNumber } });

      // Step 2: Create session
      // The npm import might be tree-shaken or not match the global API signature.
      // We call the global directly since the script defines it.
      const session = await (
        globalAddon as {
          createAddonSession: (opts: { cloudProjectNumber: string }) => Promise<AddonSession>;
        }
      ).createAddonSession({
        cloudProjectNumber,
      });

      appendEvent({ type: "DIAG", data: { msg: "Session created, creating side panel client" } });

      const client: MeetSidePanelClient = await session.createSidePanelClient();
      clientRef.current = client;

      // Step 3: Gather initial info
      appendEvent({ type: "DIAG", data: { msg: "Fetching meetingInfo + frameOpenReason" } });
      const [meetingInfo, frameOpenReason] = await Promise.all([
        client.getMeetingInfo(),
        client.getFrameOpenReason(),
      ]);

      // Step 4: Listen for messages from main stage
      client.on("frameToFrameMessage", (message: FrameToFrameMessage) => {
        appendEvent({
          type: "FRAME_TO_FRAME_MESSAGE",
          data: { payload: message.payload },
        });
      });

      setState((prev) => ({
        ...prev,
        status: "ready",
        meetingInfo,
        frameOpenReason,
        diagnostics: {
          ...prev.diagnostics,
          meetingId: meetingInfo.meetingId,
          frameOpenReason,
          step: "ready",
        },
        events: [
          ...prev.events,
          {
            type: "SDK_READY",
            data: {
              meetingId: meetingInfo.meetingId,
              frameOpenReason,
            },
            timestamp: Date.now(),
          },
        ],
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: errorMsg,
        diagnostics: {
          ...prev.diagnostics,
          step: "error",
          error: errorMsg,
          stack: stack?.slice(0, 500),
        },
        events: [
          ...prev.events,
          {
            type: "SDK_ERROR",
            data: {
              message: errorMsg,
              stack: stack?.slice(0, 500),
            },
            timestamp: Date.now(),
          },
        ],
      }));
    }
  }, [cloudProjectNumber, appendEvent]);

  const startActivity = useCallback(
    async (activityState?: {
      sidePanelUrl?: string;
      mainStageUrl?: string;
      additionalData?: string;
    }) => {
      const client = clientRef.current;
      if (!client) {
        appendEvent({
          type: "START_ACTIVITY_FAILED",
          data: { reason: "Client not ready" },
        });
        return;
      }
      try {
        await client.startActivity(activityState);
        setState((prev) => ({ ...prev, isActivityActive: true }));
        appendEvent({ type: "ACTIVITY_STARTED", data: activityState });
      } catch (err) {
        appendEvent({
          type: "START_ACTIVITY_ERROR",
          data: {
            reason: err instanceof Error ? err.message : String(err),
          },
        });
      }
    },
    [appendEvent],
  );

  const endActivity = useCallback(async () => {
    const client = clientRef.current;
    if (!client) {
      appendEvent({
        type: "END_ACTIVITY_FAILED",
        data: { reason: "Client not ready" },
      });
      return;
    }
    try {
      await client.endActivity();
      setState((prev) => ({ ...prev, isActivityActive: false }));
      appendEvent({ type: "ACTIVITY_ENDED" });
    } catch (err) {
      appendEvent({
        type: "END_ACTIVITY_ERROR",
        data: {
          reason: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }, [appendEvent]);

  const notifyMainStage = useCallback(
    async (payload: string) => {
      const client = clientRef.current;
      if (!client) {
        appendEvent({
          type: "NOTIFY_MAIN_STAGE_FAILED",
          data: { reason: "Client not ready", payload },
        });
        return;
      }
      try {
        await client.notifyMainStage(payload);
        appendEvent({ type: "NOTIFY_MAIN_STAGE_SENT", data: { payload } });
      } catch (err) {
        appendEvent({
          type: "NOTIFY_MAIN_STAGE_ERROR",
          data: {
            reason: err instanceof Error ? err.message : String(err),
            payload,
          },
        });
      }
    },
    [appendEvent],
  );

  const closeAddon = useCallback(async () => {
    const client = clientRef.current;
    if (!client) {
      appendEvent({
        type: "CLOSE_ADDON_FAILED",
        data: { reason: "Client not ready" },
      });
      return;
    }
    try {
      await client.closeAddon();
      appendEvent({ type: "CLOSE_ADDON_CALLED" });
    } catch (err) {
      appendEvent({
        type: "CLOSE_ADDON_ERROR",
        data: {
          reason: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }, [appendEvent]);

  useEffect(() => {
    if (cloudProjectNumber && state.status === "idle") {
      void initSdk();
    }
  }, [cloudProjectNumber, state.status, initSdk]);

  return {
    ...state,
    initSdk,
    startActivity,
    endActivity,
    notifyMainStage,
    closeAddon,
  };
}
