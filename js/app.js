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
  getExerciseById
} from './database.js';

// Import Web Components
import './components/exercise-card.js';
import './components/nav-bar.js';
import './components/template-card.js';

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
      }
    };
  },
  
  async mounted() {
    // Seed database with initial data if needed
    await seedDatabase();
    
    // Load exercises and templates for home page stats
    await Promise.all([
      this.loadExercises(),
      this.loadTemplates()
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
      this.currentView = view;
      // Load templates when navigating to templates view
      if (view === 'templates') {
        this.loadTemplates();
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
      // TODO: Implement workout start functionality
      console.log('Starting workout with template:', templateId);
      alert('Workout execution coming in next phase!');
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
            <div class="stat-card">
              <div class="stat-value">0</div>
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
          <h1>Start Workout</h1>
          <p>Workout tracking coming soon...</p>
        </div>
        
        <div v-if="currentView === 'history'" class="view-history">
          <h1>Workout History</h1>
          <p>View your past workouts here...</p>
        </div>
        
        <div v-if="currentView === 'settings'" class="view-settings">
          <h1>Settings</h1>
          <p>App settings coming soon...</p>
        </div>
      </main>
    </div>
  `
};
