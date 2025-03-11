import React from "react"; // eslint-disable-line no-unused-vars
import { useState, useEffect } from "react";
import {
  Box,
  ComboBox,
  SelectList,
  TextField,
  Button,
  Text,
  Table,
  IconButton,
  Icon,
} from "gestalt";
import "gestalt/dist/gestalt.css";

function DailyHeroWod() {
  const [records, setRecords] = useState([]);
  const [workout, setWorkout] = useState("");
  const [recordType, setRecordType] = useState("time");
  const [recordValue, setRecordValue] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [workoutOptions, setWorkoutOptions] = useState([]);
  const [error, setError] = useState("");
  const [isTypeReadOnly, setIsTypeReadOnly] = useState(false);

  useEffect(() => {
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
  }, []);

  const groupedRecords = records.reduce((acc, record) => {
    acc[record.workout] = acc[record.workout] || [];
    acc[record.workout].push(record);
    return acc;
  }, {});

  const clearFields = () => {
    setWorkout("");
    setRecordType("time");
    setRecordValue("");
    setWeightUnit("kg");
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
      setRecordType("time");
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
      setRecordType("time");
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
    if (unit === "lb") {
      return parseFloat(value) * 0.453592;
    }
    return parseFloat(value);
  };

  const addRecord = () => {
    console.log("Adding record:", {
      workout,
      recordType,
      recordValue,
      weightUnit,
    });
    if (workout && recordValue) {
      setError("");
      const newRecord = {
        workout,
        recordType,
        recordValue:
          recordType === "weight"
            ? `${recordValue} ${weightUnit}`
            : recordValue.trim(),
        date: new Date().toISOString(),
      };
      const newRecords = [...records, newRecord];
      setRecords(newRecords);
      try {
        localStorage.setItem("dailyhero_records", JSON.stringify(newRecords));
        console.log("Record added and saved to localStorage:", newRecord);
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      if (!workoutOptions.includes(workout)) {
        setWorkoutOptions([...workoutOptions, workout]);
        console.log("New workout added to options:", workout);
      }
      clearFields();
    } else {
      console.log("Workout or recordValue is missing");
    }
  };

  const deleteRecord = (index) => {
    console.log("Deleting record at index:", index);
    const updatedRecords = records.filter((_, i) => i !== index);
    setRecords(updatedRecords);
    try {
      localStorage.setItem("dailyhero_records", JSON.stringify(updatedRecords));
      console.log("Record deleted and localStorage updated");
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  };

  const sortRecords = (records) => {
    return records.sort((a, b) => {
      if (a.recordType === "time") {
        return a.recordValue.localeCompare(b.recordValue);
      } else if (a.recordType === "reps") {
        return parseInt(b.recordValue) - parseInt(a.recordValue);
      } else if (a.recordType === "weight") {
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

  return (
    <Box
      padding={6}
      display="flex"
      direction="column"
      alignItems="center"
      width="100%"
    >
      <Text size="500" weight="bold" accessibilityLevel={1}>
        DailyHeroWod - Hero WODs & Hyrox
      </Text>
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
            <SelectList.Option label="Time" value="time" />
            <SelectList.Option label="Weight" value="weight" />
            <SelectList.Option label="Reps" value="reps" />
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
                recordType === "time"
                  ? "Time (HH:MM:SS)"
                  : recordType === "weight"
                  ? "Weight"
                  : "Reps"
              }
              value={recordValue}
              onChange={({ value }) =>
                setRecordValue(
                  recordType === "time" ? formatTimeInput(value) : value
                )
              }
              placeholder={
                recordType === "time"
                  ? "00:00:00"
                  : recordType === "weight"
                  ? "Enter weight"
                  : "Enter reps"
              }
            />
          </Box>
          {recordType === "weight" && (
            <Box marginStart={2}>
              <SelectList
                id="weightUnit"
                label="Unit"
                name="weightUnit"
                onChange={({ value }) => setWeightUnit(value)}
                value={weightUnit}
              >
                <SelectList.Option label="kg" value="kg" />
                <SelectList.Option label="lb" value="lb" />
              </SelectList>
            </Box>
          )}
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
      <Box marginTop={6} width="100%" padding={3} borderStyle="sm">
        <Text size="400" weight="bold">
          Recent Records
        </Text>
        {Object.keys(groupedRecords).map((workout) => {
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
                          {record.recordType === "reps"
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
    </Box>
  );
}

export default DailyHeroWod;
