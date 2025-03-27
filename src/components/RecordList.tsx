import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  TextField,
  styled,
  Stack,
} from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { LineChart } from "@mui/x-charts/LineChart";
import { Delete as DeleteIcon, Star as StarIcon } from "@mui/icons-material";
import {
  formatDate,
  getBestRecordIndex,
  RECORD_TYPES,
  sortRecords,
} from "../utils/helpers";

// Estilo da tabela
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

const RecordList = ({
  groupedRecords,
  searchFilter,
  onSearchFilterChange,
  deleteRecord,
}: {
  groupedRecords: { [key: string]: any[] };
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  deleteRecord: (record: any) => void;
}) => {
  return (
    <Box>
      <TextField
        fullWidth
        label="Search Workout"
        value={searchFilter}
        onChange={(e) => onSearchFilterChange(e.target.value)}
        sx={{ mb: 4 }}
      />
      <Stack spacing={4}>
        {Object.keys(groupedRecords)
          .filter((workout) =>
            workout.toLowerCase().includes(searchFilter.toLowerCase())
          )
          .map((workout) => {
            const records = groupedRecords[workout];

            const sortedRecords = useMemo(
              () => sortRecords(records),
              [records]
            );
            const bestRecordIndex = useMemo(
              () => getBestRecordIndex(sortedRecords),
              [sortedRecords]
            );

            const workoutType = sortedRecords[0]?.recordType || "Unknown";

            const chartsData = useMemo(() => {
              return sortRecords(records, true).map((record) => ({
                ...record,
                recordDate: new Date(record.date),
                recordValue:
                  record.recordType === RECORD_TYPES.WEIGHT
                    ? parseFloat(record.recordValue.split(" ")[0])
                    : record.recordType === RECORD_TYPES.REPS
                    ? parseInt(record.recordValue)
                    : null,
              }));
            }, [records]);

            const chartsLabels = chartsData.map((r) => r.recordDate);

            return (
              <Paper key={workout} elevation={3}>
                <Box sx={{ p: 2 }}>
                  <Typography
                    display="inline-block"
                    variant="h6"
                    mr={1}
                    gutterBottom
                  >
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
                          <StyledTableCell align="right">
                            Actions
                          </StyledTableCell>
                        </StyledTableRow>
                      </Box>
                      <Box component="tbody">
                        {sortedRecords.map((record: any, index: number) => (
                          <StyledTableRow key={index}>
                            <StyledTableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {index === bestRecordIndex && (
                                  <StarIcon color="warning" fontSize="small" />
                                )}
                                {record.recordType === RECORD_TYPES.REPS
                                  ? `${record.recordValue} reps`
                                  : record.recordValue}
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                              {formatDate(record.date)}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
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
                        series={[
                          {
                            dataKey: "recordValue",
                            curve: "linear",
                            valueFormatter: (value) =>
                              value !== null && value !== undefined
                                ? value.toString()
                                : null,
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
          })}
      </Stack>
    </Box>
  );
};

export default RecordList;
