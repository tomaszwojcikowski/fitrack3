// program-card.js - Web Component for displaying program cards

class ProgramCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const program = JSON.parse(this.getAttribute('program') || '{}');
    const progress = JSON.parse(this.getAttribute('progress') || 'null');
    
    const progressText = progress 
      ? `Week ${progress.currentWeek}, Day ${progress.currentDay}`
      : 'Not started';
    
    const daysPerWeek = program.schedule && program.schedule[1] 
      ? Object.keys(program.schedule[1]).length 
      : 0;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .program-card {
          background: var(--surface, white);
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 8px;
          padding: 20px;
          box-shadow: var(--shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .program-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md, 0 4px 8px rgba(0, 0, 0, 0.15));
        }
        
        .program-header {
          margin-bottom: 12px;
        }
        
        .program-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: var(--text-primary, #333);
        }
        
        .program-description {
          font-size: 0.9rem;
          color: var(--text-secondary, #666);
          margin: 0 0 16px 0;
          line-height: 1.4;
        }
        
        .program-info {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .info-label {
          font-size: 0.75rem;
          color: var(--text-tertiary, #888);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary, #333);
        }
        
        .progress-info {
          background: var(--background, #f5f5f5);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 16px;
          border: 1px solid var(--border-color, #e0e0e0);
        }
        
        .progress-label {
          font-size: 0.75rem;
          color: var(--text-tertiary, #888);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        
        .progress-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--success-color, #4CAF50);
        }
        
        .program-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        button {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
          min-width: 100px;
        }
        
        .btn-start {
          background: var(--success-color, #4CAF50);
          color: white;
        }
        
        .btn-start:hover {
          background: #45a049;
        }
        
        .btn-continue {
          background: var(--primary-color, #2196F3);
          color: white;
        }
        
        .btn-continue:hover {
          background: var(--primary-dark, #0b7dda);
        }
        
        .btn-view {
          background: var(--background, #f5f5f5);
          color: var(--text-primary, #333);
          border: 1px solid var(--border-color, #e0e0e0);
        }
        
        .btn-view:hover {
          background: var(--surface-elevated, #e0e0e0);
        }
        
        .btn-reset {
          background: var(--warning-color, #ff9800);
          color: white;
        }
        
        .btn-reset:hover {
          background: #fb8c00;
        }
      </style>
      
      <div class="program-card">
        <div class="program-header">
          <h3 class="program-name">${program.name || 'Untitled Program'}</h3>
          <p class="program-description">${program.description || ''}</p>
        </div>
        
        <div class="program-info">
          <div class="info-item">
            <div class="info-label">Duration</div>
            <div class="info-value">${program.durationWeeks || 0} weeks</div>
          </div>
          <div class="info-item">
            <div class="info-label">Days/Week</div>
            <div class="info-value">${daysPerWeek}</div>
          </div>
        </div>
        
        ${progress ? `
          <div class="progress-info">
            <div class="progress-label">Current Progress</div>
            <div class="progress-value">${progressText}</div>
          </div>
        ` : ''}
        
        <div class="program-actions">
          ${!progress ? `
            <button class="btn-start" data-action="start">Start Program</button>
          ` : `
            <button class="btn-continue" data-action="continue">Continue</button>
            <button class="btn-reset" data-action="reset">Reset</button>
          `}
          <button class="btn-view" data-action="view">View Details</button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    this.shadowRoot.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        const program = JSON.parse(this.getAttribute('program') || '{}');
        
        this.dispatchEvent(new CustomEvent('program-action', {
          bubbles: true,
          composed: true,
          detail: {
            action: action,
            programId: program.id
          }
        }));
      });
    });
  }

  static get observedAttributes() {
    return ['program', 'progress'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      this.attachEventListeners();
    }
  }
}

customElements.define('program-card', ProgramCard);
