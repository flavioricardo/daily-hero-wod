import { db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";

const defaultWorkouts = [
  // Benchmarks & Hero WODs
  { name: "Murph", type: "TIME" },
  { name: "Fran", type: "TIME" },
  { name: "Grace", type: "TIME" },
  { name: "Helen", type: "TIME" },
  { name: "Cindy", type: "REPS" },
  { name: "DT", type: "WEIGHT" },
  { name: "Annie", type: "TIME" },
  { name: "Karen", type: "TIME" },
  { name: "Eva", type: "TIME" },
  { name: "Jackie", type: "TIME" },
  { name: "Fight Gone Bad", type: "REPS" },
  { name: "Barbara", type: "REPS" },
  { name: "Chelsea", type: "REPS" },
  { name: "Linda", type: "WEIGHT" },
  { name: "Nancy", type: "TIME" },
  { name: "Kelly", type: "TIME" },
  { name: "Filthy Fifty", type: "TIME" },
  { name: "The Seven", type: "TIME" },
  { name: "Hyrox", type: "TIME" },
  { name: "Hyrox Doubles", type: "TIME" },

  // Levantamentos
  { name: "Back Squat", type: "WEIGHT" },
  { name: "Front Squat", type: "WEIGHT" },
  { name: "Overhead Squat", type: "WEIGHT" },
  { name: "Deadlift", type: "WEIGHT" },
  { name: "Clean", type: "WEIGHT" },
  { name: "Power Clean", type: "WEIGHT" },
  { name: "Squat Clean", type: "WEIGHT" },
  { name: "Snatch", type: "WEIGHT" },
  { name: "Power Snatch", type: "WEIGHT" },
  { name: "Squat Snatch", type: "WEIGHT" },
  { name: "Clean and Jerk", type: "WEIGHT" },
  { name: "Push Press", type: "WEIGHT" },
  { name: "Push Jerk", type: "WEIGHT" },
  { name: "Split Jerk", type: "WEIGHT" },

  // Ginásticos
  { name: "Pull-ups", type: "REPS" },
  { name: "Chest-to-bar Pull-ups", type: "REPS" },
  { name: "Bar Muscle-ups", type: "REPS" },
  { name: "Ring Muscle-ups", type: "REPS" },
  { name: "Handstand Walk", type: "REPS" },
  { name: "Handstand Push-ups", type: "REPS" },
  { name: "Toes-to-Bar", type: "REPS" },
  { name: "Double Unders", type: "REPS" },
  { name: "Rope Climbs", type: "REPS" },

  // Cardio
  { name: "500m Row", type: "TIME" },
  { name: "1k Row", type: "TIME" },
  { name: "2k Row", type: "TIME" },
  { name: "5k Run", type: "TIME" },
  { name: "1 Mile Run", type: "TIME" },
  { name: "Assault Bike 50 cal", type: "TIME" },
  { name: "1000m Ski Erg", type: "TIME" },
];

export async function populateGlobalWorkouts() {
  try {
    for (const wod of defaultWorkouts) {
      const ref = doc(db, "globalWorkouts", wod.name);
      await setDoc(ref, wod);
      console.log(`✅ Workout \"${wod.name}\" added`);
    }
    console.log("🏁 Global workouts successfully added!");
  } catch (error) {
    console.error("❌ Error populating workouts:", error);
  }
}
