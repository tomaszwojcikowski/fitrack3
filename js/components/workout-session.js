// Define the workout-session Web Component
const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* Encapsulated styles via Shadow DOM */
    :host {
      display: block;
    }
    
    .session-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .exercise-item {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .exercise-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #1976d2;
    }
    
    .exercise-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }
    
    .exercise-muscle {
      font-size: 0.875rem;
      color: #666;
    }
    
    .sets-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .set-row {
      display: grid;
      grid-template-columns: auto 1fr 1fr 1fr auto;
      gap: 0.75rem;
      align-items: center;
    }
    
    .set-number {
      font-weight: 600;
      color: #1976d2;
      min-width: 50px;
    }
    
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .input-label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    input[type="number"] {
      padding: 0.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 1rem;
      width: 100%;
    }
    
    input[type="number"]:focus {
      outline: 2px solid #1976d2;
      outline-offset: 2px;
      border-color: #1976d2;
    }
    
    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    
    .set-row.completed {
      opacity: 0.6;
    }
    
    .set-row.completed input {
      background-color: #f5f5f5;
    }
    
    .add-set-btn {
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px dashed #1976d2;
      background: none;
      color: #1976d2;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .add-set-btn:hover {
      background-color: #e3f2fd;
    }
    
    @media (max-width: 768px) {
      .set-row {
        grid-template-columns: auto 1fr auto;
        gap: 0.5rem;
      }
      
      .input-group {
        min-width: 0;
      }
    }
  </style>
  
  <div class="session-container">
    <slot></slot>
  </div>
`;

class WorkoutSession extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

// Register the custom element
customElements.define('workout-session', WorkoutSession);
