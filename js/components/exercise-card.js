// Define the exercise-card Web Component
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
    
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .badge.compound {
      background-color: rgba(59, 130, 246, 0.15);
      color: var(--primary-light, #3b82f6);
    }
    
    .badge.isolation {
      background-color: rgba(168, 85, 247, 0.15);
      color: #a855f7;
    }
    
    .card-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
    }
    
    .detail-label {
      font-weight: 500;
      color: var(--text-primary, #333);
    }
    
    .muscle-group {
      color: var(--primary-light, #3b82f6);
    }
    
    .equipment {
      color: var(--secondary-color, #ff9800);
    }
  </style>
  
  <div class="card">
    <div class="card-header">
      <h3 id="name"></h3>
      <span id="type-badge" class="badge"></span>
    </div>
    <div class="card-body">
      <div class="detail-row">
        <span class="detail-label">Muscle:</span>
        <span id="muscle" class="muscle-group"></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Equipment:</span>
        <span id="equipment" class="equipment"></span>
      </div>
    </div>
  </div>
`;

class ExerciseCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  // Vue will pass data by setting the property
  set exercise(data) {
    if (!data) return;
    
    this.shadowRoot.querySelector('#name').textContent = data.name;
    this.shadowRoot.querySelector('#muscle').textContent = data.muscleGroup || 'N/A';
    this.shadowRoot.querySelector('#equipment').textContent = data.equipment || 'N/A';
    
    const typeBadge = this.shadowRoot.querySelector('#type-badge');
    typeBadge.textContent = data.type || 'N/A';
    typeBadge.className = `badge ${(data.type || '').toLowerCase()}`;
  }

  // Support for Vue attribute binding
  static get observedAttributes() {
    return ['data-exercise'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-exercise' && newValue) {
      try {
        this.exercise = JSON.parse(newValue);
      } catch (e) {
        console.error('Failed to parse exercise data:', e);
      }
    }
  }
}

// Register the custom element
customElements.define('exercise-card', ExerciseCard);
