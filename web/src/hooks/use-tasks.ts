"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { api, FetchTasksParams } from "@/lib/api";
import { PaginatedTasks } from "@/types";

export function useTasks(initialParams: FetchTasksParams = {}) {
  const [tasks, setTasks] = useState<PaginatedTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<FetchTasksParams>(initialParams);
  const isMounted = useRef(true);

  const fetchTasks = useCallback(async (currentParams: FetchTasksParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks(currentParams);
      if (isMounted.current) {
        setTasks(data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchTasks(params);
    return () => {
      isMounted.current = false;
    };
  }, [params, fetchTasks]);

  const updateParams = useCallback((newParams: Partial<FetchTasksParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      page: newParams.page !== undefined ? newParams.page : 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchTasks(params);
  }, [fetchTasks, params]);

  return {
    tasks,
    loading,
    error,
    params,
    updateParams,
    setPage,
    refresh,
  };
}
