// Define the template-card Web Component
const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* Encapsulated styles via Shadow DOM */
    :host {
      display: block;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      padding: 1rem;
      background: var(--surface, white);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    :host(:hover) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.1));
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 0.75rem;
    }
    
    h3 {
      margin: 0;
      font-size: 1.125rem;
      color: var(--text-primary, #1a1a1a);
      font-weight: 600;
    }
    
    .exercise-count {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      background-color: rgba(59, 130, 246, 0.15);
      color: var(--primary-light, #3b82f6);
    }
    
    .card-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .exercise-list {
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      line-height: 1.5;
    }
    
    .card-footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color, #e0e0e0);
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background-color: var(--primary-color, #1976d2);
      color: white;
    }
    
    .btn-primary:hover {
      background-color: var(--primary-dark, #115293);
    }
    
    .btn-secondary {
      background-color: var(--background, #f5f5f5);
      color: var(--text-primary, #1a1a1a);
      border: 1px solid var(--border-color, #e0e0e0);
    }
    
    .btn-secondary:hover {
      background-color: var(--surface-elevated, #e0e0e0);
    }
    
    .btn-danger {
      background-color: var(--danger-color, #f44336);
      color: white;
    }
    
    .btn-danger:hover {
      background-color: #d32f2f;
    }
  </style>
  
  <div class="card">
    <div class="card-header">
      <h3 id="name"></h3>
      <span id="exercise-count" class="exercise-count"></span>
    </div>
    <div class="card-body">
      <div id="exercise-list" class="exercise-list"></div>
    </div>
    <div class="card-footer">
      <button class="btn btn-primary" data-action="start">Start Workout</button>
      <button class="btn btn-secondary" data-action="edit">Edit</button>
      <button class="btn btn-danger" data-action="delete">Delete</button>
    </div>
  </div>
`;

class TemplateCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    // Bind click handlers
    this.shadowRoot.addEventListener('click', (e) => {
      const button = e.target.closest('[data-action]');
      if (button) {
        const action = button.dataset.action;
        this.dispatchEvent(new CustomEvent(`template-${action}`, {
          detail: { templateId: this._templateId },
          bubbles: true,
          composed: true
        }));
      }
    });
  }

  // Vue will pass data by setting the property
  set template(data) {
    if (!data) return;
    
    this._templateId = data.id;
    this.shadowRoot.querySelector('#name').textContent = data.name;
    
    // Check exercises array first (for enhanced templates), then fall back to exerciseIds
    const exerciseCount = data.exercises && data.exercises.length > 0 
      ? data.exercises.length 
      : (data.exerciseIds ? data.exerciseIds.length : 0);
    this.shadowRoot.querySelector('#exercise-count').textContent = `${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}`;
    
    // Display exercise names if provided
    if (data.exercises && data.exercises.length > 0) {
      const exerciseNames = data.exercises.map(ex => ex.name).join(', ');
      this.shadowRoot.querySelector('#exercise-list').textContent = exerciseNames;
    } else if (exerciseCount > 0) {
      this.shadowRoot.querySelector('#exercise-list').textContent = `${exerciseCount} exercises`;
    } else {
      this.shadowRoot.querySelector('#exercise-list').textContent = 'No exercises added yet';
    }
  }

  // Support for Vue attribute binding
  static get observedAttributes() {
    return ['data-template'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-template' && newValue) {
      try {
        this.template = JSON.parse(newValue);
      } catch (e) {
        console.error('Failed to parse template data:', e);
      }
    }
  }
}

// Register the custom element
customElements.define('template-card', TemplateCard);
