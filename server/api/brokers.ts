import { storage } from '../storage';
import { BrokerPoint, InsertBrokerPoint } from '@shared/schema';

/**
 * Calcula estatísticas para um corretor específico
 */
export async function calculateBrokerStats(brokerId: number): Promise<BrokerPoint | null> {
  try {
    // Obter dados do corretor
    const broker = await storage.getUser(brokerId);
    if (!broker) {
      return null;
    }
    
    // Obter leads do corretor
    const leads = await storage.getLeadsByResponsavelId(brokerId);
    
    // Obter atividades do corretor
    const activities = await storage.getActivitiesByUserId(brokerId);
    
    // Métricas calculadas (implementação simplificada para exemplo)
    const leadsRespondidos1h = 0;
    const leadsVisitados = 0;
    const propostasEnviadas = 0;
    const vendasRealizadas = 0;
    const leadsAtualizadosMesmoDia = 0;
    const feedbackPositivoGestor = 0;
    const leadsSemInteracao24h = 0;
    const leadsRespondidosApos18h = 0;
    const leadsTempoRespostaAcima12h = 0;
    const leadsSemMudancaEtapa5dias = 0;
    const respostaRapida3h = 0;
    
    // Calcular pontos positivos (implementação simplificada)
    const pontos = (
      leadsRespondidos1h * 2 +
      leadsVisitados * 5 +
      propostasEnviadas * 8 +
      vendasRealizadas * 15 +
      leadsAtualizadosMesmoDia * 2 +
      feedbackPositivoGestor * 3 +
      respostaRapida3h * 4
    ) - (
      leadsSemInteracao24h * 3 +
      leadsRespondidosApos18h * 2 +
      leadsTempoRespostaAcima12h * 3 +
      leadsSemMudancaEtapa5dias * 4
    );
    
    // Determinar nível de desempenho
    let nivelDesempenho: 'alto' | 'medio' | 'baixo' = 'medio';
    if (pontos >= 50) {
      nivelDesempenho = 'alto';
    } else if (pontos < 20) {
      nivelDesempenho = 'baixo';
    }
    
    // Criar ou atualizar o registro de pontos
    const brokerPointData: InsertBrokerPoint = {
      id: brokerId,
      nome: broker.nome,
      pontos,
      leads_respondidos_1h: leadsRespondidos1h,
      leads_visitados: leadsVisitados,
      propostas_enviadas: propostasEnviadas,
      vendas_realizadas: vendasRealizadas,
      leads_atualizados_mesmo_dia: leadsAtualizadosMesmoDia,
      feedback_positivo_gestor: feedbackPositivoGestor,
      leads_sem_interacao_24h: leadsSemInteracao24h,
      leads_respondidos_apos_18h: leadsRespondidosApos18h,
      leads_tempo_resposta_acima_12h: leadsTempoRespostaAcima12h,
      leads_sem_mudanca_etapa_5dias: leadsSemMudancaEtapa5dias,
      nivel_desempenho: nivelDesempenho,
      resposta_rapida_3h: respostaRapida3h
    };
    
    return await storage.createOrUpdateBrokerPoints(brokerPointData);
  } catch (error) {
    console.error(`Error calculating broker stats for broker ID ${brokerId}:`, error);
    return null;
  }
}