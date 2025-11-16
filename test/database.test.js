// This file is loaded as a module in test.html
// It can import from the actual application source code
import { 
  db,
  getExercisesByMuscle,
  getAllExercises,
  addExercise,
  updateExercise,
  deleteExercise,
  getExerciseById,
  addWorkoutLog,
  getWorkoutLogs,
  getLogPerformance,
  addWorkoutTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  getUserSettings,
  saveUserSettings,
  seedDatabase
} from '../js/database.js';

describe('Database Access Layer', function() {
  
  // Clear the DB before each test
  beforeEach(async function() {
    await db.exercises.clear();
    await db.exerciseVariations.clear();
    await db.workoutTemplates.clear();
    await db.workoutLogs.clear();
    await db.logPerformance.clear();
    await db.userSettings.clear();
  });

  describe('Exercise Management', function() {
    
    it('should add and retrieve exercises', async function() {
      await db.exercises.bulkAdd([
        { name: 'Squat', muscleGroup: 'Legs', type: 'Compound', equipment: 'Barbell' },
        { name: 'Bench Press', muscleGroup: 'Chest', type: 'Compound', equipment: 'Barbell' }
      ]);

      const legs = await getExercisesByMuscle('Legs');
      
      assert.equal(legs.length, 1);
      assert.equal(legs[0].name, 'Squat');
    });

    it('should retrieve all exercises when no muscle group specified', async function() {
      await db.exercises.bulkAdd([
        { name: 'Squat', muscleGroup: 'Legs', type: 'Compound', equipment: 'Barbell' },
        { name: 'Bench Press', muscleGroup: 'Chest', type: 'Compound', equipment: 'Barbell' }
      ]);

      const all = await getExercisesByMuscle();
      
      assert.equal(all.length, 2);
    });

    it('should add a new exercise', async function() {
      const id = await addExercise({
        name: 'Deadlift',
        muscleGroup: 'Back',
        type: 'Compound',
        equipment: 'Barbell'
      });

      assert.isNumber(id);
      
      const exercise = await getExerciseById(id);
      assert.equal(exercise.name, 'Deadlift');
      assert.equal(exercise.muscleGroup, 'Back');
    });

    it('should update an existing exercise', async function() {
      const id = await addExercise({
        name: 'Squat',
        muscleGroup: 'Legs',
        type: 'Compound',
        equipment: 'Barbell'
      });

      await updateExercise(id, { equipment: 'Dumbbell' });
      
      const updated = await getExerciseById(id);
      assert.equal(updated.equipment, 'Dumbbell');
      assert.equal(updated.name, 'Squat'); // Other fields unchanged
    });

    it('should delete an exercise', async function() {
      const id = await addExercise({
        name: 'Test Exercise',
        muscleGroup: 'Arms',
        type: 'Isolation',
        equipment: 'Dumbbell'
      });

      await deleteExercise(id);
      
      const deleted = await getExerciseById(id);
      assert.isUndefined(deleted);
    });

    it('should perform case-insensitive muscle group search', async function() {
      await db.exercises.bulkAdd([
        { name: 'Squat', muscleGroup: 'Legs', type: 'Compound', equipment: 'Barbell' },
        { name: 'Lunge', muscleGroup: 'Legs', type: 'Compound', equipment: 'Bodyweight' }
      ]);

      const legs = await getExercisesByMuscle('legs'); // lowercase
      assert.equal(legs.length, 2);
    });
  });

  describe('Workout Logging', function() {
    
    it('should add a workout log with performance data', async function() {
      const logData = {
        date: new Date('2024-01-15').toISOString(),
        templateId: 1,
        performance: [
          { exerciseId: 1, sets: 3, reps: 10, weight: 135 },
          { exerciseId: 2, sets: 3, reps: 8, weight: 185 }
        ]
      };

      const logId = await addWorkoutLog(logData);
      
      assert.isNumber(logId);
      
      // Verify the log was created
      const logs = await getWorkoutLogs();
      assert.equal(logs.length, 1);
      assert.equal(logs[0].templateId, 1);
      
      // Verify performance data was created
      const performance = await getLogPerformance(logId);
      assert.equal(performance.length, 2);
      assert.equal(performance[0].exerciseId, 1);
      assert.equal(performance[0].sets, 3);
    });

    it('should retrieve workout logs', async function() {
      await addWorkoutLog({
        date: new Date('2024-01-15').toISOString(),
        templateId: 1,
        performance: [{ exerciseId: 1, sets: 3, reps: 10, weight: 135 }]
      });

      await addWorkoutLog({
        date: new Date('2024-01-20').toISOString(),
        templateId: 2,
        performance: [{ exerciseId: 2, sets: 3, reps: 8, weight: 185 }]
      });

      const logs = await getWorkoutLogs();
      assert.equal(logs.length, 2);
    });
  });

  describe('Workout Templates', function() {
    
    it('should add a workout template', async function() {
      const template = {
        name: 'Push Day',
        exerciseIds: [1, 2, 3]
      };

      const id = await addWorkoutTemplate(template);
      
      assert.isNumber(id);
      
      const saved = await getTemplateById(id);
      assert.equal(saved.name, 'Push Day');
      assert.deepEqual(saved.exerciseIds, [1, 2, 3]);
    });

    it('should retrieve all templates', async function() {
      await addWorkoutTemplate({ name: 'Push Day', exerciseIds: [1, 2] });
      await addWorkoutTemplate({ name: 'Pull Day', exerciseIds: [3, 4] });

      const templates = await getAllTemplates();
      assert.equal(templates.length, 2);
    });

    it('should update a template', async function() {
      const id = await addWorkoutTemplate({
        name: 'Push Day',
        exerciseIds: [1, 2]
      });

      await updateTemplate(id, { name: 'Push Day A', exerciseIds: [1, 2, 3] });
      
      const updated = await getTemplateById(id);
      assert.equal(updated.name, 'Push Day A');
      assert.equal(updated.exerciseIds.length, 3);
    });

    it('should delete a template', async function() {
      const id = await addWorkoutTemplate({
        name: 'Test Template',
        exerciseIds: [1]
      });

      await deleteTemplate(id);
      
      const deleted = await getTemplateById(id);
      assert.isUndefined(deleted);
    });
  });

  describe('User Settings', function() {
    
    it('should save and retrieve user settings', async function() {
      await saveUserSettings('default', {
        theme: 'dark',
        units: 'metric'
      });

      const settings = await getUserSettings('default');
      assert.equal(settings.theme, 'dark');
      assert.equal(settings.units, 'metric');
    });

    it('should update existing settings', async function() {
      await saveUserSettings('default', { theme: 'light' });
      await saveUserSettings('default', { theme: 'dark', units: 'imperial' });

      const settings = await getUserSettings('default');
      assert.equal(settings.theme, 'dark');
      assert.equal(settings.units, 'imperial');
    });
  });

  describe('Database Seeding', function() {
    
    it('should seed the database with initial exercises', async function() {
      await seedDatabase();
      
      const exercises = await getAllExercises();
      assert.isAtLeast(exercises.length, 5);
      
      // Check that common exercises are present
      const exerciseNames = exercises.map(e => e.name);
      assert.include(exerciseNames, 'Squat');
      assert.include(exerciseNames, 'Bench Press');
      assert.include(exerciseNames, 'Deadlift');
    });

    it('should not seed if database already has data', async function() {
      await addExercise({
        name: 'Custom Exercise',
        muscleGroup: 'Test',
        type: 'Test',
        equipment: 'Test'
      });

      await seedDatabase();
      
      const exercises = await getAllExercises();
      // Should only have the one exercise we added
      assert.equal(exercises.length, 1);
    });
  });
});
