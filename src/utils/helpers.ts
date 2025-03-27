import moment from "moment";

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
 * Ordena registros com base no tipo ou na data.
 * @param records - A lista de registros.
 * @param sortByDate - Define se a ordenação será feita pela data.
 * @returns A lista de registros ordenada.
 */
export const sortRecords = (records: any[], sortByDate: boolean = false) => {
  if (sortByDate) {
    return records.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
  return records.sort((a, b) => {
    if (a.recordType === RECORD_TYPES.TIME) {
      return a.recordValue.localeCompare(b.recordValue);
    } else if (a.recordType === RECORD_TYPES.REPS) {
      return parseInt(b.recordValue) - parseInt(a.recordValue);
    } else if (a.recordType === RECORD_TYPES.WEIGHT) {
      const [aValue, aUnit] = a.recordValue.split(" ");
      const [bValue, bUnit] = b.recordValue.split(" ");
      return (
        convertWeightToKg(bValue, bUnit) - convertWeightToKg(aValue, aUnit)
      );
    }
    return 0;
  });
};

/**
 * Obtém o índice do melhor registro em uma lista.
 * @param records - A lista de registros.
 * @returns O índice do melhor registro ou -1 se a lista estiver vazia.
 */
export const getBestRecordIndex = (records: any[]): number => {
  if (!records.length) return -1;
  const sorted = sortRecords([...records]);
  return records.indexOf(sorted[0]);
};
