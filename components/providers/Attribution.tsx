"use client";

import { useEffect } from "react";

export const ATTRIBUTION_KEY = "andy:attrib";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing?: string;
  referrer?: string;
}

/** Guarda UTMs, página de entrada y referrer de la primera visita de la sesión. */
export function AttributionCapture() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(ATTRIBUTION_KEY)) return;
      const p = new URLSearchParams(location.search);
      const data: Attribution = {
        utm_source: p.get("utm_source") ?? undefined,
        utm_medium: p.get("utm_medium") ?? undefined,
        utm_campaign: p.get("utm_campaign") ?? undefined,
        landing: location.pathname,
        referrer: document.referrer ? new URL(document.referrer).hostname : undefined,
      };
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(data));
    } catch {
      /* storage bloqueado: seguimos sin atribución */
    }
  }, []);
  return null;
}

export function readAttribution(): Attribution {
  try {
    return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) ?? "{}");
  } catch {
    return {};
  }
}
