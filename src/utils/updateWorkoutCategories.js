import { db } from "../firebase";
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";

// Define categorias com base no nome
const getCategory = (name) => {
  const lower = name.toLowerCase();

  if (
    [
      "back squat",
      "front squat",
      "overhead squat",
      "deadlift",
      "clean",
      "power clean",
      "squat clean",
      "snatch",
      "power snatch",
      "squat snatch",
      "clean and jerk",
      "push press",
      "push jerk",
      "split jerk",
    ].includes(lower)
  ) {
    return "Lifts";
  }

  if (
    [
      "pull-ups",
      "chest-to-bar pull-ups",
      "bar muscle-ups",
      "ring muscle-ups",
      "handstand walk",
      "handstand push-ups",
      "toes-to-bar",
      "double unders",
      "rope climbs",
    ].includes(lower)
  ) {
    return "Gymnastics";
  }

  if (
    [
      "500m row",
      "1k row",
      "2k row",
      "5k run",
      "1 mile run",
      "assault bike 50 cal",
      "1000m ski erg",
    ].includes(lower)
  ) {
    return "Cardio";
  }

  if (
    [
      "hyrox",
      "hyrox doubles",
      "murph",
      "fran",
      "grace",
      "helen",
      "cindy",
      "dt",
      "annie",
      "karen",
      "eva",
      "jackie",
      "fight gone bad",
      "barbara",
      "chelsea",
      "linda",
      "nancy",
      "kelly",
      "filthy fifty",
      "the seven",
    ].includes(lower)
  ) {
    return "WOD";
  }

  return "Other";
};

export async function updateWorkoutCategories() {
  try {
    const snapshot = await getDocs(collection(db, "globalWorkouts"));

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const ref = doc(db, "globalWorkouts", docSnap.id);

      const category = getCategory(data.name);

      await updateDoc(ref, { category });
      console.log(`✅ ${data.name} updated with category: ${category}`);
    }

    console.log("🏁 All workouts updated with categories!");
  } catch (error) {
    console.error("❌ Error updating categories:", error);
  }
}
