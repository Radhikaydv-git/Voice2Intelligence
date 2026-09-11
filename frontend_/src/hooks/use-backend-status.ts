import { useQuery } from "@tanstack/react-query";
import { checkBackend } from "@/lib/api";

export function useBackendStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ["backend-status"],
    queryFn: checkBackend,
    refetchInterval: 30_000,
    retry: false,
  });

  return { connected: data === true, checking: isLoading };
}
