import moment from "moment";
import type { WorkoutRecord } from "../types/records";

export const WEIGHT_UNITS = {
  KG: "KG",
  LB: "LB",
} as const;

export const RECORD_TYPES = {
  TIME: "TIME",
  WEIGHT: "WEIGHT",
  REPS: "REPS",
} as const;

export const TOAST_DURATION = 3000;

/**
 * Formata uma string de tempo no formato HH:MM:SS.
 * @param value - A string de entrada contendo números.
 * @returns A string formatada no formato HH:MM:SS.
 */
export const formatTimeInput = (value: string): string => {
  value = value.replace(/\D/g, "");
  if (value.length <= 2) return value;
  if (value.length <= 4) return `${value.slice(0, 2)}:${value.slice(2)}`;
  return `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}`;
};

/**
 * Formata uma data no formato DD/MM/YYYY.
 * @param date - A data no formato string ou Date.
 * @returns A data formatada como string.
 */
export const formatDate = (date: string | Date): string => {
  return moment(date).format("DD/MM/YYYY");
};

/**
 * Converte "HH:MM:SS", "MM:SS" ou "SS" para segundos.
 * Retorna NaN para valores inválidos.
 */
export const timeToSeconds = (value: string): number => {
  const parts = value.split(":").map((p) => parseInt(p, 10));
  if (parts.some((p) => Number.isNaN(p))) return NaN;
  return parts.reduce((total, part) => total * 60 + part, 0);
};

/**
 * Formata segundos como "HH:MM:SS" (ou "MM:SS" quando menor que 1h).
 */
export const secondsToTime = (totalSeconds: number): string => {
  if (!Number.isFinite(totalSeconds)) return "";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Converte um peso para quilogramas (kg).
 * @param value - O valor do peso como string.
 * @param unit - A unidade do peso (KG ou LB).
 * @returns O peso convertido em quilogramas.
 */
export const convertWeightToKg = (value: string, unit: string): number => {
  return unit === WEIGHT_UNITS.LB
    ? parseFloat(value) * 0.453592
    : parseFloat(value);
};

/**
 * Extrai o valor numérico de um registro para ordenação e gráficos.
 * TIME retorna segundos, WEIGHT retorna kg, REPS retorna o inteiro.
 */
export const recordNumericValue = (record: WorkoutRecord): number => {
  if (record.recordType === RECORD_TYPES.TIME) {
    return timeToSeconds(record.recordValue);
  }
  if (record.recordType === RECORD_TYPES.WEIGHT) {
    const [value, unit] = record.recordValue.split(" ");
    return convertWeightToKg(value, unit);
  }
  return parseInt(record.recordValue, 10);
};

/**
 * Ordena registros com base no tipo ou na data.
 * Não muta a lista original — sempre retorna uma cópia ordenada.
 * @param records - A lista de registros.
 * @param sortByDate - Define se a ordenação será feita pela data.
 * @returns Nova lista de registros ordenada.
 */
export const sortRecords = (
  records: WorkoutRecord[],
  sortByDate: boolean = false
): WorkoutRecord[] => {
  const copy = [...records];
  if (sortByDate) {
    return copy.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
  return copy.sort((a, b) => {
    if (a.recordType === RECORD_TYPES.TIME) {
      // Menor tempo = melhor
      return recordNumericValue(a) - recordNumericValue(b);
    }
    // Maior peso/reps = melhor
    return recordNumericValue(b) - recordNumericValue(a);
  });
};

/**
 * Obtém o índice do melhor registro em uma lista.
 * @param records - A lista de registros.
 * @returns O índice do melhor registro ou -1 se a lista estiver vazia.
 */
export const getBestRecordIndex = (records: WorkoutRecord[]): number => {
  if (!records.length) return -1;
  const sorted = sortRecords(records);
  return records.indexOf(sorted[0]);
};
