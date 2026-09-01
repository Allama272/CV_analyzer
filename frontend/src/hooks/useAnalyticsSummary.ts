import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserAuth } from "@/context/AuthContext";
import type { AnalyticsSummaryDto } from "@/types";

const apiUrl: string = import.meta.env.VITE_DEV_SERVER;

export function useAnalyticsSummary() {
  const { session } = UserAuth();
  const [summary, setSummary] = useState<AnalyticsSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/analytics/summary`, {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to fetch analytics.");
        }
        setSummary((await response.json()) as AnalyticsSummaryDto);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? `Failed to load analytics: ${error.message}`
            : "An unexpected error occurred while loading analytics."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [session]);

  return { summary, isLoading };
}