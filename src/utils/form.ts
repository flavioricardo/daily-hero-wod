import { Dispatch, SetStateAction } from "react";
import { RECORD_TYPES, WEIGHT_UNITS } from "./helpers";
import { Moment } from "moment";

// Limpa os campos do formulário
export const clearFields = (
  setWorkout: Dispatch<SetStateAction<string>>,
  setRecordType: Dispatch<SetStateAction<keyof typeof RECORD_TYPES>>,
  setRecordValue: Dispatch<SetStateAction<string>>,
  setWeightUnit: Dispatch<SetStateAction<keyof typeof WEIGHT_UNITS>>,
  setRecordDate: Dispatch<SetStateAction<Moment | null>>,
  setIsTypeReadOnly: Dispatch<SetStateAction<boolean>>
) => {
  setWorkout("");
  setRecordType(RECORD_TYPES.TIME);
  setRecordValue("");
  setWeightUnit(WEIGHT_UNITS.KG);
  setRecordDate(null);
  setIsTypeReadOnly(false);
};
