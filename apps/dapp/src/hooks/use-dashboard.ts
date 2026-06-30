"use client";

import { useQuery } from "@tanstack/react-query";
import type { TimeRange } from "@/types";
import * as api from "@/lib/api/mock";
import { getPrices } from "@/lib/api/jupiter";

const STALE_CHAIN = 1000 * 30;
const STALE_STATS = 1000 * 60;

export const useOverviewStats = () =>
  useQuery({ queryKey: ["stats", "overview"], queryFn: api.getOverviewStats, staleTime: STALE_STATS });

export const useProofsTimeseries = (range: TimeRange) =>
  useQuery({
    queryKey: ["stats", "timeseries", range],
    queryFn: () => api.getProofsTimeseries(range),
    staleTime: STALE_STATS,
  });

export const useCuByType = () =>
  useQuery({ queryKey: ["stats", "cu"], queryFn: api.getCuByType, staleTime: STALE_STATS });

export const useProofDistribution = () =>
  useQuery({ queryKey: ["stats", "distribution"], queryFn: api.getProofDistribution, staleTime: STALE_STATS });

export const useActiveProofs = () =>
  useQuery({ queryKey: ["proofs", "active"], queryFn: api.getActiveProofs, staleTime: STALE_CHAIN });

export const useRecentActivity = (limit = 5) =>
  useQuery({ queryKey: ["activity", limit], queryFn: () => api.getRecentActivity(limit), staleTime: STALE_CHAIN });

export const useAnnouncements = () =>
  useQuery({ queryKey: ["announcements"], queryFn: api.getAnnouncements, staleTime: 1000 * 300 });

/** Jupiter USD prices for a set of mints (cached 60s). */
export const usePrices = (mints: string[]) =>
  useQuery({
    queryKey: ["prices", [...mints].sort()],
    queryFn: () => getPrices(mints),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });
