import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { SelectChangeEvent } from "@mui/material";
import { Moment } from "moment";
import { WEIGHT_UNITS, RECORD_TYPES, formatTimeInput } from "../utils/helpers";

const RecordForm = ({
  workoutOptions,
  workout,
  recordType,
  recordValue,
  weightUnit,
  recordDate,
  isTypeReadOnly,
  onWorkoutChange,
  onRecordTypeChange,
  onRecordValueChange,
  onWeightUnitChange,
  onRecordDateChange,
  onAddRecord,
}: {
  workoutOptions: { name: string; category: string }[];
  workout: string;
  recordType: keyof typeof RECORD_TYPES;
  recordValue: string;
  weightUnit: keyof typeof WEIGHT_UNITS;
  recordDate: Moment | null;
  isTypeReadOnly: boolean;
  onWorkoutChange: (event: any, value: string | null) => void;
  onRecordTypeChange: (event: SelectChangeEvent<any>) => void;
  onRecordValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onWeightUnitChange: (event: SelectChangeEvent<any>) => void;
  onRecordDateChange: (newValue: Moment | null) => void;
  onAddRecord: () => void;
}) => {
  return (
    <Stack spacing={3}>
      <Autocomplete
        freeSolo
        options={workoutOptions}
        groupBy={(option) =>
          typeof option === "string" ? "Custom" : option.category
        }
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        value={
          workoutOptions.find((w) => w.name === workout) || {
            name: workout,
            category: "Custom",
          }
        }
        onChange={(_event, newValue) => {
          let name = "";
          if (typeof newValue === "string") {
            name = newValue;
          } else if (
            newValue &&
            typeof newValue === "object" &&
            "name" in newValue
          ) {
            name = newValue.name;
          }
          onWorkoutChange(_event, name);
        }}
        onInputChange={(_event, value) => onWorkoutChange(_event, value)}
        renderInput={(params) => (
          <TextField {...params} label="Workout or Personal Record" fullWidth />
        )}
      />

      <FormControl fullWidth>
        <InputLabel>Record Type</InputLabel>
        <Select
          value={recordType}
          label="Record Type"
          onChange={onRecordTypeChange}
          disabled={isTypeReadOnly}
        >
          <MenuItem value={RECORD_TYPES.TIME}>Time</MenuItem>
          <MenuItem value={RECORD_TYPES.WEIGHT}>Weight</MenuItem>
          <MenuItem value={RECORD_TYPES.REPS}>Reps</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          fullWidth
          label={
            recordType === RECORD_TYPES.TIME
              ? "Time (HH:MM:SS)"
              : recordType === RECORD_TYPES.WEIGHT
              ? "Weight"
              : "Reps"
          }
          value={recordValue}
          onChange={(e) =>
            onRecordValueChange({
              ...e,
              target: {
                ...e.target,
                value:
                  recordType === RECORD_TYPES.TIME
                    ? formatTimeInput(e.target.value)
                    : e.target.value,
              },
            } as React.ChangeEvent<HTMLInputElement>)
          }
        />

        {recordType === RECORD_TYPES.WEIGHT && (
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Unit</InputLabel>
            <Select
              value={weightUnit}
              label="Unit"
              onChange={onWeightUnitChange}
            >
              <MenuItem value={WEIGHT_UNITS.KG}>kg</MenuItem>
              <MenuItem value={WEIGHT_UNITS.LB}>lb</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      <DatePicker
        label="Date"
        value={recordDate}
        onChange={onRecordDateChange}
        format="DD/MM/YYYY"
      />

      <Button variant="contained" onClick={onAddRecord} fullWidth>
        Add Record
      </Button>
    </Stack>
  );
};

export default RecordForm;
