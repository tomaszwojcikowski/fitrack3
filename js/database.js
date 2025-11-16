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

// Version 2: Add programs table for structured workout programs with weeks/days
db.version(2).stores({
  programs: '++id, name, description, durationWeeks',
  programProgress: 'id, programId, currentWeek, currentDay, startDate, lastWorkoutDate'
});

// Version 3: Enhanced schema for complex programs (20-week integration)
db.version(3).stores({
  exercises: '++id, name, muscleGroup, type, equipment',
  exerciseVariations: '++id, &exerciseId, name, difficulty',
  workoutTemplates: '++id, name, *exerciseIds',
  workoutLogs: '++id, date, templateId',
  logPerformance: '++id, logId, exerciseId',
  userSettings: 'id',
  programs: '++id, name, description, durationWeeks',
  programProgress: 'id, programId, currentWeek, currentDay, startDate, lastWorkoutDate',
  // New tables for enhanced program support
  blocks: '++id, programId, blockNumber, name',
  mobilityFlows: '++id, name, flowNumber',
  exerciseInstances: '++id, templateId, exerciseId, phase, label'
}).upgrade(tx => {
  // Migration: Add new fields to existing exercises
  return tx.table('exercises').toCollection().modify(exercise => {
    if (!exercise.instructions) exercise.instructions = '';
    if (!exercise.coachNotes) exercise.coachNotes = '';
  });
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
    const logEntry = {
      date: logData.date,
      templateId: logData.templateId
    };
    
    // Add program tracking fields if present
    if (logData.programId) {
      logEntry.programId = logData.programId;
    }
    if (logData.week) {
      logEntry.week = logData.week;
    }
    if (logData.day) {
      logEntry.day = logData.day;
    }
    
    const logId = await db.workoutLogs.add(logEntry);

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
 * Add a program
 * @param {Object} program - Program object with name, description, durationWeeks, and schedule
 * @returns {Promise<number>} The ID of the newly created program
 */
export const addProgram = async (program) => {
  return db.programs.add(program);
};

/**
 * Get all programs
 * @returns {Promise<Array>} Array of programs
 */
export const getAllPrograms = async () => {
  return db.programs.toArray();
};

/**
 * Get a program by ID
 * @param {number} id - Program ID
 * @returns {Promise<Object>} Program object
 */
export const getProgramById = async (id) => {
  return db.programs.get(id);
};

/**
 * Update a program
 * @param {number} id - Program ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<number>} Number of updated records
 */
export const updateProgram = async (id, updates) => {
  return db.programs.update(id, updates);
};

/**
 * Delete a program
 * @param {number} id - Program ID
 * @returns {Promise<void>}
 */
export const deleteProgram = async (id) => {
  return db.programs.delete(id);
};

/**
 * Get or initialize program progress
 * @param {number} programId - Program ID
 * @returns {Promise<Object>} Program progress object
 */
export const getProgramProgress = async (programId) => {
  let progress = await db.programProgress.get(programId);
  if (!progress) {
    // Initialize progress
    progress = {
      id: programId,
      programId: programId,
      currentWeek: 1,
      currentDay: 1,
      startDate: new Date().toISOString(),
      lastWorkoutDate: null
    };
    await db.programProgress.put(progress);
  }
  return progress;
};

/**
 * Update program progress
 * @param {number} programId - Program ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<number>} Number of updated records
 */
export const updateProgramProgress = async (programId, updates) => {
  const progress = await getProgramProgress(programId);
  return db.programProgress.put({ ...progress, ...updates });
};

/**
 * Reset program progress
 * @param {number} programId - Program ID
 * @returns {Promise<void>}
 */
export const resetProgramProgress = async (programId) => {
  return db.programProgress.put({
    id: programId,
    programId: programId,
    currentWeek: 1,
    currentDay: 1,
    startDate: new Date().toISOString(),
    lastWorkoutDate: null
  });
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
  
  const programCount = await db.programs.count();
  
  // Seed sample programs if none exist
  if (programCount === 0) {
    // Get exercise IDs for program templates
    const exercises = await db.exercises.toArray();
    const squatId = exercises.find(e => e.name === 'Squat')?.id;
    const benchPressId = exercises.find(e => e.name === 'Bench Press')?.id;
    const deadliftId = exercises.find(e => e.name === 'Deadlift')?.id;
    const overheadPressId = exercises.find(e => e.name === 'Overhead Press')?.id;
    const barbellRowId = exercises.find(e => e.name === 'Barbell Row')?.id;
    const pullUpsId = exercises.find(e => e.name === 'Pull-ups')?.id;
    const dipsId = exercises.find(e => e.name === 'Dips')?.id;
    const lungesId = exercises.find(e => e.name === 'Lunges')?.id;
    
    // Create templates for the programs
    const pushDayId = await db.workoutTemplates.add({
      name: 'Push Day',
      exerciseIds: [benchPressId, overheadPressId, dipsId].filter(id => id)
    });
    
    const pullDayId = await db.workoutTemplates.add({
      name: 'Pull Day',
      exerciseIds: [deadliftId, barbellRowId, pullUpsId].filter(id => id)
    });
    
    const legDayId = await db.workoutTemplates.add({
      name: 'Leg Day',
      exerciseIds: [squatId, lungesId].filter(id => id)
    });
    
    const upperBodyId = await db.workoutTemplates.add({
      name: 'Upper Body',
      exerciseIds: [benchPressId, barbellRowId, overheadPressId].filter(id => id)
    });
    
    const lowerBodyId = await db.workoutTemplates.add({
      name: 'Lower Body',
      exerciseIds: [squatId, deadliftId, lungesId].filter(id => id)
    });
    
    // Add sample programs
    await db.programs.bulkAdd([
      {
        name: 'Beginner Full Body',
        description: 'A 4-week full body program for beginners, training 3 days per week',
        durationWeeks: 4,
        schedule: {
          1: { 1: upperBodyId, 2: lowerBodyId, 3: upperBodyId },
          2: { 1: lowerBodyId, 2: upperBodyId, 3: lowerBodyId },
          3: { 1: upperBodyId, 2: lowerBodyId, 3: upperBodyId },
          4: { 1: lowerBodyId, 2: upperBodyId, 3: lowerBodyId }
        }
      },
      {
        name: 'Push Pull Legs',
        description: 'A 6-week push/pull/legs split, training 6 days per week',
        durationWeeks: 6,
        schedule: {
          1: { 1: pushDayId, 2: pullDayId, 3: legDayId, 4: pushDayId, 5: pullDayId, 6: legDayId },
          2: { 1: pushDayId, 2: pullDayId, 3: legDayId, 4: pushDayId, 5: pullDayId, 6: legDayId },
          3: { 1: pushDayId, 2: pullDayId, 3: legDayId, 4: pushDayId, 5: pullDayId, 6: legDayId },
          4: { 1: pushDayId, 2: pullDayId, 3: legDayId, 4: pushDayId, 5: pullDayId, 6: legDayId },
          5: { 1: pushDayId, 2: pullDayId, 3: legDayId, 4: pushDayId, 5: pullDayId, 6: legDayId },
          6: { 1: pushDayId, 2: pullDayId, 3: legDayId, 4: pushDayId, 5: pullDayId, 6: legDayId }
        }
      }
    ]);
  }
};

/**
 * Add a block to a program
 * @param {Object} block - Block object with programId, blockNumber, name, goals, skillA, skillB, weekStart, weekEnd
 * @returns {Promise<number>} The ID of the newly created block
 */
export const addBlock = async (block) => {
  return db.blocks.add(block);
};

/**
 * Get blocks for a program
 * @param {number} programId - Program ID
 * @returns {Promise<Array>} Array of blocks
 */
export const getBlocksByProgramId = async (programId) => {
  return db.blocks.where('programId').equals(programId).sortBy('blockNumber');
};

/**
 * Add a mobility flow
 * @param {Object} flow - Flow object with name, flowNumber, description, steps
 * @returns {Promise<number>} The ID of the newly created flow
 */
export const addMobilityFlow = async (flow) => {
  return db.mobilityFlows.add(flow);
};

/**
 * Get all mobility flows
 * @returns {Promise<Array>} Array of mobility flows
 */
export const getAllMobilityFlows = async () => {
  return db.mobilityFlows.orderBy('flowNumber').toArray();
};

/**
 * Get a mobility flow by ID
 * @param {number} id - Flow ID
 * @returns {Promise<Object>} Flow object
 */
export const getMobilityFlowById = async (id) => {
  return db.mobilityFlows.get(id);
};

/**
 * Add an exercise instance to a template
 * @param {Object} instance - Exercise instance with templateId, exerciseId, phase, label, sets, reps, rest, weight, etc.
 * @returns {Promise<number>} The ID of the newly created instance
 */
export const addExerciseInstance = async (instance) => {
  return db.exerciseInstances.add(instance);
};

/**
 * Get exercise instances for a template
 * @param {number} templateId - Template ID
 * @returns {Promise<Array>} Array of exercise instances
 */
export const getExerciseInstancesByTemplateId = async (templateId) => {
  return db.exerciseInstances.where('templateId').equals(templateId).toArray();
};

/**
 * Get exercise instances for a template grouped by phase
 * @param {number} templateId - Template ID
 * @returns {Promise<Object>} Object with phases as keys and arrays of instances as values
 */
export const getExerciseInstancesByPhase = async (templateId) => {
  const instances = await getExerciseInstancesByTemplateId(templateId);
  const grouped = {
    prepare: [],
    practice: [],
    perform: [],
    ponder: []
  };
  
  instances.forEach(instance => {
    if (grouped[instance.phase]) {
      grouped[instance.phase].push(instance);
    }
  });
  
  return grouped;
};

/**
 * Update an exercise instance
 * @param {number} id - Instance ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<number>} Number of updated records
 */
export const updateExerciseInstance = async (id, updates) => {
  return db.exerciseInstances.update(id, updates);
};

/**
 * Delete an exercise instance
 * @param {number} id - Instance ID
 * @returns {Promise<void>}
 */
export const deleteExerciseInstance = async (id) => {
  return db.exerciseInstances.delete(id);
};
