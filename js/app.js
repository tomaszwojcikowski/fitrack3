// Import the Data Access Layer
import { 
  getAllExercises,
  getExercisesByMuscle,
  addExercise,
  seedDatabase
} from './database.js';

// Import Web Components
import './components/exercise-card.js';
import './components/nav-bar.js';

export default {
  data() {
    return {
      currentView: 'home',
      exercises: [],
      filteredExercises: [],
      selectedMuscleGroup: '',
      loading: true,
      muscleGroups: ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms']
    };
  },
  
  async mounted() {
    // Seed database with initial data if needed
    await seedDatabase();
    
    // Load exercises
    await this.loadExercises();
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
            <div class="stat-card">
              <div class="stat-value">0</div>
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
