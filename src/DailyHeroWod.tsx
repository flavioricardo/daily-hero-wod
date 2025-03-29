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
  LinearProgress,
  Snackbar,
  Tab,
  Tabs,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { RECORD_TYPES, TOAST_DURATION, WEIGHT_UNITS } from "./utils/helpers";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  loadRecordsFromLocalStorage,
  saveRecordsToLocalStorage,
} from "./utils/localStorage";

import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { COLORS } from "./utils/styles";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import Header from "./components/Header";
import { LocalizationProvider } from "@mui/x-date-pickers";
import Login from "./components/Login";
import { Moment } from "moment";
import TimelineIcon from "@mui/icons-material/Timeline";
import { clearFields } from "./utils/form";

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
  const [customWorkouts, setCustomWorkouts] = useState<
    { name: string; category: string }[]
  >([]);

  useEffect(() => {
    const fetchCustomWorkouts = async () => {
      if (!user) return;

      try {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "customWorkouts")
        );
        const custom = snapshot.docs.map((doc) => ({
          name: doc.data().name,
          category: "Custom",
        }));
        setCustomWorkouts(custom);
      } catch (error) {
        console.error("Error loading custom workouts:", error);
      }
    };

    fetchCustomWorkouts();
  }, [user]);

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
    const fetchUserRecords = async () => {
      if (!user) {
        const records = loadRecordsFromLocalStorage("dailyhero_records");
        setRecords(records);
        return;
      }

      try {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "records")
        );
        const firebaseRecords = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(firebaseRecords);
      } catch (error) {
        console.error("Error loading user records from Firestore:", error);
        const records = loadRecordsFromLocalStorage("dailyhero_records");
        setRecords(records);
      }
    };

    fetchUserRecords();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedRecords = loadRecordsFromLocalStorage("dailyhero_records");
    setRecords(savedRecords);
  }, []);

  const handleSaveRecords = (records: any[]) => {
    saveRecordsToLocalStorage("dailyhero_records", records);
  };

  const handleWorkoutChange = (_event: any, value: string | null) => {
    if (!value) {
      clearFields(
        setWorkout,
        setRecordType,
        setRecordValue,
        setWeightUnit,
        setRecordDate,
        setIsTypeReadOnly
      );
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

  const addRecord = async () => {
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
      handleSaveRecords(newRecords);
      clearFields(
        setWorkout,
        setRecordType,
        setRecordValue,
        setWeightUnit,
        setRecordDate,
        setIsTypeReadOnly
      );
      setToastMessage("Record saved successfully!");

      // Se usuário estiver logado, salva no Firestore
      if (user) {
        try {
          // Salvar o record
          await addDoc(collection(db, "users", user.uid, "records"), newRecord);
          console.log("🔥 Record saved to Firestore!");

          // Se o workout não estiver na lista global, salvar como personalizado
          const isGlobal = globalWorkouts.some(
            (w) => w.name.toLowerCase() === workout.toLowerCase()
          );
          if (!isGlobal) {
            const customRef = collection(
              db,
              "users",
              user.uid,
              "customWorkouts"
            );

            // Verifica se já existe
            const existing = await getDocs(
              query(customRef, where("name", "==", workout))
            );

            if (existing.empty) {
              await addDoc(customRef, {
                name: workout,
                createdAt: new Date().toISOString(),
              });
              console.log("✅ Custom workout saved!");
            }
          }
        } catch (error) {
          console.error("❌ Error saving to Firestore:", error);
        }
      }
    }
  };

  const handleConfirmDelete = (record: any) => {
    setRecordToDelete(record);
  };

  const confirmDelete = async () => {
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
      handleSaveRecords(updatedRecords);
      setToastMessage("Record deleted successfully!");
    }

    if (user && recordToDelete.id) {
      try {
        const ref = doc(db, "users", user.uid, "records", recordToDelete.id);
        await deleteDoc(ref);
        console.log("🗑 Record deleted from Firestore!");
      } catch (error) {
        console.error("Error deleting from Firestore:", error);
      }
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

    const map = new Map();

    // Prioridade: globais > personalizados > locais
    [...globalWorkouts, ...customWorkouts, ...userWorkouts].forEach((item) => {
      const key = item.name.toLowerCase(); // case-insensitive
      if (!map.has(key)) map.set(key, item);
    });

    const unique = Array.from(map.values());
    unique.sort((a, b) => a.category.localeCompare(b.category));

    return unique;
  }, [globalWorkouts, customWorkouts, records]);

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
            <Header
              darkMode={darkMode}
              toggleTheme={() => setDarkMode(!darkMode)}
              user={user}
              onLogout={handleLogout}
              onLogin={() => setLoginOpen(true)}
            />

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
