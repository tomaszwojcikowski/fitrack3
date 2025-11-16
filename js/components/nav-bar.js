// Define the nav-bar Web Component
const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* Encapsulated styles via Shadow DOM */
    :host {
      display: block;
      background: var(--primary-color, #1976d2);
      color: white;
      box-shadow: var(--shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
    }
    
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      cursor: pointer;
      user-select: none;
      z-index: 11;
      transition: transform 0.2s;
    }
    
    .brand:hover {
      transform: scale(1.02);
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
      white-space: nowrap;
    }
    
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      color: white;
      font-size: 1.75rem;
      cursor: pointer;
      padding: 0.5rem;
      z-index: 11;
      line-height: 1;
      width: 44px;
      height: 44px;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .menu-toggle:hover {
      background-color: rgba(255, 255, 255, 0.15);
      transform: scale(1.05);
    }
    
    .menu-toggle:active {
      transform: scale(0.95);
    }
    
    @media (max-width: 768px) {
      .navbar {
        padding: 1rem;
      }
      
      .brand {
        font-size: 1.25rem;
      }
      
      .menu-toggle {
        display: flex;
      }
      
      .nav-links {
        position: fixed;
        top: 0;
        right: -100%;
        width: 70%;
        max-width: 300px;
        height: 100vh;
        background: #1565c0;
        flex-direction: column;
        padding: 5rem 0 2rem;
        gap: 0;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
        transition: right 0.3s ease-in-out;
        z-index: 10;
        overflow-y: auto;
      }
      
      .nav-links.open {
        right: 0;
      }
      
      .nav-link {
        padding: 1rem 1.5rem;
        font-size: 1rem;
        border-radius: 0;
        width: 100%;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        /* Ensure proper touch target size */
        min-height: 48px;
        display: flex;
        align-items: center;
      }
      
      .nav-link:hover {
        background-color: rgba(255, 255, 255, 0.15);
      }
      
      .nav-link.active {
        background-color: rgba(255, 255, 255, 0.25);
      }
    }
    
    /* Overlay for mobile menu */
    .overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    
    .overlay.open {
      display: block;
      opacity: 1;
    }
  </style>
  
  <div class="overlay"></div>
  <nav class="navbar">
    <div class="brand" data-view="home">
      <svg class="brand-icon" viewBox="0 0 24 24" fill="white">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
      </svg>
      <span>FiTrack3</span>
    </div>
    
    <button class="menu-toggle" aria-label="Toggle menu">
      <span>☰</span>
    </button>
    
    <ul class="nav-links">
      <li class="nav-link" data-view="home">Home</li>
      <li class="nav-link" data-view="library">Library</li>
      <li class="nav-link" data-view="programs">Programs</li>
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
    
    this.menuOpen = false;
    
    // Get menu elements
    this.menuToggle = this.shadowRoot.querySelector('.menu-toggle');
    this.navLinks = this.shadowRoot.querySelector('.nav-links');
    this.overlay = this.shadowRoot.querySelector('.overlay');
    
    // Bind click handlers
    this.shadowRoot.addEventListener('click', (e) => {
      const target = e.target.closest('[data-view]');
      if (target) {
        const view = target.dataset.view;
        this.closeMenu(); // Close menu when navigation happens
        this.dispatchEvent(new CustomEvent('navigate', {
          detail: { view },
          bubbles: true,
          composed: true
        }));
      }
    });
    
    // Menu toggle handler
    this.menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });
    
    // Overlay click closes menu
    this.overlay.addEventListener('click', () => {
      this.closeMenu();
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      this.navLinks.classList.add('open');
      this.overlay.classList.add('open');
      this.menuToggle.innerHTML = '<span>✕</span>';
    } else {
      this.closeMenu();
    }
  }
  
  closeMenu() {
    this.menuOpen = false;
    this.navLinks.classList.remove('open');
    this.overlay.classList.remove('open');
    this.menuToggle.innerHTML = '<span>☰</span>';
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
