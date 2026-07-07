import React, { useMemo } from "react";
import { Box, Chip, IconButton, Paper, Typography, styled } from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { LineChart } from "@mui/x-charts/LineChart";
import { Delete as DeleteIcon, Star as StarIcon } from "@mui/icons-material";
import {
  RECORD_TYPES,
  formatDate,
  getBestRecordIndex,
  recordNumericValue,
  secondsToTime,
  sortRecords,
} from "../utils/helpers";
import type { WorkoutRecord } from "../types/records";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled("tr")(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

interface WorkoutCardProps {
  workout: string;
  records: WorkoutRecord[];
  deleteRecord: (record: WorkoutRecord) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  records,
  deleteRecord,
}) => {
  const sortedRecords = useMemo(() => sortRecords(records), [records]);
  const bestRecordIndex = useMemo(
    () => getBestRecordIndex(sortedRecords),
    [sortedRecords]
  );

  const workoutType = sortedRecords[0]?.recordType || "Unknown";
  const isTime = workoutType === RECORD_TYPES.TIME;

  const chartsData = useMemo(() => {
    return sortRecords(records, true).map((record) => ({
      recordDate: new Date(record.date),
      recordValue: recordNumericValue(record),
    }));
  }, [records]);

  const chartsLabels = useMemo(
    () => chartsData.map((r) => r.recordDate),
    [chartsData]
  );

  return (
    <Paper elevation={3}>
      <Box sx={{ p: 2 }}>
        <Typography display="inline-block" variant="h6" mr={1} gutterBottom>
          {workout}
        </Typography>
        <Chip
          label={workoutType}
          color={
            workoutType === RECORD_TYPES.TIME
              ? "primary"
              : workoutType === RECORD_TYPES.WEIGHT
              ? "secondary"
              : "default"
          }
          sx={{ mb: "0.35em" }}
          size="small"
        />
        <Paper sx={{ mt: 1 }}>
          <Box component="table" sx={{ width: "100%" }}>
            <Box component="thead">
              <StyledTableRow>
                <StyledTableCell>Value</StyledTableCell>
                <StyledTableCell>Date</StyledTableCell>
                <StyledTableCell align="right">Actions</StyledTableCell>
              </StyledTableRow>
            </Box>
            <Box component="tbody">
              {sortedRecords.map((record, index) => (
                <StyledTableRow key={`${record.date}-${record.recordValue}`}>
                  <StyledTableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      {index === bestRecordIndex && (
                        <StarIcon color="warning" fontSize="small" />
                      )}
                      {record.recordType === RECORD_TYPES.REPS
                        ? `${record.recordValue} reps`
                        : record.recordValue}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell>{formatDate(record.date)}</StyledTableCell>
                  <StyledTableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Delete ${workout} record from ${formatDate(
                        record.date
                      )}`}
                      onClick={() => deleteRecord(record)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </Box>
          </Box>
        </Paper>
        {chartsData.length > 1 && (
          <Box sx={{ height: 300, mt: 2 }}>
            <LineChart
              xAxis={[
                {
                  data: chartsLabels,
                  valueFormatter: (value) =>
                    value ? formatDate(value as Date) : "",
                },
              ]}
              yAxis={[
                {
                  valueFormatter: (value: number | null) =>
                    value === null
                      ? ""
                      : isTime
                      ? secondsToTime(value)
                      : value.toString(),
                },
              ]}
              series={[
                {
                  dataKey: "recordValue",
                  curve: "linear",
                  valueFormatter: (value) =>
                    value === null || value === undefined
                      ? null
                      : isTime
                      ? secondsToTime(value)
                      : value.toString(),
                },
              ]}
              dataset={chartsData}
              height={300}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default WorkoutCard;
