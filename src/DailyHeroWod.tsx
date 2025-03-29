import {
  Alert,
  Box,
  Button,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  Snackbar,
  Tab,
  Tabs,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import { RECORD_TYPES, TOAST_DURATION, WEIGHT_UNITS } from "./utils/helpers";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { COLORS } from "./utils/styles";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { LocalizationProvider } from "@mui/x-date-pickers";
import Login from "./components/Login";
import { Moment } from "moment";
import TimelineIcon from "@mui/icons-material/Timeline";

const RecordForm = React.lazy(() => import("./components/RecordForm"));
const RecordList = React.lazy(() => import("./components/RecordList"));

function DailyHeroWod() {
  // Estados
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
  const [isTypeReadOnly, setIsTypeReadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [globalWorkouts, setGlobalWorkouts] = useState<
    { name: string; type: keyof typeof RECORD_TYPES; category: string }[]
  >([]);

  // Tema
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: COLORS.main },
    },
  });

  // Efeitos
  useEffect(() => {
    const fetchGlobalWorkouts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "globalWorkouts"));
        const workouts = snapshot.docs.map((doc) => ({
          name: doc.data().name,
          type: doc.data().type as keyof typeof RECORD_TYPES,
          category: doc.data().category || "Other",
        }));
        setGlobalWorkouts(workouts);
      } catch (error) {
        console.error("Error loading global workouts:", error);
      }
    };

    fetchGlobalWorkouts();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("dailyhero_theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("dailyhero_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    loadRecordsFromLocalStorage();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Funções auxiliares
  const loadRecordsFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem("dailyhero_records");
      const savedRecords = savedData ? JSON.parse(savedData) : [];
      setRecords(savedRecords);
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
      const matchedGlobalWorkout = globalWorkouts.find(
        (workout) => workout.name === value
      );

      if (matchedGlobalWorkout) {
        setRecordType(matchedGlobalWorkout.type);
        setIsTypeReadOnly(true);
      } else {
        setRecordType(RECORD_TYPES.TIME);
        setIsTypeReadOnly(false);
      }
    }
  };

  const addRecord = () => {
    if (workout && recordValue && recordDate) {
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
      clearFields();
      setToastMessage("Record saved successfully!");
    }
  };

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

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Memoizações
  const workoutOptions = useMemo(() => {
    const userWorkouts = records
      .map((r) => r.workout)
      .filter(Boolean)
      .map((name) => ({ name, category: "Custom" }));

    const combined = [...globalWorkouts, ...userWorkouts];

    const unique = Array.from(
      new Map(combined.map((item) => [item.name, item])).values()
    );

    // Ordena por categoria para evitar erro no Autocomplete
    unique.sort((a, b) => a.category.localeCompare(b.category));

    return unique;
  }, [globalWorkouts, records]);

  const groupedRecords = useMemo(() => {
    return records.reduce((acc: any, record) => {
      acc[record.workout] = acc[record.workout] || [];
      acc[record.workout].push(record);
      return acc;
    }, {});
  }, [records]);

  // Renderização
  return (
    <Suspense fallback={<LinearProgress />}>
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
                Daily Hero - CrossFit Hero WODs, PR & Hyrox
              </Typography>
              <Box>
                <IconButton
                  onClick={() => setDarkMode(!darkMode)}
                  color="inherit"
                >
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
                {user ? (
                  <>
                    <Typography
                      variant="body2"
                      sx={{ mx: 2, display: "inline" }}
                    >
                      {user.email}
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button color="inherit" onClick={() => setLoginOpen(true)}>
                    Sign In
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={(_e, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
              >
                <Tab
                  label="Add Record"
                  icon={<FitnessCenterIcon />}
                  iconPosition="start"
                />
                <Tab
                  label="View Records"
                  icon={<TimelineIcon />}
                  iconPosition="start"
                />
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
                onSearchFilterChange={setSearchFilter}
                deleteRecord={handleConfirmDelete}
              />
            )}

            <Dialog open={!!recordToDelete} onClose={cancelDelete}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this record? This action
                  cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={cancelDelete}>Cancel</Button>
                <Button
                  onClick={confirmDelete}
                  color="error"
                  variant="contained"
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={loginOpen}
              onClose={() => setLoginOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <Box p={3}>
                <Login />
              </Box>
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
    </Suspense>
  );
}

export default DailyHeroWod;
