import { useQuery } from "@tanstack/react-query";
import { api } from '../api/client';

export function useAnalytics(days = 30) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return useQuery({
    queryKey: ['analytics', { days, tz }],
    queryFn: () =>
      api.get(`/analytics?days=${days}&tz=${encodeURIComponent(tz)}`),
    staleTime: 1000 * 60 * 2,
  });
}
