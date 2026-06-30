"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { TransactionFilters } from "@/types";
import * as api from "@/lib/api/mock";

/** Cursor-paginated, filtered transaction list (infinite query). */
export function useTransactions(filters: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: ["transactions", filters],
    queryFn: ({ pageParam }) => api.getTransactions(filters, pageParam, 25),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 30,
  });
}

export function useTransaction(signature: string | null) {
  return useQuery({
    queryKey: ["transaction", signature],
    queryFn: () => api.getTransaction(signature!),
    enabled: !!signature,
    staleTime: 1000 * 60 * 60, // confirmed txs are immutable
  });
}
