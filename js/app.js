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
  getTemplateById
} from './database.js';

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
      currentTab: 'templates'
    };
  },
  
  async mounted() {
    // Seed database with initial data if needed
    await seedDatabase();
    
    // Load exercises, templates, history, settings, programs, and version info
    await Promise.all([
      this.loadExercises(),
      this.loadTemplates(),
      this.loadWorkoutHistory(),
      this.loadSettings(),
      this.loadPrograms(),
      this.loadVersionInfo()
    ]);
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
              this.loadTemplates();
              this.loadPrograms();
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
          this.loadTemplates();
          this.loadPrograms();
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
          const exercises = await Promise.all(
            (template.exerciseIds || []).map(id => getExerciseById(id))
          );
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
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    },
    
    async saveSettings() {
      try {
        await saveUserSettings('default', this.settings);
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
        
        // Load progress for each program
        const progressPromises = programs.map(async (program) => {
          const progress = await getProgramProgress(program.id);
          return { programId: program.id, progress };
        });
        
        const progressResults = await Promise.all(progressPromises);
        
        // Create progress lookup object
        this.programsProgress = {};
        progressResults.forEach(({ programId, progress }) => {
          this.programsProgress[programId] = progress;
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
      const exercises = await Promise.all(
        (template.exerciseIds || []).map(id => getExerciseById(id))
      );
      
      // Initialize workout exercises with empty sets
      this.workoutExercises = exercises.filter(ex => ex).map(exercise => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sets: [
          { setNumber: 1, reps: '', weight: '', completed: false },
          { setNumber: 2, reps: '', weight: '', completed: false },
          { setNumber: 3, reps: '', weight: '', completed: false }
        ]
      }));
      
      // Navigate to workout view
      this.currentView = 'workout';
    }
  },
  
  template: `
    <div class="app-container">
      <nav-bar 
        :current-view="currentView"
        @navigate="navigate"
      ></nav-bar>
      
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
        
        <div v-if="currentView === 'templates'" class="view-templates">
          <header class="view-header">
            <h1>Programs & Templates</h1>
          </header>
          
          <!-- Tab Navigation -->
          <div class="tabs">
            <button 
              class="tab-button" 
              :class="{ active: currentTab === 'programs' }"
              @click="currentTab = 'programs'"
            >
              Programs
            </button>
            <button 
              class="tab-button" 
              :class="{ active: currentTab === 'templates' }"
              @click="currentTab = 'templates'"
            >
              Templates
            </button>
          </div>
          
          <!-- Programs Tab -->
          <div v-if="currentTab === 'programs'" class="tab-content">
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
          
          <!-- Templates Tab -->
          <div v-if="currentTab === 'templates'" class="tab-content">
            <div class="tab-header">
              <button @click="openTemplateForm()" class="btn btn-primary">
                <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Create Template
              </button>
            </div>
            
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
              <div v-for="(exercise, exIndex) in workoutExercises" :key="exIndex" class="exercise-item">
                <div class="exercise-header">
                  <div>
                    <h3 class="exercise-name">{{ exercise.exerciseName }}</h3>
                    <p class="exercise-muscle">{{ exercise.muscleGroup }}</p>
                  </div>
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
                      />
                    </div>
                  </div>
                </div>
                
                <button @click="addSetToExercise(exIndex)" class="add-set-btn">
                  + Add Set
                </button>
              </div>
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
                <select id="theme" v-model="settings.theme" class="select">
                  <option value="light">Light</option>
                  <option value="dark">Dark (Coming Soon)</option>
                </select>
                <p class="form-help">Choose your preferred color theme</p>
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
    </div>
  `
};
