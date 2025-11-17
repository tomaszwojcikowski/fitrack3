// Import the Data Access Layer
import { 
  getAllExercises,
  getExercisesByMuscle,
  addExercise,
  seedDatabase,
  getAllTemplates,
  addWorkoutTemplate,
  updateTemplate,
  deleteTemplate,
  getExerciseById,
  addWorkoutLog,
  getWorkoutLogs,
  getLogPerformance,
  getUserSettings,
  saveUserSettings,
  getAllPrograms,
  getProgramById,
  getProgramProgress,
  updateProgramProgress,
  resetProgramProgress,
  getTemplateById,
  // New functions for enhanced program support
  addBlock,
  getBlocksByProgramId,
  addMobilityFlow,
  getAllMobilityFlows,
  getMobilityFlowById,
  addExerciseInstance,
  getExerciseInstancesByTemplateId,
  getExerciseInstancesByPhase,
  // Database availability checking
  checkDatabaseAvailability
} from './database.js';

// Import the 20-week program seeder
import { seed20WeekProgram } from './seed-20week-program.js';

// Import Web Components
import './components/exercise-card.js';
import './components/nav-bar.js';
import './components/template-card.js';
import './components/workout-session.js';
import './components/program-card.js';

export default {
  data() {
    return {
      currentView: 'home',
      exercises: [],
      filteredExercises: [],
      selectedMuscleGroup: '',
      loading: true,
      muscleGroups: ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'],
      templates: [],
      showTemplateForm: false,
      templateForm: {
        id: null,
        name: '',
        selectedExerciseIds: []
      },
      activeWorkout: null,
      workoutExercises: [],
      workoutLogs: [],
      settings: {
        weightUnit: 'lbs',
        theme: 'light'
      },
      versionInfo: null,
      programs: [],
      programsProgress: {},
      activeProgram: null,
      currentTab: 'templates',
      dbAvailable: true,
      dbError: null,
      restTimer: {
        active: false,
        remaining: 0,
        total: 0,
        exerciseIndex: null,
        interval: null
      }
    };
  },
  
  async mounted() {
    // Check if database is available (handles private browsing mode on mobile)
    this.dbAvailable = await checkDatabaseAvailability();
    
    if (!this.dbAvailable) {
      this.dbError = 'Database is not available. This may be due to private browsing mode or browser restrictions. Some features may not work properly.';
      console.warn(this.dbError);
      this.loading = false;
      return;
    }
    
    // Seed database with initial data if needed
    try {
      await seedDatabase();
    } catch (error) {
      console.error('Error seeding database:', error);
      this.dbError = 'Failed to initialize database. Please refresh the page.';
    }
    
    // Seed 20-week program if not already present
    try {
      await seed20WeekProgram();
    } catch (error) {
      console.error('Error seeding 20-week program:', error);
    }
    
    // Load exercises, templates, history, settings, programs, and version info
    try {
      await Promise.all([
        this.loadExercises(),
        this.loadTemplates(),
        this.loadWorkoutHistory(),
        this.loadSettings(),
        this.loadPrograms(),
        this.loadVersionInfo()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      this.dbError = 'Failed to load data from database. Please refresh the page.';
    }
    
    this.loading = false;
  },
  
  methods: {
    async loadExercises() {
      this.loading = true;
      try {
        this.exercises = await getAllExercises();
        this.filteredExercises = this.exercises;
      } catch (error) {
        console.error('Failed to load exercises:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async filterByMuscleGroup(muscleGroup) {
      this.selectedMuscleGroup = muscleGroup;
      this.loading = true;
      
      try {
        if (muscleGroup === 'All' || !muscleGroup) {
          this.filteredExercises = this.exercises;
        } else {
          this.filteredExercises = await getExercisesByMuscle(muscleGroup);
        }
      } catch (error) {
        console.error('Failed to filter exercises:', error);
      } finally {
        this.loading = false;
      }
    },
    
    handleFabClick() {
      if (this.currentView === 'templates') {
        this.openTemplateForm();
      } else if (this.currentView === 'library') {
        this.navigate('workout');
      }
    },
    
    navigate(view) {
      // Animate out current view
      const mainContent = document.querySelector('.main-content');
      if (mainContent && window.gsap) {
        window.gsap.to(mainContent, {
          opacity: 0,
          y: -10,
          duration: 0.2,
          onComplete: () => {
            this.currentView = view;
            // Load data when navigating to specific views
            if (view === 'templates') {
              this.currentTab = 'templates';
              this.loadTemplates();
            } else if (view === 'programs') {
              this.currentTab = 'programs';
              this.loadPrograms();
              this.loadTemplates(); // Need templates for program schedule
            } else if (view === 'history') {
              this.loadWorkoutHistory();
            } else if (view === 'settings') {
              this.loadSettings();
            }
            // Animate in new view
            this.$nextTick(() => {
              window.gsap.fromTo(mainContent, 
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.3 }
              );
            });
          }
        });
      } else {
        // Fallback without animation
        this.currentView = view;
        if (view === 'templates') {
          this.currentTab = 'templates';
          this.loadTemplates();
        } else if (view === 'programs') {
          this.currentTab = 'programs';
          this.loadPrograms();
          this.loadTemplates(); // Need templates for program schedule
        } else if (view === 'history') {
          this.loadWorkoutHistory();
        } else if (view === 'settings') {
          this.loadSettings();
        }
      }
    },
    
    async loadTemplates() {
      this.loading = true;
      try {
        const templates = await getAllTemplates();
        // Enrich templates with exercise details
        this.templates = await Promise.all(templates.map(async (template) => {
          let exercises = [];
          
          // Check if template uses exerciseIds (legacy/simple templates)
          if (template.exerciseIds && template.exerciseIds.length > 0) {
            exercises = await Promise.all(
              template.exerciseIds.map(id => getExerciseById(id))
            );
          } else {
            // If no exerciseIds, check for exerciseInstances (enhanced templates)
            const instances = await getExerciseInstancesByTemplateId(template.id);
            if (instances && instances.length > 0) {
              // Get unique exercise IDs from instances, filtering out null/undefined
              const uniqueExerciseIds = [...new Set(instances.map(inst => inst.exerciseId).filter(id => id != null))];
              if (uniqueExerciseIds.length > 0) {
                exercises = await Promise.all(
                  uniqueExerciseIds.map(id => getExerciseById(id))
                );
              }
            }
          }
          
          return {
            ...template,
            exercises: exercises.filter(ex => ex) // Filter out null results
          };
        }));
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        this.loading = false;
      }
    },
    
    openTemplateForm(template = null) {
      if (template) {
        // Edit mode
        this.templateForm = {
          id: template.id,
          name: template.name,
          selectedExerciseIds: [...(template.exerciseIds || [])]
        };
      } else {
        // Create mode
        this.templateForm = {
          id: null,
          name: '',
          selectedExerciseIds: []
        };
      }
      this.showTemplateForm = true;
    },
    
    closeTemplateForm() {
      this.showTemplateForm = false;
    },
    
    toggleExerciseSelection(exerciseId) {
      const index = this.templateForm.selectedExerciseIds.indexOf(exerciseId);
      if (index > -1) {
        this.templateForm.selectedExerciseIds.splice(index, 1);
      } else {
        this.templateForm.selectedExerciseIds.push(exerciseId);
      }
    },
    
    isExerciseSelected(exerciseId) {
      return this.templateForm.selectedExerciseIds.includes(exerciseId);
    },
    
    async saveTemplate() {
      if (!this.templateForm.name.trim()) {
        alert('Please enter a template name');
        return;
      }
      
      if (this.templateForm.selectedExerciseIds.length === 0) {
        alert('Please select at least one exercise');
        return;
      }
      
      try {
        const templateData = {
          name: this.templateForm.name,
          exerciseIds: this.templateForm.selectedExerciseIds
        };
        
        if (this.templateForm.id) {
          // Update existing template
          await updateTemplate(this.templateForm.id, templateData);
        } else {
          // Create new template
          await addWorkoutTemplate(templateData);
        }
        
        this.closeTemplateForm();
        await this.loadTemplates();
      } catch (error) {
        console.error('Failed to save template:', error);
        alert('Failed to save template');
      }
    },
    
    async handleTemplateStart(templateId) {
      await this.startWorkoutFromTemplate(templateId);
    },
    
    async handleTemplateEdit(templateId) {
      const template = this.templates.find(t => t.id === templateId);
      if (template) {
        this.openTemplateForm(template);
      }
    },
    
    async handleTemplateDelete(templateId) {
      if (!confirm('Are you sure you want to delete this template?')) {
        return;
      }
      
      try {
        await deleteTemplate(templateId);
        await this.loadTemplates();
      } catch (error) {
        console.error('Failed to delete template:', error);
        alert('Failed to delete template');
      }
    },
    
    addSetToExercise(exerciseIndex) {
      const exercise = this.workoutExercises[exerciseIndex];
      const newSetNumber = exercise.sets.length + 1;
      exercise.sets.push({
        setNumber: newSetNumber,
        reps: '',
        weight: '',
        completed: false
      });
    },
    
    onSetCompleted(exerciseIndex, setIndex) {
      const exercise = this.workoutExercises[exerciseIndex];
      const set = exercise.sets[setIndex];
      
      // Auto-start rest timer when a set is completed
      if (set.completed && exercise.rest && !exercise.rest.includes('EMOM')) {
        this.startRestTimer(exercise.rest, exerciseIndex);
      }
    },
    
    startRestTimer(restTime, exerciseIndex) {
      // Parse rest time (e.g., "120s", "90-120s", "2-3min")
      let seconds = 0;
      
      if (restTime.includes('-')) {
        // Take the middle value for ranges
        const parts = restTime.split('-');
        const lower = this.parseTimeToSeconds(parts[0].trim());
        const upper = this.parseTimeToSeconds(parts[1].trim());
        seconds = Math.floor((lower + upper) / 2);
      } else {
        seconds = this.parseTimeToSeconds(restTime);
      }
      
      if (seconds === 0) return;
      
      // Clear any existing timer
      if (this.restTimer.interval) {
        clearInterval(this.restTimer.interval);
      }
      
      // Start new timer
      this.restTimer.active = true;
      this.restTimer.remaining = seconds;
      this.restTimer.total = seconds;
      this.restTimer.exerciseIndex = exerciseIndex;
      
      this.restTimer.interval = setInterval(() => {
        if (this.restTimer.remaining > 0) {
          this.restTimer.remaining--;
        } else {
          // Timer finished
          this.stopRestTimer();
          // Play notification sound or vibrate
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('Rest Complete!', {
              body: 'Time to start your next set',
              icon: '/fitrack3-home.png'
            });
          }
        }
      }, 1000);
    },
    
    stopRestTimer() {
      if (this.restTimer.interval) {
        clearInterval(this.restTimer.interval);
      }
      this.restTimer.active = false;
      this.restTimer.remaining = 0;
      this.restTimer.total = 0;
      this.restTimer.exerciseIndex = null;
      this.restTimer.interval = null;
    },
    
    parseTimeToSeconds(timeStr) {
      timeStr = timeStr.toLowerCase().trim();
      
      // Handle minutes
      if (timeStr.includes('min')) {
        const mins = parseFloat(timeStr.replace(/[^0-9.]/g, ''));
        return Math.floor(mins * 60);
      }
      
      // Handle seconds
      if (timeStr.includes('s')) {
        return parseInt(timeStr.replace(/[^0-9]/g, ''));
      }
      
      // Try to parse as number (assume seconds)
      const num = parseInt(timeStr);
      return isNaN(num) ? 0 : num;
    },
    
    async saveWorkout() {
      if (!this.activeWorkout) return;
      
      // Collect all performance data
      const performance = [];
      
      for (const exercise of this.workoutExercises) {
        for (const set of exercise.sets) {
          if (set.completed && set.reps && set.weight) {
            performance.push({
              exerciseId: exercise.exerciseId,
              sets: 1,
              reps: parseInt(set.reps),
              weight: parseFloat(set.weight)
            });
          }
        }
      }
      
      if (performance.length === 0) {
        alert('Please complete at least one set before saving');
        return;
      }
      
      try {
        const logData = {
          date: this.activeWorkout.startTime,
          templateId: this.activeWorkout.templateId,
          programId: this.activeWorkout.programId || null,
          week: this.activeWorkout.week || null,
          day: this.activeWorkout.day || null,
          performance: performance
        };
        
        await addWorkoutLog(logData);
        
        // If this was part of a program, advance to next day
        if (this.activeWorkout.programId) {
          await this.advanceProgram(this.activeWorkout.programId, this.activeWorkout.week, this.activeWorkout.day);
        }
        
        alert('Workout saved successfully!');
        
        // Clear workout state without confirmation
        this.activeWorkout = null;
        this.workoutExercises = [];
        this.activeProgram = null;
        
        this.navigate('history');
      } catch (error) {
        console.error('Failed to save workout:', error);
        alert('Failed to save workout');
      }
    },
    
    async advanceProgram(programId, currentWeek, currentDay) {
      try {
        const program = await getProgramById(programId);
        if (!program) return;
        
        // Find next workout day
        let nextWeek = currentWeek;
        let nextDay = currentDay;
        let found = false;
        
        // Try next day in current week
        const currentWeekSchedule = program.schedule[currentWeek] || {};
        const daysInCurrentWeek = Object.keys(currentWeekSchedule).map(Number).sort((a, b) => a - b);
        const currentDayIndex = daysInCurrentWeek.indexOf(currentDay);
        
        if (currentDayIndex >= 0 && currentDayIndex < daysInCurrentWeek.length - 1) {
          // Move to next day in current week
          nextDay = daysInCurrentWeek[currentDayIndex + 1];
          found = true;
        } else {
          // Move to next week
          nextWeek = currentWeek + 1;
          
          if (nextWeek <= program.durationWeeks) {
            const nextWeekSchedule = program.schedule[nextWeek] || {};
            const daysInNextWeek = Object.keys(nextWeekSchedule).map(Number).sort((a, b) => a - b);
            
            if (daysInNextWeek.length > 0) {
              nextDay = daysInNextWeek[0];
              found = true;
            }
          } else {
            // Program completed!
            alert(`Congratulations! You've completed the ${program.name} program!`);
            nextWeek = 1;
            nextDay = 1;
            found = true;
          }
        }
        
        if (found) {
          await updateProgramProgress(programId, {
            currentWeek: nextWeek,
            currentDay: nextDay,
            lastWorkoutDate: new Date().toISOString()
          });
          
          await this.loadPrograms();
        }
      } catch (error) {
        console.error('Failed to advance program:', error);
      }
    },
    
    cancelWorkout() {
      if (this.activeWorkout && !confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
        return;
      }
      
      this.activeWorkout = null;
      this.workoutExercises = [];
      this.activeProgram = null;
      this.navigate('home');
    },
    
    async loadWorkoutHistory() {
      this.loading = true;
      try {
        const logs = await getWorkoutLogs();
        
        // Enrich logs with exercise and template details
        this.workoutLogs = await Promise.all(logs.map(async (log) => {
          const performance = await getLogPerformance(log.id);
          
          // Get unique exercise IDs and fetch exercise details
          const exerciseIds = [...new Set(performance.map(p => p.exerciseId))];
          const exercises = await Promise.all(exerciseIds.map(id => getExerciseById(id)));
          
          // Calculate total volume and sets
          const totalVolume = performance.reduce((sum, p) => sum + (p.weight * p.reps), 0);
          const totalSets = performance.length;
          
          return {
            ...log,
            performance,
            exercises: exercises.filter(ex => ex),
            totalVolume,
            totalSets,
            date: new Date(log.date)
          };
        }));
        
        // Sort by date, most recent first
        this.workoutLogs.sort((a, b) => b.date - a.date);
      } catch (error) {
        console.error('Failed to load workout history:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async loadSettings() {
      try {
        const savedSettings = await getUserSettings('default');
        if (savedSettings) {
          this.settings = {
            weightUnit: savedSettings.weightUnit || 'lbs',
            theme: savedSettings.theme || 'light'
          };
        }
        // Apply theme immediately
        this.applyTheme(this.settings.theme);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    },
    
    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
    },
    
    toggleTheme() {
      this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
      this.applyTheme(this.settings.theme);
      this.saveSettings();
    },
    
    async saveSettings() {
      try {
        await saveUserSettings('default', this.settings);
        this.applyTheme(this.settings.theme);
        alert('Settings saved successfully!');
      } catch (error) {
        console.error('Failed to save settings:', error);
        alert('Failed to save settings');
      }
    },
    
    async loadVersionInfo() {
      try {
        const response = await fetch('./version.json');
        if (response.ok) {
          this.versionInfo = await response.json();
        }
      } catch (error) {
        console.error('Failed to load version info:', error);
        // Set default version info if fetch fails
        this.versionInfo = {
          version: '1.0.0',
          commit: 'unknown',
          commitShort: 'unknown',
          branch: 'unknown',
          buildDate: 'unknown',
          buildNumber: '0'
        };
      }
    },
    
    async loadPrograms() {
      this.loading = true;
      try {
        const programs = await getAllPrograms();
        
        // Load progress and blocks for each program
        const dataPromises = programs.map(async (program) => {
          const progress = await getProgramProgress(program.id);
          const blocks = await getBlocksByProgramId(program.id);
          return { programId: program.id, progress, blocks };
        });
        
        const dataResults = await Promise.all(dataPromises);
        
        // Create progress lookup object
        this.programsProgress = {};
        dataResults.forEach(({ programId, progress, blocks }) => {
          this.programsProgress[programId] = progress;
          // Attach blocks to the program object
          const program = programs.find(p => p.id === programId);
          if (program) {
            program.blocks = blocks;
          }
        });
        
        this.programs = programs;
      } catch (error) {
        console.error('Failed to load programs:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async handleProgramAction(event) {
      const { action, programId } = event.detail;
      const program = this.programs.find(p => p.id === programId);
      
      if (!program) return;
      
      if (action === 'start') {
        await this.startProgram(programId);
      } else if (action === 'continue') {
        await this.continueProgram(programId);
      } else if (action === 'reset') {
        if (confirm('Are you sure you want to reset this program? Your progress will be lost.')) {
          await this.resetProgram(programId);
        }
      } else if (action === 'view') {
        await this.viewProgramDetails(programId);
      }
    },
    
    async startProgram(programId) {
      try {
        // Reset progress to start from beginning
        await resetProgramProgress(programId);
        
        // Reload progress
        await this.loadPrograms();
        
        // Continue with the first workout
        await this.continueProgram(programId);
      } catch (error) {
        console.error('Failed to start program:', error);
        alert('Failed to start program');
      }
    },
    
    async continueProgram(programId) {
      try {
        const program = await getProgramById(programId);
        const progress = await getProgramProgress(programId);
        
        if (!program || !progress) {
          alert('Program not found');
          return;
        }
        
        // Get the template for current week and day
        const templateId = program.schedule?.[progress.currentWeek]?.[progress.currentDay];
        
        if (!templateId) {
          alert('No workout scheduled for this day');
          return;
        }
        
        const template = await getTemplateById(templateId);
        
        if (!template) {
          alert('Workout template not found');
          return;
        }
        
        // Set active program context
        this.activeProgram = {
          programId: program.id,
          programName: program.name,
          week: progress.currentWeek,
          day: progress.currentDay,
          totalWeeks: program.durationWeeks
        };
        
        // Initialize workout with program context
        await this.startWorkoutFromTemplate(template.id, program.id, progress.currentWeek, progress.currentDay);
      } catch (error) {
        console.error('Failed to continue program:', error);
        alert('Failed to continue program');
      }
    },
    
    async resetProgram(programId) {
      try {
        await resetProgramProgress(programId);
        await this.loadPrograms();
        alert('Program progress has been reset');
      } catch (error) {
        console.error('Failed to reset program:', error);
        alert('Failed to reset program');
      }
    },
    
    async viewProgramDetails(programId) {
      const program = this.programs.find(p => p.id === programId);
      const progress = this.programsProgress[programId];
      
      if (!program) return;
      
      // Build schedule details
      let scheduleText = `${program.name}\n\n${program.description}\n\n`;
      scheduleText += `Duration: ${program.durationWeeks} weeks\n\n`;
      scheduleText += 'Schedule:\n';
      
      for (let week = 1; week <= program.durationWeeks; week++) {
        scheduleText += `\nWeek ${week}:\n`;
        const weekSchedule = program.schedule[week] || {};
        
        for (const [day, templateId] of Object.entries(weekSchedule)) {
          const template = this.templates.find(t => t.id === templateId);
          scheduleText += `  Day ${day}: ${template?.name || 'Unknown'}\n`;
        }
      }
      
      if (progress && progress.currentWeek) {
        scheduleText += `\n\nCurrent Progress: Week ${progress.currentWeek}, Day ${progress.currentDay}`;
      }
      
      alert(scheduleText);
    },
    
    async startWorkoutFromTemplate(templateId, programId = null, week = null, day = null) {
      const template = this.templates.find(t => t.id === templateId);
      if (!template) return;
      
      // Initialize workout session
      this.activeWorkout = {
        templateId: template.id,
        templateName: template.name,
        programId: programId,
        week: week,
        day: day,
        startTime: new Date().toISOString(),
        exercises: []
      };
      
      // Load exercises for this workout
      let exercises = [];
      
      // Check if template uses exerciseIds (legacy/simple templates)
      if (template.exerciseIds && template.exerciseIds.length > 0) {
        exercises = await Promise.all(
          template.exerciseIds.map(id => getExerciseById(id))
        );
        
        // Initialize workout exercises with empty sets (legacy format)
        this.workoutExercises = exercises.filter(ex => ex).map(exercise => ({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          muscleGroup: exercise.muscleGroup,
          label: '',
          rest: '',
          notes: '',
          coachNotes: exercise.coachNotes || '',
          sets: [
            { setNumber: 1, reps: '', weight: '', completed: false },
            { setNumber: 2, reps: '', weight: '', completed: false },
            { setNumber: 3, reps: '', weight: '', completed: false }
          ]
        }));
      } else {
        // If no exerciseIds, check for exerciseInstances (enhanced templates)
        const instances = await getExerciseInstancesByTemplateId(template.id);
        if (instances && instances.length > 0) {
          // Group instances by phase to preserve program structure
          const instancesByPhase = await getExerciseInstancesByPhase(template.id);
          
          // Create workout exercises from instances, preserving all metadata
          this.workoutExercises = [];
          const phases = ['prepare', 'practice', 'perform', 'ponder'];
          
          for (const phase of phases) {
            const phaseInstances = instancesByPhase[phase] || [];
            for (const instance of phaseInstances) {
              if (!instance.exerciseId) continue;
              
              const exercise = await getExerciseById(instance.exerciseId);
              if (!exercise) continue;
              
              // Parse sets information
              const setsCount = instance.sets ? (instance.sets.includes('x') ? parseInt(instance.sets.split('x')[0]) : parseInt(instance.sets)) : 3;
              const defaultSets = setsCount > 0 && setsCount < 20 ? setsCount : 3;
              
              this.workoutExercises.push({
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                muscleGroup: exercise.muscleGroup,
                phase: phase,
                label: instance.label || '',
                rest: instance.rest || '',
                notes: instance.notes || '',
                reps: instance.reps || '',
                time: instance.time || '',
                weight: instance.weight || '',
                coachNotes: exercise.coachNotes || '',
                sets: Array.from({ length: defaultSets }, (_, i) => ({
                  setNumber: i + 1,
                  reps: '',
                  weight: '',
                  completed: false
                }))
              });
            }
          }
        } else {
          // Fallback: simple template with no instances
          this.workoutExercises = [];
        }
      }
      
      // Navigate to workout view
      this.currentView = 'workout';
    }
  },
  
  template: `
    <div class="app-container">
      <nav-bar 
        :current-view="currentView"
        @navigate="navigate($event.detail.view)"
      ></nav-bar>
      
      <!-- Database Error Banner -->
      <div v-if="!dbAvailable || dbError" class="db-error-banner">
        <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>{{ dbError || 'Database unavailable. App may not work properly in private browsing mode.' }}</span>
      </div>
      
      <main class="main-content">
        <div v-if="currentView === 'home'" class="view-home">
          <h1>Welcome to FiTrack3</h1>
          <p class="subtitle">Your personal workout tracking companion</p>
          
          <div class="quick-actions">
            <button @click="navigate('library')" class="btn btn-primary">
              <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Browse Exercises
            </button>
            <button @click="navigate('workout')" class="btn btn-secondary">
              <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Start Workout
            </button>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ exercises.length }}</div>
              <div class="stat-label">Exercises</div>
            </div>
            <div class="stat-card" @click="navigate('history')" style="cursor: pointer;">
              <div class="stat-value">{{ workoutLogs.length }}</div>
              <div class="stat-label">Workouts</div>
            </div>
            <div class="stat-card" @click="navigate('templates')" style="cursor: pointer;">
              <div class="stat-value">{{ templates.length }}</div>
              <div class="stat-label">Templates</div>
            </div>
          </div>
        </div>
        
        <div v-if="currentView === 'library'" class="view-library">
          <header class="view-header">
            <h1>Exercise Library</h1>
            <div class="filter-controls">
              <label for="muscle-filter">Filter by muscle:</label>
              <select 
                id="muscle-filter" 
                :value="selectedMuscleGroup"
                @change="filterByMuscleGroup($event.target.value)"
                class="select"
              >
                <option v-for="group in muscleGroups" :key="group" :value="group">
                  {{ group }}
                </option>
              </select>
            </div>
          </header>
          
          <div v-if="loading" class="loading">Loading exercises...</div>
          
          <div v-else class="exercise-list">
            <exercise-card
              v-for="exercise in filteredExercises"
              :key="exercise.id"
              :exercise="exercise"
            ></exercise-card>
          </div>
          
          <div v-if="!loading && filteredExercises.length === 0" class="empty-state">
            <p>No exercises found.</p>
          </div>
        </div>
        
        <div v-if="currentView === 'programs'" class="view-programs">
          <header class="view-header">
            <h1>Training Programs</h1>
          </header>
          
          <div v-if="loading" class="loading">Loading programs...</div>
          
          <div v-else-if="programs.length === 0" class="empty-state">
            <p>No programs available yet.</p>
          </div>
          
          <div v-else class="program-list">
            <program-card
              v-for="program in programs"
              :key="program.id"
              :program="JSON.stringify(program)"
              :progress="JSON.stringify(programsProgress[program.id])"
              @program-action="handleProgramAction"
            ></program-card>
          </div>
        </div>
        
        <div v-if="currentView === 'templates'" class="view-templates">
          <header class="view-header">
            <h1>Workout Templates</h1>
            <button @click="openTemplateForm()" class="btn btn-primary">
              <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Create Template
            </button>
          </header>
          
          <div v-if="loading" class="loading">Loading templates...</div>
          
          <div v-else-if="templates.length === 0" class="empty-state">
            <p>No workout templates yet. Create your first template to get started!</p>
          </div>
          
          <div v-else class="template-list">
            <template-card
              v-for="template in templates"
              :key="template.id"
              :template="template"
              @template-start="handleTemplateStart(template.id)"
              @template-edit="handleTemplateEdit(template.id)"
              @template-delete="handleTemplateDelete(template.id)"
            ></template-card>
          </div>
          
          <!-- Template Form Modal -->
          <div v-if="showTemplateForm" class="modal-overlay" @click="closeTemplateForm">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h2>{{ templateForm.id ? 'Edit' : 'Create' }} Template</h2>
                <button @click="closeTemplateForm" class="btn-close">&times;</button>
              </div>
              
              <div class="modal-body">
                <div class="form-group">
                  <label for="template-name">Template Name</label>
                  <input 
                    id="template-name"
                    v-model="templateForm.name"
                    type="text"
                    class="form-input"
                    placeholder="e.g., Push Day, Leg Day"
                  />
                </div>
                
                <div class="form-group">
                  <label>Select Exercises</label>
                  <div class="exercise-selection-list">
                    <div
                      v-for="exercise in exercises"
                      :key="exercise.id"
                      class="exercise-checkbox-item"
                    >
                      <label>
                        <input
                          type="checkbox"
                          :checked="isExerciseSelected(exercise.id)"
                          @change="toggleExerciseSelection(exercise.id)"
                        />
                        <span>{{ exercise.name }}</span>
                        <span class="exercise-detail">{{ exercise.muscleGroup }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="modal-footer">
                <button @click="closeTemplateForm" class="btn btn-secondary">Cancel</button>
                <button @click="saveTemplate" class="btn btn-primary">
                  {{ templateForm.id ? 'Update' : 'Create' }} Template
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="currentView === 'workout'" class="view-workout">
          <div v-if="!activeWorkout">
            <h1>Start Workout</h1>
            <p>Select a template from the Templates page to start a workout, or choose from your recent templates:</p>
            
            <div v-if="templates.length > 0" class="template-list">
              <template-card
                v-for="template in templates.slice(0, 3)"
                :key="template.id"
                :template="template"
                @template-start="handleTemplateStart(template.id)"
              ></template-card>
            </div>
            
            <div v-else class="empty-state">
              <p>Create a workout template first to get started!</p>
              <button @click="navigate('templates')" class="btn btn-primary">Go to Templates</button>
            </div>
          </div>
          
          <div v-else class="workout-active">
            <header class="workout-header">
              <div>
                <h1>{{ activeWorkout.templateName }}</h1>
                <p v-if="activeProgram" class="program-context">
                  {{ activeProgram.programName }} - Week {{ activeProgram.week }}, Day {{ activeProgram.day }}
                </p>
                <p class="workout-time">Started: {{ new Date(activeWorkout.startTime).toLocaleTimeString() }}</p>
              </div>
              <div class="workout-actions">
                <button @click="saveWorkout" class="btn btn-primary">
                  <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                  Save Workout
                </button>
                <button @click="cancelWorkout" class="btn btn-secondary">Cancel</button>
              </div>
            </header>
            
            <workout-session>
              <template v-for="(exercise, exIndex) in workoutExercises" :key="exIndex">
                <!-- Phase Header (only show when phase changes) -->
                <div v-if="exIndex === 0 || exercise.phase !== workoutExercises[exIndex - 1].phase" class="phase-header">
                  <h2 class="phase-title">{{ exercise.phase ? exercise.phase.charAt(0).toUpperCase() + exercise.phase.slice(1) : 'Perform' }}</h2>
                </div>
                
                <div class="exercise-item" :class="{ 'superset-item': exercise.label && exercise.label.match(/B\d/) }">
                  <div class="exercise-header">
                    <div class="exercise-info">
                      <div class="exercise-label-row">
                        <span v-if="exercise.label" class="exercise-label" :class="{ 'label-superset': exercise.label.match(/B\d/) }">
                          {{ exercise.label }}
                        </span>
                        <h3 class="exercise-name">{{ exercise.exerciseName }}</h3>
                      </div>
                      <p class="exercise-muscle">{{ exercise.muscleGroup }}</p>
                      
                      <!-- Exercise metadata -->
                      <div class="exercise-meta">
                        <span v-if="exercise.reps" class="meta-tag">{{ exercise.reps }} reps</span>
                        <span v-if="exercise.time" class="meta-tag">{{ exercise.time }}</span>
                        <span v-if="exercise.weight" class="meta-tag">{{ exercise.weight }}</span>
                        <span v-if="exercise.rest" class="meta-tag rest-tag">Rest: {{ exercise.rest }}</span>
                      </div>
                      
                      <!-- Protocol notes (EMOM, Ladder, etc.) -->
                      <div v-if="exercise.notes" class="protocol-notes">
                        <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <span>{{ exercise.notes }}</span>
                      </div>
                      
                      <!-- Coach notes -->
                      <div v-if="exercise.coachNotes" class="coach-notes">
                        <svg class="icon" viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        </svg>
                        <span>{{ exercise.coachNotes }}</span>
                      </div>
                    </div>
                    
                    <!-- Rest Timer Button -->
                    <button v-if="exercise.rest && !exercise.rest.includes('EMOM')" 
                            @click="startRestTimer(exercise.rest, exIndex)" 
                            class="rest-timer-btn"
                            :class="{ 'timer-active': restTimer.active && restTimer.exerciseIndex === exIndex }">
                      <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                      </svg>
                      <span v-if="restTimer.active && restTimer.exerciseIndex === exIndex">
                        {{ Math.floor(restTimer.remaining / 60) }}:{{ String(restTimer.remaining % 60).padStart(2, '0') }}
                      </span>
                      <span v-else>Timer</span>
                    </button>
                  </div>
                  
                  <div class="sets-list">
                    <div 
                      v-for="(set, setIndex) in exercise.sets" 
                      :key="setIndex"
                      class="set-row"
                      :class="{ completed: set.completed }"
                    >
                      <span class="set-number">Set {{ set.setNumber }}</span>
                      
                      <div class="input-group">
                        <label class="input-label">Reps</label>
                        <input 
                          type="number" 
                          v-model="set.reps"
                          :disabled="set.completed"
                          min="1"
                          placeholder="0"
                        />
                      </div>
                      
                      <div class="input-group">
                        <label class="input-label">Weight (lbs)</label>
                        <input 
                          type="number" 
                          v-model="set.weight"
                          :disabled="set.completed"
                          min="0"
                          step="5"
                          placeholder="0"
                        />
                      </div>
                      
                      <div class="input-group">
                        <label class="input-label">Done</label>
                        <input 
                          type="checkbox" 
                          v-model="set.completed"
                          @change="onSetCompleted(exIndex, setIndex)"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button @click="addSetToExercise(exIndex)" class="add-set-btn">
                    + Add Set
                  </button>
                </div>
              </template>
            </workout-session>
          </div>
        </div>
        
        <div v-if="currentView === 'history'" class="view-history">
          <header class="view-header">
            <h1>Workout History</h1>
          </header>
          
          <div v-if="loading" class="loading">Loading history...</div>
          
          <div v-else-if="workoutLogs.length === 0" class="empty-state">
            <p>No workouts logged yet. Complete a workout to see your history!</p>
            <button @click="navigate('workout')" class="btn btn-primary">Start Workout</button>
          </div>
          
          <div v-else class="history-list">
            <div v-for="log in workoutLogs" :key="log.id" class="history-card">
              <div class="history-header">
                <div>
                  <h3 class="history-date">{{ log.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</h3>
                  <p class="history-time">{{ log.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}</p>
                </div>
                <div class="history-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ log.totalSets }}</span>
                    <span class="stat-label">Sets</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ Math.round(log.totalVolume) }}</span>
                    <span class="stat-label">lbs</span>
                  </div>
                </div>
              </div>
              
              <div class="history-exercises">
                <h4>Exercises</h4>
                <div class="exercise-tags">
                  <span v-for="exercise in log.exercises" :key="exercise.id" class="exercise-tag">
                    {{ exercise.name }}
                  </span>
                </div>
              </div>
              
              <details class="history-details">
                <summary>View Performance Details</summary>
                <div class="performance-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Exercise</th>
                        <th>Reps</th>
                        <th>Weight</th>
                        <th>Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(perf, index) in log.performance" :key="index">
                        <td>{{ log.exercises.find(ex => ex.id === perf.exerciseId)?.name || 'Unknown' }}</td>
                        <td>{{ perf.reps }}</td>
                        <td>{{ perf.weight }} lbs</td>
                        <td>{{ perf.reps * perf.weight }} lbs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          </div>
        </div>
        
        <div v-if="currentView === 'settings'" class="view-settings">
          <header class="view-header">
            <h1>Settings</h1>
          </header>
          
          <div class="settings-container">
            <div class="settings-section">
              <h2>Units</h2>
              <div class="form-group">
                <label for="weight-unit">Weight Unit</label>
                <select id="weight-unit" v-model="settings.weightUnit" class="select">
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
                <p class="form-help">Choose your preferred unit for weight measurements</p>
              </div>
            </div>
            
            <div class="settings-section">
              <h2>Appearance</h2>
              <div class="form-group">
                <label for="theme">Theme</label>
                <select id="theme" v-model="settings.theme" @change="applyTheme(settings.theme)" class="select">
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
                <p class="form-help">Choose your preferred color theme</p>
              </div>
              <div class="form-group">
                <button @click="toggleTheme" class="btn btn-outline" style="width: 100%;">
                  <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                  </svg>
                  Toggle Theme
                </button>
              </div>
            </div>
            
            <div class="settings-section">
              <h2>About</h2>
              <p class="about-text">
                <strong>FiTrack3</strong> - A zero-build workout tracking Progressive Web Application (PWA)
              </p>
              <p class="about-text">
                Built with Vue.js 3, Web Components, and Dexie.js (IndexedDB wrapper).
              </p>
              <div v-if="versionInfo" class="version-info">
                <p class="about-text">
                  <strong>Version:</strong> {{ versionInfo.version }}
                </p>
                <p class="about-text">
                  <strong>Build:</strong> #{{ versionInfo.buildNumber }}
                </p>
                <p class="about-text">
                  <strong>Commit:</strong> {{ versionInfo.commitShort }}
                </p>
                <p class="about-text">
                  <strong>Build Date:</strong> {{ new Date(versionInfo.buildDate).toLocaleDateString() }}
                </p>
              </div>
              <p v-else class="about-text">
                Version 1.0.0-dev
              </p>
            </div>
            
            <div class="settings-actions">
              <button @click="saveSettings" class="btn btn-primary">
                <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <!-- Material Design 3: Bottom Navigation Bar (Mobile Only) -->
      <nav class="bottom-nav">
        <ul class="bottom-nav-items">
          <li class="bottom-nav-item" :class="{ active: currentView === 'home' }" @click="navigate('home')">
            <div :class="{ 'nav-icon-container': currentView === 'home' }">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <span v-if="currentView !== 'home'">Home</span>
          </li>
          <li class="bottom-nav-item" :class="{ active: currentView === 'library' }" @click="navigate('library')">
            <div :class="{ 'nav-icon-container': currentView === 'library' }">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
              </svg>
            </div>
            <span v-if="currentView !== 'library'">Library</span>
          </li>
          <li class="bottom-nav-item" :class="{ active: currentView === 'programs' }" @click="navigate('programs')">
            <div :class="{ 'nav-icon-container': currentView === 'programs' }">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <span v-if="currentView !== 'programs'">Programs</span>
          </li>
          <li class="bottom-nav-item" :class="{ active: currentView === 'templates' }" @click="navigate('templates')">
            <div :class="{ 'nav-icon-container': currentView === 'templates' }">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            </div>
            <span v-if="currentView !== 'templates'">Templates</span>
          </li>
          <li class="bottom-nav-item" :class="{ active: currentView === 'history' }" @click="navigate('history')">
            <div :class="{ 'nav-icon-container': currentView === 'history' }">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
            </div>
            <span v-if="currentView !== 'history'">History</span>
          </li>
          <li class="bottom-nav-item" :class="{ active: currentView === 'settings' }" @click="navigate('settings')">
            <div :class="{ 'nav-icon-container': currentView === 'settings' }">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
            </div>
            <span v-if="currentView !== 'settings'">Settings</span>
          </li>
        </ul>
      </nav>
      
      <!-- Material Design 3: Floating Action Button (FAB) - Mobile Only -->
      <button v-if="currentView === 'templates' || currentView === 'library'" @click="handleFabClick" class="fab" :title="currentView === 'templates' ? 'Create Template' : 'Start Workout'">
        <svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>
    </div>
  `
};
