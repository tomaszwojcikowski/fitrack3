// Import Dexie from local ESM build
import Dexie from '../vendor/dexie.js';

// 1. Initialize the database
const db = new Dexie('WorkoutAppDB');

// 2. Define the schema (Version 1)
db.version(1).stores({
  exercises: '++id, name, muscleGroup, type, equipment',
  exerciseVariations: '++id, &exerciseId, name, difficulty',
  workoutTemplates: '++id, name, *exerciseIds',
  workoutLogs: '++id, date, templateId',
  logPerformance: '++id, logId, exerciseId',
  userSettings: 'id'
});

// 3. Export the database instance for testing
export { db };

// 4. Export the encapsulated DAL API

/**
 * Get exercises, optionally filtered by muscle group
 * @param {string} muscle - Optional muscle group to filter by
 * @returns {Promise<Array>} Array of exercises
 */
export const getExercisesByMuscle = (muscle) => {
  if (!muscle) return db.exercises.toArray();
  return db.exercises.where('muscleGroup').equalsIgnoreCase(muscle).toArray();
};

/**
 * Get all exercises
 * @returns {Promise<Array>} Array of all exercises
 */
export const getAllExercises = () => {
  return db.exercises.toArray();
};

/**
 * Add a new exercise to the library
 * @param {Object} exercise - Exercise object with name, muscleGroup, type, equipment
 * @returns {Promise<number>} The ID of the newly created exercise
 */
export const addExercise = async (exercise) => {
  return db.exercises.add(exercise);
};

/**
 * Update an existing exercise
 * @param {number} id - Exercise ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<number>} Number of updated records
 */
export const updateExercise = async (id, updates) => {
  return db.exercises.update(id, updates);
};

/**
 * Delete an exercise
 * @param {number} id - Exercise ID
 * @returns {Promise<void>}
 */
export const deleteExercise = async (id) => {
  return db.exercises.delete(id);
};

/**
 * Get an exercise by ID
 * @param {number} id - Exercise ID
 * @returns {Promise<Object>} Exercise object
 */
export const getExerciseById = async (id) => {
  return db.exercises.get(id);
};

/**
 * Add a workout log with performance data
 * @param {Object} logData - Object containing date, templateId, and performance array
 * @returns {Promise<number>} The ID of the newly created log
 */
export const addWorkoutLog = async (logData) => {
  // Dexie transactions ensure data integrity
  return db.transaction('rw', db.workoutLogs, db.logPerformance, async () => {
    const logId = await db.workoutLogs.add({
      date: logData.date,
      templateId: logData.templateId
    });

    const performanceData = logData.performance.map(p => ({
      ...p,
      logId: logId
    }));
    
    await db.logPerformance.bulkAdd(performanceData);
    return logId;
  });
};

/**
 * Get workout logs, optionally filtered by date range
 * @param {Date} startDate - Optional start date
 * @param {Date} endDate - Optional end date
 * @returns {Promise<Array>} Array of workout logs
 */
export const getWorkoutLogs = async (startDate, endDate) => {
  if (!startDate && !endDate) {
    return db.workoutLogs.toArray();
  }
  
  let query = db.workoutLogs;
  
  if (startDate) {
    query = query.where('date').aboveOrEqual(startDate.toISOString());
  }
  
  if (endDate) {
    query = query.where('date').belowOrEqual(endDate.toISOString());
  }
  
  return query.toArray();
};

/**
 * Get performance data for a specific workout log
 * @param {number} logId - Workout log ID
 * @returns {Promise<Array>} Array of performance records
 */
export const getLogPerformance = async (logId) => {
  return db.logPerformance.where('logId').equals(logId).toArray();
};

/**
 * Add a workout template
 * @param {Object} template - Template object with name and exerciseIds array
 * @returns {Promise<number>} The ID of the newly created template
 */
export const addWorkoutTemplate = async (template) => {
  return db.workoutTemplates.add(template);
};

/**
 * Get all workout templates
 * @returns {Promise<Array>} Array of workout templates
 */
export const getAllTemplates = async () => {
  return db.workoutTemplates.toArray();
};

/**
 * Get a template by ID
 * @param {number} id - Template ID
 * @returns {Promise<Object>} Template object
 */
export const getTemplateById = async (id) => {
  return db.workoutTemplates.get(id);
};

/**
 * Update a workout template
 * @param {number} id - Template ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<number>} Number of updated records
 */
export const updateTemplate = async (id, updates) => {
  return db.workoutTemplates.update(id, updates);
};

/**
 * Delete a workout template
 * @param {number} id - Template ID
 * @returns {Promise<void>}
 */
export const deleteTemplate = async (id) => {
  return db.workoutTemplates.delete(id);
};

/**
 * Get user settings
 * @param {string} key - Settings key
 * @returns {Promise<Object>} Settings object
 */
export const getUserSettings = async (key = 'default') => {
  return db.userSettings.get(key);
};

/**
 * Save user settings
 * @param {string} key - Settings key
 * @param {Object} settings - Settings object
 * @returns {Promise<string>} The settings key
 */
export const saveUserSettings = async (key = 'default', settings) => {
  return db.userSettings.put({ id: key, ...settings });
};

/**
 * Seed the database with initial data for testing/demo purposes
 * @returns {Promise<void>}
 */
export const seedDatabase = async () => {
  const exerciseCount = await db.exercises.count();
  
  // Only seed if database is empty
  if (exerciseCount === 0) {
    await db.exercises.bulkAdd([
      { name: 'Squat', muscleGroup: 'Legs', type: 'Compound', equipment: 'Barbell' },
      { name: 'Bench Press', muscleGroup: 'Chest', type: 'Compound', equipment: 'Barbell' },
      { name: 'Deadlift', muscleGroup: 'Back', type: 'Compound', equipment: 'Barbell' },
      { name: 'Overhead Press', muscleGroup: 'Shoulders', type: 'Compound', equipment: 'Barbell' },
      { name: 'Barbell Row', muscleGroup: 'Back', type: 'Compound', equipment: 'Barbell' },
      { name: 'Pull-ups', muscleGroup: 'Back', type: 'Compound', equipment: 'Bodyweight' },
      { name: 'Dips', muscleGroup: 'Chest', type: 'Compound', equipment: 'Bodyweight' },
      { name: 'Lunges', muscleGroup: 'Legs', type: 'Compound', equipment: 'Dumbbell' },
      { name: 'Bicep Curls', muscleGroup: 'Arms', type: 'Isolation', equipment: 'Dumbbell' },
      { name: 'Tricep Extensions', muscleGroup: 'Arms', type: 'Isolation', equipment: 'Dumbbell' }
    ]);
  }
};
