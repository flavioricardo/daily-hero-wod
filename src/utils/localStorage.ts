export const loadRecordsFromLocalStorage = (key: string): any[] => {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : [];
  } catch (error) {
    console.error("Error parsing localStorage data:", error);
    return [];
  }
};

export const saveRecordsToLocalStorage = (key: string, data: any[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};
