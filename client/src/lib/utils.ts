import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Função utilitária para mesclar classes condicionalmente e
 * resolver conflitos entre classes do Tailwind CSS.
 * Utiliza clsx para juntar classes e twMerge para resolver conflitos.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(date: Date | string | number, formatStr: string = "dd/MM/yyyy HH:mm") {
  if (!date) return "N/A";
  return format(new Date(date), formatStr, { locale: ptBR });
}

/**
 * Formata valores monetários
 */
export function formatCurrency(value: number): string {
  if (value === undefined || value === null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Calcula a variação percentual entre dois valores
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Determina o nível de desempenho com base na pontuação
 */
export function getPerformanceLevel(points: number): "alto" | "medio" | "baixo" {
  if (points >= 50) return "alto";
  if (points >= 20) return "medio";
  return "baixo";
}

/**
 * Retorna a cor associada ao nível de desempenho
 */
export function getPerformanceColor(level: "alto" | "medio" | "baixo"): string {
  switch (level) {
    case "alto":
      return "bg-green-500 text-white";
    case "medio":
      return "bg-yellow-500 text-white";
    case "baixo":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

/**
 * Retorna o rótulo para o nível de desempenho
 */
export function getPerformanceLabel(level: "alto" | "medio" | "baixo"): string {
  switch (level) {
    case "alto":
      return "Alto";
    case "medio":
      return "Médio";
    case "baixo":
      return "Baixo";
    default:
      return "Indefinido";
  }
}