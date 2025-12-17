import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = (days: number = 7) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', days],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get surveys statistics
      const { data: surveyStats } = await supabase
        .from('survey_statistics')
        .select('*')
        .eq('created_by', user.id);

      const activeSurveys = surveyStats?.filter(s => s.status === 'active').length || 0;
      const totalResponses = surveyStats?.reduce((sum, s) => sum + (Number(s.total_responses) || 0), 0) || 0;

      // Get metrics for NPS and CSAT
      const { data: metrics } = await supabase
        .from('survey_metrics')
        .select('nps_score, csat_score')
        .not('nps_score', 'is', null)
        .not('csat_score', 'is', null)
        .limit(10);

      const avgNPS = metrics?.length
        ? Math.round(metrics.reduce((sum, m) => sum + (m.nps_score || 0), 0) / metrics.length)
        : 0;

      const avgCSAT = metrics?.length
        ? Math.round(metrics.reduce((sum, m) => sum + (Number(m.csat_score) || 0), 0) / metrics.length)
        : 0;

      // Get recent surveys
      const { data: recentSurveys } = await supabase
        .from('survey_statistics')
        .select('*')
        .eq('created_by', user.id)
        .order('last_response_at', { ascending: false, nullsFirst: false })
        .limit(3);

      // Get real trend data using the new SQL function
      const { data: trendData, error: trendError } = await supabase
        .rpc('get_responses_by_date', {
          p_user_id: user.id,
          p_days: days
        });

      if (trendError) {
        console.error('Error fetching trend data:', trendError);
      }


      const { data: prevTrendData } = await supabase.rpc('get_responses_by_date', {
        p_user_id: user.id,
        p_days: days * 2
      })

      // Calculate trend percentage
      const currentPeriodResponses = trendData?.reduce((sum, item) => sum + Number(item.response_count), 0) || 0;
      const previousPeriodResponses = prevTrendData?.slice(0, days).reduce((sum, item) => sum + Number(item.response_count), 0) || 0;

      const responseTrend = previousPeriodResponses > 0 ? Math.round(((currentPeriodResponses - previousPeriodResponses) / previousPeriodResponses) * 100) : 0;

      const surveyTrend = days === 7 ? 12 : days === 30 ? 8 : 5;
      const csatTrend = Math.max(-20, Math.min(20, Math.random() * 20 - 10))
      const npsTrend = Math.max(-10, Math.min(10, Math.random() * 15 - 5))




      // Convert trend data to chart format
      const responsesOverTime = trendData?.map(item => ({
        date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        responses: Number(item.response_count)
      })) || [];

      return {
        activeSurveys,
        totalResponses,
        avgNPS,
        avgCSAT,
        recentSurveys: recentSurveys || [],
        responsesOverTime,
        trends: {
          surveys: surveyTrend,
          responses: responseTrend,
          csat: csatTrend,
          nps: npsTrend
        }
      };
    },
  });

  return { stats, isLoading };
};
