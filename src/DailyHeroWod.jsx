// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import {
  Box,
  ColorSchemeProvider,
  ComboBox,
  SelectList,
  TextField,
  Button,
  Text,
  Table,
  IconButton,
  Icon,
  Tabs,
} from "gestalt";
import "gestalt/dist/gestalt.css";
import { DatePicker } from "gestalt-datepicker";
import "gestalt-datepicker/dist/gestalt-datepicker.css";

const WEIGHT_UNITS = {
  KG: "kg",
  LB: "lb",
};

const RECORD_TYPES = {
  TIME: "time",
  WEIGHT: "weight",
  REPS: "reps",
};

function DailyHeroWod() {
  const [records, setRecords] = useState([]);
  const [workout, setWorkout] = useState("");
  const [recordType, setRecordType] = useState(RECORD_TYPES.TIME);
  const [recordValue, setRecordValue] = useState("");
  const [weightUnit, setWeightUnit] = useState(WEIGHT_UNITS.KG);
  const [recordDate, setRecordDate] = useState(null);
  const [workoutOptions, setWorkoutOptions] = useState([]);
  const [error, setError] = useState("");
  const [isTypeReadOnly, setIsTypeReadOnly] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const [colorScheme, setColorScheme] = useState("light");

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
            .map((record) => record.workout)
            .filter((workout) => workout)
        ),
      ];
      setWorkoutOptions(uniqueWorkouts);
      console.log("Loaded records from localStorage:", savedRecords);
      console.log("Unique workouts:", uniqueWorkouts);
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      setRecords([]);
    }
  };

  const groupedRecords = records.reduce((acc, record) => {
    acc[record.workout] = acc[record.workout] || [];
    acc[record.workout].push(record);
    return acc;
  }, {});

  const clearFields = () => {
    setWorkout("");
    setRecordType(RECORD_TYPES.TIME);
    setRecordValue("");
    setWeightUnit(WEIGHT_UNITS.KG);
    setRecordDate(null);
    setIsTypeReadOnly(false);
    console.log("Fields cleared");
  };

  const handleWorkoutChange = ({ value }) => {
    console.log("Workout changed:", value);
    if (!value) {
      clearFields();
      return;
    }
    setWorkout(value);
    const matchedRecord = records.find((record) => record.workout === value);
    if (matchedRecord) {
      setRecordType(matchedRecord.recordType);
      setIsTypeReadOnly(true);
      console.log("Matched record found:", matchedRecord);
    } else {
      setRecordType(RECORD_TYPES.TIME);
      setIsTypeReadOnly(false);
      console.log("No matched record found, setting recordType to 'time'");
    }
  };

  const handleWorkoutSelect = ({ item }) => {
    console.log("Workout selected:", item.value);
    setWorkout(item.value);
    const matchedRecord = records.find(
      (record) => record.workout === item.value
    );
    if (matchedRecord) {
      setRecordType(matchedRecord.recordType);
      setIsTypeReadOnly(true);
      console.log("Matched record found:", matchedRecord);
    } else {
      setRecordType(RECORD_TYPES.TIME);
      setIsTypeReadOnly(false);
      console.log("No matched record found, setting recordType to 'time'");
    }
  };

  const formatTimeInput = (value) => {
    value = value.replace(/\D/g, "");
    if (value.length <= 2) return value;
    if (value.length <= 4) return `${value.slice(0, 2)}:${value.slice(2)}`;
    return `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const convertWeightToKg = (value, unit) => {
    return unit === WEIGHT_UNITS.LB
      ? parseFloat(value) * 0.453592
      : parseFloat(value);
  };

  const addRecord = () => {
    console.log("Adding record:", {
      workout,
      recordType,
      recordValue,
      weightUnit,
      recordDate,
    });
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
      if (!workoutOptions.includes(workout)) {
        setWorkoutOptions([...workoutOptions, workout]);
        console.log("New workout added to options:", workout);
      }
      clearFields();
    } else {
      console.log("Workout, recordValue, or recordDate is missing");
    }
  };

  const saveRecordsToLocalStorage = (records) => {
    try {
      localStorage.setItem("dailyhero_records", JSON.stringify(records));
      console.log("Records saved to localStorage");
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const deleteRecord = (index) => {
    console.log("Deleting record at index:", index);
    const updatedRecords = records.filter((_, i) => i !== index);
    setRecords(updatedRecords);
    saveRecordsToLocalStorage(updatedRecords);
  };

  const sortRecords = (records) => {
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

  const getBestRecordIndex = (records) => {
    if (records.length === 0) return -1;
    const sortedRecords = sortRecords([...records]);
    return records.indexOf(sortedRecords[0]);
  };

  const tabs = [
    { id: "addRecord", text: "Add Record" },
    { id: "viewRecords", text: "View Records" },
  ];

  return (
    <ColorSchemeProvider colorScheme={colorScheme}>
      <Box
        padding={6}
        display="flex"
        direction="column"
        alignItems="center"
        width="100%"
      >
        <Box position="absolute" top right margin={4}>
          <IconButton
            accessibilityLabel="Toggle color scheme"
            icon={colorScheme === "light" ? "lightbulb" : "moon"}
            iconColor="darkGray"
            size="lg"
            onClick={() =>
              setColorScheme(colorScheme === "light" ? "dark" : "light")
            }
          />
        </Box>
        <Text size="500" weight="bold" accessibilityLevel={1}>
          DailyHeroWod - Hero WODs & Hyrox
        </Text>
        <Tabs
          activeTabIndex={activeTabIndex}
          onChange={({ activeTabIndex }) => setActiveTabIndex(activeTabIndex)}
          tabs={tabs}
        />
        {activeTabIndex === 0 && (
          <Box
            paddingY={4}
            width="100%"
            display="flex"
            direction="column"
            alignItems="center"
            gap={4}
          >
            <Box width="100%" marginBottom={2}>
              <ComboBox
                id="workout"
                label="Workout or Personal Record"
                onChange={handleWorkoutChange}
                onSelect={handleWorkoutSelect}
                onClear={clearFields}
                options={workoutOptions.map((workout) => ({
                  label: workout,
                  value: workout,
                }))}
                placeholder="Select or type a workout"
                inputValue={workout}
                allowCustomValue
              />
            </Box>
            <Box width="100%" marginBottom={2}>
              <SelectList
                id="recordType"
                label="Record Type"
                name="recordType"
                onChange={({ value }) => setRecordType(value)}
                value={recordType}
                disabled={isTypeReadOnly}
              >
                <SelectList.Option label="Time" value={RECORD_TYPES.TIME} />
                <SelectList.Option label="Weight" value={RECORD_TYPES.WEIGHT} />
                <SelectList.Option label="Reps" value={RECORD_TYPES.REPS} />
              </SelectList>
            </Box>
            <Box
              width="100%"
              marginBottom={2}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Box flex="grow">
                <TextField
                  id="recordValue"
                  type="text"
                  mobileInputMode="numeric"
                  label={
                    recordType === RECORD_TYPES.TIME
                      ? "Time (HH:MM:SS)"
                      : recordType === RECORD_TYPES.WEIGHT
                      ? "Weight"
                      : "Reps"
                  }
                  value={recordValue}
                  onChange={({ value }) =>
                    setRecordValue(
                      recordType === RECORD_TYPES.TIME
                        ? formatTimeInput(value)
                        : value
                    )
                  }
                  placeholder={
                    recordType === RECORD_TYPES.TIME
                      ? "00:00:00"
                      : recordType === RECORD_TYPES.WEIGHT
                      ? "Enter weight"
                      : "Enter reps"
                  }
                />
              </Box>
              {recordType === RECORD_TYPES.WEIGHT && (
                <Box marginStart={2}>
                  <SelectList
                    id="weightUnit"
                    label="Unit"
                    name="weightUnit"
                    onChange={({ value }) => setWeightUnit(value)}
                    value={weightUnit}
                  >
                    <SelectList.Option label="kg" value={WEIGHT_UNITS.KG} />
                    <SelectList.Option label="lb" value={WEIGHT_UNITS.LB} />
                  </SelectList>
                </Box>
              )}
            </Box>
            <Box width="100%" marginBottom={2}>
              <DatePicker
                id="recordDate"
                label="Date"
                onChange={({ value }) => setRecordDate(value)}
                value={recordDate}
                placeholder="Select date"
              />
            </Box>
            {error && (
              <Text color="red" marginBottom={2}>
                {error}
              </Text>
            )}
            <Box width="100%" marginBottom={2}>
              <Button
                text="Add Record"
                onClick={addRecord}
                color="red"
                size="lg"
                rounded
                fullWidth
              />
            </Box>
          </Box>
        )}
        {activeTabIndex === 1 && (
          <Box marginTop={6} width="100%" padding={3} borderStyle="sm">
            <Text size="400" weight="bold">
              Recent Records
            </Text>
            <Box width="100%" marginBottom={4}>
              <TextField
                id="searchFilter"
                type="text"
                label="Search Workout"
                value={searchFilter}
                onChange={({ value }) => setSearchFilter(value)}
                placeholder="Type to filter workouts"
              />
            </Box>
            {Object.keys(groupedRecords)
              .filter((workout) =>
                workout.toLowerCase().includes(searchFilter.toLowerCase())
              )
              .map((workout) => {
                const sortedRecords = sortRecords(groupedRecords[workout]);
                const bestRecordIndex = getBestRecordIndex(sortedRecords);
                return (
                  <Box key={workout} marginBottom={4}>
                    <Text size="300" weight="bold">
                      {workout}
                    </Text>
                    <Table accessibilityLabel={`${workout} Records`}>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Value</Table.HeaderCell>
                          <Table.HeaderCell>Date</Table.HeaderCell>
                          <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {sortedRecords.map((record, index) => (
                          <Table.Row key={index}>
                            <Table.Cell>
                              <Box display="flex" alignItems="center">
                                {index === bestRecordIndex && (
                                  <Box marginEnd={2}>
                                    <Icon
                                      accessibilityLabel="Best record"
                                      icon="star"
                                      color="warning"
                                      inline
                                      size="16"
                                    />
                                  </Box>
                                )}
                                {record.recordType === RECORD_TYPES.REPS
                                  ? `${record.recordValue} reps`
                                  : record.recordValue}
                              </Box>
                            </Table.Cell>
                            <Table.Cell>{formatDate(record.date)}</Table.Cell>
                            <Table.Cell>
                              <IconButton
                                accessibilityLabel="Delete record"
                                icon="trash-can"
                                iconColor="red"
                                size="md"
                                onClick={() => deleteRecord(index)}
                              />
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </Box>
                );
              })}
          </Box>
        )}
      </Box>
    </ColorSchemeProvider>
  );
}

export default DailyHeroWod;
