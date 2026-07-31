"use client";

import { useCallback, useEffect, useState } from "react";

export type BackendConnectionStatus = "checking" | "online" | "warming" | "offline";

export interface BackendStatus {
  status: BackendConnectionStatus;
  latencyMs: number | null;
  cloudflareAiConfigured: boolean;
  lastCheckedAt: Date | null;
}

const KEEP_ALIVE_INTERVAL_MS = 45_000;
const COLD_START_THRESHOLD_MS = 2_500;
const HEALTH_TIMEOUT_MS = 30_000;

const INITIAL_STATUS: BackendStatus = {
  status: "checking",
  latencyMs: null,
  cloudflareAiConfigured: false,
  lastCheckedAt: null,
};

export function useBackendStatus(baseUrl: string): BackendStatus {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(INITIAL_STATUS);

  const ping = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
    const started = performance.now();

    try {
      const res = await fetch(`${baseUrl}/api/v1/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeout);

      const latencyMs = Math.round(performance.now() - started);

      if (!res.ok) {
        setBackendStatus({
          status: "offline",
          latencyMs,
          cloudflareAiConfigured: false,
          lastCheckedAt: new Date(),
        });
        return;
      }

      const data = await res.json().catch(() => ({}));
      const isColdStart = latencyMs >= COLD_START_THRESHOLD_MS;

      setBackendStatus({
        status: isColdStart ? "warming" : "online",
        latencyMs,
        cloudflareAiConfigured: Boolean(data.cloudflare_ai_configured),
        lastCheckedAt: new Date(),
      });
    } catch {
      clearTimeout(timeout);
      setBackendStatus({
        status: "offline",
        latencyMs: null,
        cloudflareAiConfigured: false,
        lastCheckedAt: new Date(),
      });
    }
  }, [baseUrl]);

  useEffect(() => {
    ping();
    const interval = setInterval(ping, KEEP_ALIVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [ping]);

  return backendStatus;
}
