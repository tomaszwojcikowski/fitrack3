// Define the nav-bar Web Component
const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* Encapsulated styles via Shadow DOM */
    :host {
      display: block;
      background: #1976d2;
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      cursor: pointer;
      user-select: none;
    }
    
    .brand-icon {
      width: 32px;
      height: 32px;
    }
    
    .nav-links {
      display: flex;
      gap: 0.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .nav-link {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      font-weight: 500;
      user-select: none;
    }
    
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    @media (max-width: 768px) {
      .navbar {
        padding: 1rem;
      }
      
      .nav-links {
        gap: 0.25rem;
      }
      
      .nav-link {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
      }
      
      .brand {
        font-size: 1.25rem;
      }
    }
  </style>
  
  <nav class="navbar">
    <div class="brand" data-view="home">
      <svg class="brand-icon" viewBox="0 0 24 24" fill="white">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
      </svg>
      <span>FiTrack3</span>
    </div>
    
    <ul class="nav-links">
      <li class="nav-link" data-view="home">Home</li>
      <li class="nav-link" data-view="library">Library</li>
      <li class="nav-link" data-view="templates">Templates</li>
      <li class="nav-link" data-view="workout">Workout</li>
      <li class="nav-link" data-view="history">History</li>
      <li class="nav-link" data-view="settings">Settings</li>
    </ul>
  </nav>
`;

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    // Bind click handlers
    this.shadowRoot.addEventListener('click', (e) => {
      const target = e.target.closest('[data-view]');
      if (target) {
        const view = target.dataset.view;
        this.dispatchEvent(new CustomEvent('navigate', {
          detail: { view },
          bubbles: true,
          composed: true
        }));
      }
    });
  }

  set currentView(view) {
    // Update active state
    const links = this.shadowRoot.querySelectorAll('.nav-link');
    links.forEach(link => {
      if (link.dataset.view === view) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  static get observedAttributes() {
    return ['current-view'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'current-view' && newValue) {
      this.currentView = newValue;
    }
  }
}

// Register the custom element
customElements.define('nav-bar', NavBar);
