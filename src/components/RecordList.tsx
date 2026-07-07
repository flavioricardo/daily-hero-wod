import React from "react";
import { Box, Stack, TextField, Typography } from "@mui/material";
import WorkoutCard from "./WorkoutCard";
import type { WorkoutRecord } from "../types/records";

const RecordList = ({
  groupedRecords,
  searchFilter,
  onSearchFilterChange,
  deleteRecord,
}: {
  groupedRecords: { [key: string]: WorkoutRecord[] };
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  deleteRecord: (record: WorkoutRecord) => void;
}) => {
  const visibleWorkouts = Object.keys(groupedRecords).filter((workout) =>
    workout.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <Box>
      <TextField
        fullWidth
        label="Search Workout"
        value={searchFilter}
        onChange={(e) => onSearchFilterChange(e.target.value)}
        sx={{ mb: 4 }}
      />
      {visibleWorkouts.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
          {Object.keys(groupedRecords).length === 0
            ? "No records yet. Add your first record in the Add Record tab."
            : "No workouts match your search."}
        </Typography>
      )}
      <Stack spacing={4}>
        {visibleWorkouts.map((workout) => (
          <WorkoutCard
            key={workout}
            workout={workout}
            records={groupedRecords[workout]}
            deleteRecord={deleteRecord}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default RecordList;
