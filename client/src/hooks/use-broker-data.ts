import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHeatmapData, getConversionFunnelData, getBrokers, getDashboardStats, getFeaturedProperties } from '@/lib/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 300000, // 5 minutes
  });
}

export function useBrokers() {
  return useQuery({
    queryKey: ['/api/brokers'],
    refetchInterval: 300000, // 5 minutes
  });
}

export function useHeatmapData() {
  return useQuery({
    queryKey: ['/api/heatmap'],
    refetchInterval: 600000, // 10 minutes
  });
}

export function useConversionFunnelData() {
  return useQuery({
    queryKey: ['/api/conversion-funnel'],
    refetchInterval: 600000, // 10 minutes
  });
}

export function useFeaturedProperties(limit: number = 4) {
  return useQuery({
    queryKey: [`/api/properties/featured?limit=${limit}`],
    refetchInterval: 600000, // 10 minutes
  });
}

export function useDashboardData() {
  const queryClient = useQueryClient();

  const dashboardStats = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: getDashboardStats,
    refetchInterval: 300000, // 5 minutes
  });

  const brokers = useQuery({
    queryKey: ['/api/brokers'],
    queryFn: getBrokers,
    refetchInterval: 300000, // 5 minutes
  });

  const heatmapData = useQuery({
    queryKey: ['/api/heatmap'],
    queryFn: getHeatmapData,
    refetchInterval: 600000, // 10 minutes
  });

  const conversionFunnel = useQuery({
    queryKey: ['/api/conversion-funnel'],
    queryFn: getConversionFunnelData,
    refetchInterval: 600000, // 10 minutes
  });

  const featuredProperties = useQuery({
    queryKey: ['/api/properties/featured'],
    queryFn: () => getFeaturedProperties(4),
    refetchInterval: 600000, // 10 minutes
  });

  const refreshAllData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/brokers'] });
    queryClient.invalidateQueries({ queryKey: ['/api/heatmap'] });
    queryClient.invalidateQueries({ queryKey: ['/api/conversion-funnel'] });
    queryClient.invalidateQueries({ queryKey: ['/api/properties/featured'] });
  };

  return {
    dashboardStats,
    brokers,
    heatmapData,
    conversionFunnel,
    featuredProperties,
    refreshAllData,
    isLoading: 
      dashboardStats.isLoading || 
      brokers.isLoading || 
      heatmapData.isLoading || 
      conversionFunnel.isLoading || 
      featuredProperties.isLoading
  };
}
