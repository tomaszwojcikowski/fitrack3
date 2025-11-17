// Import Dexie from local ESM build
import Dexie from '../vendor/dexie.js';

// 1. Initialize the database
const db = new Dexie('WorkoutAppDB');

// Check if IndexedDB is available (detects private browsing mode on iOS)
let dbAvailable = true;
let dbError = null;

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

// 3. Test database availability and open connection
async function checkDatabaseAvailability() {
  if (!dbAvailable) {
    return false;
  }
  
  // First check if IndexedDB is available at all
  if (!window.indexedDB) {
    dbAvailable = false;
    dbError = new Error('IndexedDB is not supported by this browser');
    console.error('IndexedDB not supported');
    return false;
  }
  
  try {
    // Try to open the database to verify it's accessible
    await db.open();
    
    // Additional test: Try to perform a simple transaction to ensure database is fully functional
    // This catches cases where open() succeeds but operations fail (e.g., private browsing on some iOS versions)
    const testCount = await db.exercises.count();
    
    dbAvailable = true;
    dbError = null;
    return true;
  } catch (error) {
    dbAvailable = false;
    dbError = error;
    console.error('Database initialization failed:', error);
    
    // Check specific error types and provide helpful messages
    if (error.name === 'QuotaExceededError' || 
        error.message?.includes('QuotaExceeded') ||
        error.message?.includes('quota')) {
      console.warn('IndexedDB quota exceeded. This can happen in private browsing mode or when storage is full.');
    } else if (error.name === 'InvalidStateError' ||
               error.message?.includes('InvalidState')) {
      console.warn('IndexedDB is in an invalid state. This often occurs in private browsing mode on iOS Safari.');
    } else if (error.name === 'NotFoundError' ||
               error.name === 'VersionError') {
      console.warn('Database version error. This might be resolved by refreshing the page.');
    } else {
      console.warn('IndexedDB is not available. Possible causes: private browsing mode, browser restrictions, or storage issues.');
    }
    
    return false;
  }
}

// Get current database status
export function getDatabaseStatus() {
  return {
    available: dbAvailable,
    error: dbError
  };
}

// Helper function to add timeout to promises (for Android compatibility)
function withTimeout(promise, timeoutMs = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
}

// Get detailed database diagnostics for troubleshooting
export async function getDatabaseDiagnostics() {
  // Safely get database version - only if database is available and opened
  let dbVersion = 'unknown';
  try {
    if (dbAvailable && db.isOpen()) {
      dbVersion = db.verno;
    }
  } catch (error) {
    console.warn('Could not retrieve database version:', error);
  }

  const diagnostics = {
    indexedDBSupported: typeof window.indexedDB !== 'undefined',
    dbAvailable: dbAvailable,
    dbError: dbError ? {
      name: dbError.name,
      message: dbError.message
    } : null,
    dbName: 'WorkoutAppDB',
    dbVersion: dbVersion,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor || 'unknown',
    storageEstimate: null,
    lastCheck: new Date().toISOString()
  };

  // Try to get storage quota information with timeout
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await withTimeout(navigator.storage.estimate(), 3000);
      diagnostics.storageEstimate = {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usageInMB: ((estimate.usage || 0) / (1024 * 1024)).toFixed(2),
        quotaInMB: ((estimate.quota || 0) / (1024 * 1024)).toFixed(2),
        percentUsed: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.warn('Storage estimate failed or timed out:', error.message);
      diagnostics.storageEstimate = { error: 'Unable to retrieve storage estimate: ' + error.message };
    }
  }

  // Try to get table counts if database is available with timeout
  if (dbAvailable) {
    try {
      // Ensure database is open before attempting operations
      if (!db.isOpen()) {
        await withTimeout(db.open(), 3000);
      }
      
      // Get all counts with individual timeouts to prevent hanging
      const [exercises, templates, workoutLogs, programs] = await Promise.all([
        withTimeout(db.exercises.count(), 2000).catch(e => { console.warn('Exercises count timeout'); return 0; }),
        withTimeout(db.workoutTemplates.count(), 2000).catch(e => { console.warn('Templates count timeout'); return 0; }),
        withTimeout(db.workoutLogs.count(), 2000).catch(e => { console.warn('Workout logs count timeout'); return 0; }),
        withTimeout(db.programs.count(), 2000).catch(e => { console.warn('Programs count timeout'); return 0; })
      ]);
      
      diagnostics.tableCounts = {
        exercises,
        templates,
        workoutLogs,
        programs
      };
    } catch (error) {
      console.warn('Failed to retrieve table counts:', error.message);
      diagnostics.tableCounts = { error: 'Unable to retrieve table counts: ' + error.message };
    }
  }

  return diagnostics;
}

// Export database instance and availability checker
export { db, checkDatabaseAvailability, dbAvailable, dbError };

// Helper function to handle database operations with error handling and retry logic
async function handleDbOperation(operation, fallbackValue = null) {
  try {
    if (!dbAvailable) {
      console.warn('Database is not available');
      return fallbackValue;
    }
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    
    // Handle specific error cases that might be recoverable
    if (error.name === 'DatabaseClosedError' || 
        error.message?.includes('not open') ||
        error.message?.includes('Database has been closed')) {
      // Try to reopen the database
      console.log('Attempting to reopen database...');
      const reopened = await checkDatabaseAvailability();
      if (reopened) {
        // Retry the operation once
        try {
          return await operation();
        } catch (retryError) {
          console.error('Database operation retry failed:', retryError);
          return fallbackValue;
        }
      }
    } else if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded. Consider clearing old data or using a different browser.');
      dbAvailable = false;
      dbError = error;
    } else if (error.name === 'InvalidStateError') {
      console.error('Database in invalid state. This is common in private browsing mode.');
      dbAvailable = false;
      dbError = error;
    }
    
    return fallbackValue;
  }
}

// 4. Export the encapsulated DAL API

/**
 * Get exercises, optionally filtered by muscle group
 * @param {string} muscle - Optional muscle group to filter by
 * @returns {Promise<Array>} Array of exercises
 */
export const getExercisesByMuscle = (muscle) => {
  return handleDbOperation(async () => {
    if (!muscle) return db.exercises.toArray();
    return db.exercises.where('muscleGroup').equalsIgnoreCase(muscle).toArray();
  }, []);
};

/**
 * Get all exercises
 * @returns {Promise<Array>} Array of all exercises
 */
export const getAllExercises = () => {
  return handleDbOperation(() => db.exercises.toArray(), []);
};

/**
 * Add a new exercise to the library
 * @param {Object} exercise - Exercise object with name, muscleGroup, type, equipment
 * @returns {Promise<number>} The ID of the newly created exercise
 */
export const addExercise = async (exercise) => {
  return handleDbOperation(() => db.exercises.add(exercise), null);
};

/**
 * Update an existing exercise
 * @param {number} id - Exercise ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<number>} Number of updated records
 */
export const updateExercise = async (id, updates) => {
  return handleDbOperation(() => db.exercises.update(id, updates), 0);
};

/**
 * Delete an exercise
 * @param {number} id - Exercise ID
 * @returns {Promise<void>}
 */
export const deleteExercise = async (id) => {
  return handleDbOperation(() => db.exercises.delete(id), undefined);
};

/**
 * Get an exercise by ID
 * @param {number} id - Exercise ID
 * @returns {Promise<Object>} Exercise object
 */
export const getExerciseById = async (id) => {
  return handleDbOperation(() => db.exercises.get(id), null);
};

/**
 * Add a workout log with performance data
 * @param {Object} logData - Object containing date, templateId, and performance array
 * @returns {Promise<number>} The ID of the newly created log
 */
export const addWorkoutLog = async (logData) => {
  return handleDbOperation(async () => {
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
  }, null);
};

/**
 * Get workout logs, optionally filtered by date range
 * @param {Date} startDate - Optional start date
 * @param {Date} endDate - Optional end date
 * @returns {Promise<Array>} Array of workout logs
 */
export const getWorkoutLogs = async (startDate, endDate) => {
  return handleDbOperation(async () => {
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
  }, []);
};

/**
 * Get performance data for a specific workout log
 * @param {number} logId - Workout log ID
 * @returns {Promise<Array>} Array of performance records
 */
export const getLogPerformance = async (logId) => {
  return handleDbOperation(() => db.logPerformance.where('logId').equals(logId).toArray(), []);
};

/**
 * Add a workout template
 * @param {Object} template - Template object with name and exerciseIds array
 * @returns {Promise<number>} The ID of the newly created template
 */
export const addWorkoutTemplate = async (template) => {
  return handleDbOperation(() => db.workoutTemplates.add(template), null);
};

/**
 * Get all workout templates
 * @returns {Promise<Array>} Array of workout templates
 */
export const getAllTemplates = async () => {
  return handleDbOperation(() => db.workoutTemplates.toArray(), []);
};

/**
 * Get a template by ID
 * @param {number} id - Template ID
 * @returns {Promise<Object>} Template object
 */
export const getTemplateById = async (id) => {
  return handleDbOperation(() => db.workoutTemplates.get(id), null);
};

/**
 * Update a workout template
 * @param {number} id - Template ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<number>} Number of updated records
 */
export const updateTemplate = async (id, updates) => {
  return handleDbOperation(() => db.workoutTemplates.update(id, updates), 0);
};

/**
 * Delete a workout template
 * @param {number} id - Template ID
 * @returns {Promise<void>}
 */
export const deleteTemplate = async (id) => {
  return handleDbOperation(() => db.workoutTemplates.delete(id), undefined);
};

/**
 * Get user settings
 * @param {string} key - Settings key
 * @returns {Promise<Object>} Settings object
 */
export const getUserSettings = async (key = 'default') => {
  return handleDbOperation(() => db.userSettings.get(key), null);
};

/**
 * Save user settings
 * @param {string} key - Settings key
 * @param {Object} settings - Settings object
 * @returns {Promise<string>} The settings key
 */
export const saveUserSettings = async (key = 'default', settings) => {
  return handleDbOperation(() => db.userSettings.put({ id: key, ...settings }), null);
};

/**
 * Add a program
 * @param {Object} program - Program object with name, description, durationWeeks, and schedule
 * @returns {Promise<number>} The ID of the newly created program
 */
export const addProgram = async (program) => {
  return handleDbOperation(() => db.programs.add(program), null);
};

/**
 * Get all programs
 * @returns {Promise<Array>} Array of programs
 */
export const getAllPrograms = async () => {
  return handleDbOperation(() => db.programs.toArray(), []);
};

/**
 * Get a program by ID
 * @param {number} id - Program ID
 * @returns {Promise<Object>} Program object
 */
export const getProgramById = async (id) => {
  return handleDbOperation(() => db.programs.get(id), null);
};

/**
 * Update a program
 * @param {number} id - Program ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<number>} Number of updated records
 */
export const updateProgram = async (id, updates) => {
  return handleDbOperation(() => db.programs.update(id, updates), 0);
};

/**
 * Delete a program
 * @param {number} id - Program ID
 * @returns {Promise<void>}
 */
export const deleteProgram = async (id) => {
  return handleDbOperation(() => db.programs.delete(id), undefined);
};

/**
 * Get or initialize program progress
 * @param {number} programId - Program ID
 * @returns {Promise<Object>} Program progress object
 */
export const getProgramProgress = async (programId) => {
  return handleDbOperation(async () => {
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
  }, null);
};

/**
 * Update program progress
 * @param {number} programId - Program ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<number>} Number of updated records
 */
export const updateProgramProgress = async (programId, updates) => {
  return handleDbOperation(async () => {
    const progress = await getProgramProgress(programId);
    if (!progress) return 0;
    return db.programProgress.put({ ...progress, ...updates });
  }, 0);
};

/**
 * Reset program progress
 * @param {number} programId - Program ID
 * @returns {Promise<void>}
 */
export const resetProgramProgress = async (programId) => {
  return handleDbOperation(() => db.programProgress.put({
    id: programId,
    programId: programId,
    currentWeek: 1,
    currentDay: 1,
    startDate: new Date().toISOString(),
    lastWorkoutDate: null
  }), undefined);
};

/**
 * Seed the database with initial data for testing/demo purposes
 * @returns {Promise<void>}
 */
export const seedDatabase = async () => {
  return handleDbOperation(async () => {
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
  }, undefined);
};

/**
 * Add a block to a program
 * @param {Object} block - Block object with programId, blockNumber, name, goals, skillA, skillB, weekStart, weekEnd
 * @returns {Promise<number>} The ID of the newly created block
 */
export const addBlock = async (block) => {
  return handleDbOperation(() => db.blocks.add(block), null);
};

/**
 * Get blocks for a program
 * @param {number} programId - Program ID
 * @returns {Promise<Array>} Array of blocks
 */
export const getBlocksByProgramId = async (programId) => {
  return handleDbOperation(() => db.blocks.where('programId').equals(programId).sortBy('blockNumber'), []);
};

/**
 * Add a mobility flow
 * @param {Object} flow - Flow object with name, flowNumber, description, steps
 * @returns {Promise<number>} The ID of the newly created flow
 */
export const addMobilityFlow = async (flow) => {
  return handleDbOperation(() => db.mobilityFlows.add(flow), null);
};

/**
 * Get all mobility flows
 * @returns {Promise<Array>} Array of mobility flows
 */
export const getAllMobilityFlows = async () => {
  return handleDbOperation(() => db.mobilityFlows.orderBy('flowNumber').toArray(), []);
};

/**
 * Get a mobility flow by ID
 * @param {number} id - Flow ID
 * @returns {Promise<Object>} Flow object
 */
export const getMobilityFlowById = async (id) => {
  return handleDbOperation(() => db.mobilityFlows.get(id), null);
};

/**
 * Add an exercise instance to a template
 * @param {Object} instance - Exercise instance with templateId, exerciseId, phase, label, sets, reps, rest, weight, etc.
 * @returns {Promise<number>} The ID of the newly created instance
 */
export const addExerciseInstance = async (instance) => {
  return handleDbOperation(() => db.exerciseInstances.add(instance), null);
};

/**
 * Get exercise instances for a template
 * @param {number} templateId - Template ID
 * @returns {Promise<Array>} Array of exercise instances
 */
export const getExerciseInstancesByTemplateId = async (templateId) => {
  return handleDbOperation(() => db.exerciseInstances.where('templateId').equals(templateId).toArray(), []);
};

/**
 * Get exercise instances for a template grouped by phase
 * @param {number} templateId - Template ID
 * @returns {Promise<Object>} Object with phases as keys and arrays of instances as values
 */
export const getExerciseInstancesByPhase = async (templateId) => {
  return handleDbOperation(async () => {
    const instances = await db.exerciseInstances.where('templateId').equals(templateId).toArray();
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
  }, { prepare: [], practice: [], perform: [], ponder: [] });
};

/**
 * Update an exercise instance
 * @param {number} id - Instance ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<number>} Number of updated records
 */
export const updateExerciseInstance = async (id, updates) => {
  return handleDbOperation(() => db.exerciseInstances.update(id, updates), 0);
};

/**
 * Delete an exercise instance
 * @param {number} id - Instance ID
 * @returns {Promise<void>}
 */
export const deleteExerciseInstance = async (id) => {
  return handleDbOperation(() => db.exerciseInstances.delete(id), undefined);
};
