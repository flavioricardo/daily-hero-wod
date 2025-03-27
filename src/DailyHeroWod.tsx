import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Tabs,
  Tab,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Autocomplete,
  Stack,
  styled,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { LineChart } from "@mui/x-charts/LineChart";
import moment, { Moment } from "moment";

// Constantes de configuração
const WEIGHT_UNITS = {
  KG: "KG",
  LB: "LB",
} as const;
const RECORD_TYPES = {
  TIME: "TIME",
  WEIGHT: "WEIGHT",
  REPS: "REPS",
} as const;
const TOAST_DURATION = 3000;

// Componentes de estilo para tabelas
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

// Funções auxiliares
const formatTimeInput = (value: string): string => {
  value = value.replace(/\D/g, "");
  if (value.length <= 2) return value;
  if (value.length <= 4) return `${value.slice(0, 2)}:${value.slice(2)}`;
  return `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}`;
};

const formatDate = (date: string | Date): string => {
  return moment(date).format("DD/MM/YYYY");
};

const convertWeightToKg = (value: string, unit: string): number => {
  return unit === WEIGHT_UNITS.LB
    ? parseFloat(value) * 0.453592
    : parseFloat(value);
};

const sortRecords = (records: any[], sortByDate: boolean = false) => {
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

const getBestRecordIndex = (records: any[]): number => {
  if (!records.length) return -1;
  const sorted = sortRecords([...records]);
  return records.indexOf(sorted[0]);
};

// Componente para o formulário de adição de record
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
  workoutOptions: string[];
  workout: string;
  recordType: keyof typeof RECORD_TYPES;
  recordValue: string;
  weightUnit: keyof typeof WEIGHT_UNITS;
  recordDate: Moment | null;
  isTypeReadOnly: boolean;
  onWorkoutChange: (event: any, value: string | null) => void;
  onRecordTypeChange: (
    event: SelectChangeEvent<keyof typeof RECORD_TYPES>
  ) => void;
  onRecordValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onWeightUnitChange: (
    event: SelectChangeEvent<keyof typeof WEIGHT_UNITS>
  ) => void;
  onRecordDateChange: (newValue: Moment | null) => void;
  onAddRecord: () => void;
}) => {
  return (
    <Stack spacing={3}>
      <Autocomplete
        freeSolo
        options={workoutOptions}
        value={workout}
        onChange={onWorkoutChange}
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
          placeholder={
            recordType === RECORD_TYPES.TIME
              ? "00:00:00"
              : recordType === RECORD_TYPES.WEIGHT
              ? "Enter weight"
              : "Enter reps"
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
      />
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={onAddRecord}
        fullWidth
      >
        Add Record
      </Button>
    </Stack>
  );
};

// Componente para listagem e visualização dos records com gráfico
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
            const sortedRecords = sortRecords(records);
            const bestRecordIndex = getBestRecordIndex(sortedRecords);
            const workoutType = sortedRecords[0]?.recordType || "Unknown";

            // Filtra e organiza os dados para o gráfico
            const chartsData = sortRecords(records, true).map((record) => ({
              ...record,
              recordDate: new Date(record.date),
              recordValue:
                record.recordType === RECORD_TYPES.WEIGHT
                  ? parseFloat(record.recordValue.split(" ")[0])
                  : record.recordType === RECORD_TYPES.REPS
                  ? parseInt(record.recordValue)
                  : null,
            }));
            const chartsLabels = chartsData.map((record) => record.recordDate);

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
                    {/* Tabela de registros */}
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

function DailyHeroWod() {
  const [records, setRecords] = useState<any[]>([]);
  const [workout, setWorkout] = useState("");
  const [recordType, setRecordType] = useState<keyof typeof RECORD_TYPES>(
    RECORD_TYPES.TIME
  );
  const [recordValue, setRecordValue] = useState("");
  const [weightUnit, setWeightUnit] = useState<keyof typeof WEIGHT_UNITS>(
    WEIGHT_UNITS.KG
  );
  const [recordDate, setRecordDate] = useState<Moment | null>(null);
  // const [workoutOptions, setWorkoutOptions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isTypeReadOnly, setIsTypeReadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState("");

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#f44336" },
    },
  });

  useEffect(() => {
    loadRecordsFromLocalStorage();
  }, []);

  const loadRecordsFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem("dailyhero_records");
      const savedRecords = savedData ? JSON.parse(savedData) : [];
      setRecords(savedRecords);
      const uniqueWorkouts = [
        ...new Set(
          savedRecords
            .map((record: any) => record.workout)
            .filter((w: string) => w)
        ),
      ] as string[];
      // setWorkoutOptions(uniqueWorkouts);
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      setRecords([]);
    }
  };

  const saveRecordsToLocalStorage = (records: any[]) => {
    try {
      localStorage.setItem("dailyhero_records", JSON.stringify(records));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const clearFields = () => {
    setWorkout("");
    setRecordType(RECORD_TYPES.TIME);
    setRecordValue("");
    setWeightUnit(WEIGHT_UNITS.KG);
    setRecordDate(null);
    setIsTypeReadOnly(false);
  };

  const handleWorkoutChange = (_event: any, value: string | null) => {
    if (!value) {
      clearFields();
      return;
    }
    setWorkout(value);
    const matchedRecord = records.find((record) => record.workout === value);
    if (matchedRecord) {
      setRecordType(matchedRecord.recordType);
      setIsTypeReadOnly(true);
    } else {
      setRecordType(RECORD_TYPES.TIME);
      setIsTypeReadOnly(false);
    }
  };

  const addRecord = () => {
    if (workout && recordValue && recordDate) {
      setError("");
      const newRecord = {
        workout,
        recordType,
        recordValue:
          recordType === RECORD_TYPES.WEIGHT
            ? `${recordValue} ${weightUnit}`
            : recordValue.trim(),
        date: recordDate.toISOString(),
      };
      const newRecords = [...records, newRecord];
      setRecords(newRecords);
      saveRecordsToLocalStorage(newRecords);
      // if (!workoutOptions.includes(workout)) {
      //   setWorkoutOptions([...workoutOptions, workout]);
      // }
      clearFields();
      setToastMessage("Record saved successfully!");
    }
  };

  const [recordToDelete, setRecordToDelete] = useState<any | null>(null);

  const handleConfirmDelete = (record: any) => {
    setRecordToDelete(record);
  };

  const confirmDelete = () => {
    if (!recordToDelete) return;

    const index = records.findIndex(
      (r) =>
        r.workout === recordToDelete.workout &&
        r.recordValue === recordToDelete.recordValue &&
        r.date === recordToDelete.date &&
        r.recordType === recordToDelete.recordType
    );

    if (index !== -1) {
      const updatedRecords = [...records];
      updatedRecords.splice(index, 1);
      setRecords(updatedRecords);
      saveRecordsToLocalStorage(updatedRecords);
      setToastMessage("Record deleted successfully!");
    }

    setRecordToDelete(null);
  };

  const cancelDelete = () => {
    setRecordToDelete(null);
  };

  const workoutOptions = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.workout).filter(Boolean)));
  }, [records]);

  const groupedRecords = useMemo(() => {
    return records.reduce((acc: any, record) => {
      acc[record.workout] = acc[record.workout] || [];
      acc[record.workout].push(record);
      return acc;
    }, {});
  }, [records]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" component="h1">
              DailyHeroWod - Hero WODs & Hyrox
            </Typography>
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
            >
              <Tab label="Add Record" />
              <Tab label="View Records" />
            </Tabs>
          </Box>

          {activeTab === 0 ? (
            <RecordForm
              workoutOptions={workoutOptions}
              workout={workout}
              recordType={recordType}
              recordValue={recordValue}
              weightUnit={weightUnit}
              recordDate={recordDate}
              isTypeReadOnly={isTypeReadOnly}
              onWorkoutChange={handleWorkoutChange}
              onRecordTypeChange={(e) =>
                setRecordType(e.target.value as keyof typeof RECORD_TYPES)
              }
              onRecordValueChange={(e) => setRecordValue(e.target.value)}
              onWeightUnitChange={(e) =>
                setWeightUnit(e.target.value as keyof typeof WEIGHT_UNITS)
              }
              onRecordDateChange={setRecordDate}
              onAddRecord={addRecord}
            />
          ) : (
            <RecordList
              groupedRecords={groupedRecords}
              searchFilter={searchFilter}
              onSearchFilterChange={(value) => setSearchFilter(value)}
              deleteRecord={handleConfirmDelete}
            />
          )}

          <Dialog open={!!recordToDelete} onClose={cancelDelete}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this record? This action cannot
                be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={cancelDelete}>Cancel</Button>
              <Button onClick={confirmDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={!!toastMessage}
            autoHideDuration={TOAST_DURATION}
            onClose={() => setToastMessage("")}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity="success" variant="filled">
              {toastMessage}
            </Alert>
          </Snackbar>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default DailyHeroWod;
