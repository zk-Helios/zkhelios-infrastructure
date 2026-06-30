"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api/mock";

export const useLatestProofs = () =>
  useQuery({ queryKey: ["explorer", "proofs"], queryFn: () => api.getLatestProofs(10), refetchInterval: 15_000 });

export const useLatestTransactions = () =>
  useQuery({ queryKey: ["explorer", "txs"], queryFn: () => api.getLatestTransactions(10), refetchInterval: 15_000 });

export const useLeaderboard = () =>
  useQuery({ queryKey: ["explorer", "leaderboard"], queryFn: () => api.getLeaderboard(10), staleTime: 60_000 });

export const useExplorerProof = (id: string) =>
  useQuery({ queryKey: ["explorer", "proof", id], queryFn: () => api.getProofById(id), enabled: !!id });

export const useAddressOverview = (pubkey: string) =>
  useQuery({ queryKey: ["explorer", "address", pubkey], queryFn: () => api.getAddressOverview(pubkey), enabled: !!pubkey });

export const useProgramOverview = (programId: string) =>
  useQuery({ queryKey: ["explorer", "program", programId], queryFn: () => api.getProgramOverview(programId), enabled: !!programId });
