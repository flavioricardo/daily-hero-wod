import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Autocomplete,
  Stack,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import moment from 'moment';

const WEIGHT_UNITS = {
  KG: 'KG',
  LB: 'LB',
} as const;

const RECORD_TYPES = {
  TIME: 'TIME',
  WEIGHT: 'WEIGHT',
  REPS: 'REPS',
} as const;

const TOAST_DURATION = 3000;

function DailyHeroWod() {
  const [records, setRecords] = useState<any[]>([]);
  const [workout, setWorkout] = useState('');
  const [recordType, setRecordType] = useState<keyof typeof RECORD_TYPES>(RECORD_TYPES.TIME);
  const [recordValue, setRecordValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<keyof typeof WEIGHT_UNITS>(WEIGHT_UNITS.KG);
  const [recordDate, setRecordDate] = useState<moment.Moment | null>(null);
  const [workoutOptions, setWorkoutOptions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isTypeReadOnly, setIsTypeReadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#f44336',
      },
    },
  });

  useEffect(() => {
    loadRecordsFromLocalStorage();
  }, []);

  const loadRecordsFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('dailyhero_records');
      const savedRecords = savedData ? JSON.parse(savedData) : [];
      setRecords(savedRecords);
      const uniqueWorkouts = [
        ...new Set(
          savedRecords
            .map((record: any) => record.workout)
            .filter((workout: string) => workout)
        ),
      ];
      setWorkoutOptions(uniqueWorkouts as string[]);
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      setRecords([]);
    }
  };

  const groupedRecords = records.reduce((acc: any, record) => {
    acc[record.workout] = acc[record.workout] || [];
    acc[record.workout].push(record);
    return acc;
  }, {});

  const clearFields = () => {
    setWorkout('');
    setRecordType(RECORD_TYPES.TIME);
    setRecordValue('');
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

  const formatTimeInput = (value: string) => {
    value = value.replace(/\D/g, '');
    if (value.length <= 2) return value;
    if (value.length <= 4) return `${value.slice(0, 2)}:${value.slice(2)}`;
    return `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}`;
  };

  const formatDate = (date: string) => {
    return moment(date).format('DD/MM/YYYY');
  };

  const convertWeightToKg = (value: string, unit: string) => {
    return unit === WEIGHT_UNITS.LB
      ? parseFloat(value) * 0.453592
      : parseFloat(value);
  };

  const addRecord = () => {
    if (workout && recordValue && recordDate) {
      setError('');
      const newRecord = {
        workout,
        recordType,
        recordValue:
          recordType === (RECORD_TYPES.WEIGHT as keyof typeof RECORD_TYPES)
            ? `${recordValue} ${weightUnit}`
            : recordValue.trim(),
        date: recordDate.toISOString(),
      };
      const newRecords = [...records, newRecord];
      setRecords(newRecords);
      saveRecordsToLocalStorage(newRecords);
      if (!workoutOptions.includes(workout)) {
        setWorkoutOptions([...workoutOptions, workout]);
      }
      clearFields();
      setShowToast(true);
    }
  };

  const saveRecordsToLocalStorage = (records: any[]) => {
    try {
      localStorage.setItem('dailyhero_records', JSON.stringify(records));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const deleteRecord = (index: number) => {
    const updatedRecords = records.filter((_, i) => i !== index);
    setRecords(updatedRecords);
    saveRecordsToLocalStorage(updatedRecords);
  };

  const sortRecords = (records: any[]) => {
    return records.sort((a, b) => {
      if (a.recordType === RECORD_TYPES.TIME) {
        return a.recordValue.localeCompare(b.recordValue);
      } else if (a.recordType === RECORD_TYPES.REPS) {
        return parseInt(b.recordValue) - parseInt(a.recordValue);
      } else if (a.recordType === RECORD_TYPES.WEIGHT) {
        const [aValue, aUnit] = a.recordValue.split(' ');
        const [bValue, bUnit] = b.recordValue.split(' ');
        return (
          convertWeightToKg(bValue, bUnit) - convertWeightToKg(aValue, aUnit)
        );
      }
      return 0;
    });
  };

  const getBestRecordIndex = (records: any[]) => {
    if (records.length === 0) return -1;
    const sortedRecords = sortRecords([...records]);
    return records.indexOf(sortedRecords[0]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              DailyHeroWod - Hero WODs & Hyrox
            </Typography>
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
            >
              <Tab label="Add Record" />
              <Tab label="View Records" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Stack spacing={3}>
              <Autocomplete
                freeSolo
                options={workoutOptions}
                value={workout}
                onChange={handleWorkoutChange}
                onInputChange={(_event, value) => setWorkout(value || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Workout or Personal Record"
                    fullWidth
                  />
                )}
              />

              <FormControl fullWidth>
                <InputLabel>Record Type</InputLabel>
                <Select
                  value={recordType}
                  label="Record Type"
                  onChange={(e) => setRecordType(e.target.value as keyof typeof RECORD_TYPES)}
                  disabled={isTypeReadOnly}
                >
                  <MenuItem value={RECORD_TYPES.TIME}>Time</MenuItem>
                  <MenuItem value={RECORD_TYPES.WEIGHT}>Weight</MenuItem>
                  <MenuItem value={RECORD_TYPES.REPS}>Reps</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label={
                    recordType === RECORD_TYPES.TIME
                      ? 'Time (HH:MM:SS)'
                      : recordType === RECORD_TYPES.WEIGHT
                      ? 'Weight'
                      : 'Reps'
                  }
                  value={recordValue}
                  onChange={(e) =>
                    setRecordValue(
                      recordType === RECORD_TYPES.TIME
                        ? formatTimeInput(e.target.value)
                        : e.target.value
                    )
                  }
                  placeholder={
                    recordType === RECORD_TYPES.TIME
                      ? '00:00:00'
                      : recordType === RECORD_TYPES.WEIGHT
                      ? 'Enter weight'
                      : 'Enter reps'
                  }
                />
                {recordType === RECORD_TYPES.WEIGHT && (
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      value={weightUnit}
                      label="Unit"
                      onChange={(e) => setWeightUnit(e.target.value as keyof typeof WEIGHT_UNITS)}
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
                onChange={(newValue) => setRecordDate(newValue)}
              />

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={addRecord}
                fullWidth
              >
                Add Record
              </Button>
            </Stack>
          )}

          {activeTab === 1 && (
            <Box>
              <TextField
                fullWidth
                label="Search Workout"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                sx={{ mb: 4 }}
              />

              <Stack spacing={4}>
                {Object.keys(groupedRecords)
                  .filter((workout) =>
                    workout.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map((workout) => {
                    const sortedRecords = sortRecords(groupedRecords[workout]);
                    const bestRecordIndex = getBestRecordIndex(sortedRecords);
                    return (
                      <Paper key={workout} elevation={2}>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {workout}
                          </Typography>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Value</TableCell>
                                  <TableCell>Date</TableCell>
                                  <TableCell align="right">Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {sortedRecords.map((record: any, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {index === bestRecordIndex && (
                                          <StarIcon color="warning" fontSize="small" />
                                        )}
                                        {record.recordType === RECORD_TYPES.REPS
                                          ? `${record.recordValue} reps`
                                          : record.recordValue}
                                      </Box>
                                    </TableCell>
                                    <TableCell>{formatDate(record.date)}</TableCell>
                                    <TableCell align="right">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => deleteRecord(index)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Paper>
                    );
                  })}
              </Stack>
            </Box>
          )}

          <Snackbar
            open={showToast}
            autoHideDuration={TOAST_DURATION}
            onClose={() => setShowToast(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity="success" variant="filled">
              Record saved successfully!
            </Alert>
          </Snackbar>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default DailyHeroWod;