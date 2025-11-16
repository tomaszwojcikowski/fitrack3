# FiTrack3 - Zero-Build Workout Tracking Web Application

A sophisticated workout tracking Progressive Web Application (PWA) built entirely with modern, browser-native technologies—**no build step required**.

## ✨ Implementation Status

**All 4 development phases complete!** This application has been fully implemented following the architectural blueprint in the [Web-Only JavaScript Development Plan](./Web-Only%20JavaScript%20Development%20Plan.md).

✅ **Phase 1: Foundation** - Data layer with Dexie.js and comprehensive unit tests  
✅ **Phase 2: Skeleton** - Responsive UI with Web Components  
✅ **Phase 3: Brain** - Vue.js 3 integration with full interactivity  
✅ **Phase 4: Polish** - GSAP animations, E2E tests, and CI/CD pipeline

## 🌟 Features

- **Modifiable Exercise Library** - Browse, filter, and manage exercises by muscle group
- **Workout Templates** - Create and manage custom workout routines
- **Workout Tracking** - Log sets, reps, and weights with an intuitive interface
- **History & Analytics** - View past workouts with performance metrics
- **Offline-First Architecture** - All data stored locally using IndexedDB
- **Responsive Design** - Mobile-first UI that works on all devices
- **Zero-Build Development** - No bundlers, no transpilers, just native ES Modules
- **Web Components** - Reusable, encapsulated UI components
- **Reactive State Management** - Powered by Vue.js 3 ESM build
- **Automated Testing** - Comprehensive unit and E2E tests with CI/CD
- **Version Tracking** - Build version and commit info displayed in app

## 🏗️ Architecture

This application follows a unique "zero-build" architecture as outlined in the [Web-Only JavaScript Development Plan](./Web-Only%20JavaScript%20Development%20Plan.md):

### Core Technologies

1. **Vue.js 3 ESM Build** - Reactive framework loaded from local vendor directory
2. **Vanilla Web Components** - Native browser components for UI
3. **Dexie.js** - High-performance IndexedDB wrapper for data persistence
4. **GSAP** - Professional-grade animations
5. **Mocha.js + Playwright** - Comprehensive testing strategy

All JavaScript libraries are stored locally in the `/vendor` directory - no CDN dependencies.

### Hybrid Component Model

The application uses a "brain and limbs" architecture:
- **Brain (Vue.js)**: Global state management and data orchestration
- **Limbs (Web Components)**: Reusable, encapsulated UI elements

## 🚀 Getting Started

### Prerequisites

- Node.js (for running the dev server and tests)
- A modern web browser with ES Module support

### Installation

```bash
# Clone the repository
git clone https://github.com/tomaszwojcikowski/fitrack3.git
cd fitrack3

# Install dev dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

Open your browser to `http://localhost:8080`

### Testing

#### Run Unit Tests (In Browser)

Open `http://localhost:8080/test/test.html` in your browser to run the Mocha unit tests.

#### Run E2E Tests

```bash
# Run all Playwright tests
npm test

# Run tests in UI mode
npm run test:ui
```

## 📁 Project Structure

```
fitrack3/
├── index.html              # Main application entry point
├── js/
│   ├── app.js             # Vue.js application (the "brain")
│   ├── database.js        # Data Access Layer (Dexie.js wrapper)
│   └── components/        # Web Components (the "limbs")
│       ├── exercise-card.js
│       └── nav-bar.js
├── css/
│   └── main.css           # Global styles
├── test/
│   ├── test.html          # Mocha test runner
│   └── database.test.js   # Unit tests for DAL
├── tests/
│   ├── mocha.spec.js      # Playwright test for Mocha suite
│   └── app.spec.js        # E2E application tests
└── playwright.config.js   # Playwright configuration

```

## 🧪 Testing Strategy

The application employs a multi-stage verification strategy:

1. **Stage 1: Unit Tests** - Mocha.js tests for business logic (database layer)
   - 20+ comprehensive unit tests covering all DAL functions
   - Run in-browser at `http://localhost:8080/test/test.html`
   
2. **Stage 2: E2E Tests** - Playwright tests for user flows
   - Automated verification of Mocha unit tests
   - User flow testing for all major features
   - Cross-browser compatibility testing
   
3. **Stage 3: CI/CD** - Automated testing and deployment
   - Tests run automatically on every commit via GitHub Actions
   - Deployment to GitHub Pages only after tests pass
   - Version info generated and embedded in each deployment

## 🌐 Deployment

The application is automatically deployed to GitHub Pages with the following workflow:

1. **Test Stage** - All Playwright tests must pass
2. **Build Stage** - Version metadata is generated (commit SHA, build number, timestamp)
3. **Deploy Stage** - Static files deployed to GitHub Pages

Version information is displayed in the app's Settings page, showing:
- Version number
- Build number
- Git commit SHA
- Build timestamp

**Live Demo**: [https://tomaszwojcikowski.github.io/fitrack3/](https://tomaszwojcikowski.github.io/fitrack3/)

### Manual Deployment

The application is entirely static and can be deployed to any static hosting service:

- GitHub Pages (automated via GitHub Actions)
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web server (nginx, Apache, etc.)

Simply copy all files to your hosting provider—no build step needed!

## 📋 Development Phases (Completed)

This project was developed following the four-phase roadmap outlined in the [Web-Only JavaScript Development Plan](./Web-Only%20JavaScript%20Development%20Plan.md):

### ✅ Phase 1: The Foundation (Data & Logic)
- **Completed:** Dexie.js schema and Data Access Layer
- **Deliverable:** Complete Mocha.js unit test suite with 20+ tests
- **Verification:** All unit tests pass in browser

### ✅ Phase 2: The Skeleton (UI & Components)
- **Completed:** Core HTML structure and Web Components
- **Components:** `exercise-card`, `nav-bar`, `template-card`, `workout-session`
- **Deliverable:** Responsive, mobile-first CSS using Grid and Flexbox
- **Verification:** Fully responsive layout on all devices

### ✅ Phase 3: The Brain (State & Interactivity)
- **Completed:** Vue.js 3 ESM integration
- **Implementation:** Hybrid component model connecting Vue to Web Components
- **Features:** All 6 views functional (Home, Library, Templates, Workout, History, Settings)
- **Verification:** End-to-end data flow working

### ✅ Phase 4: The Polish (UX & Automation)
- **Completed:** GSAP animations, Playwright E2E tests, CI/CD pipeline
- **Animations:** Smooth view transitions with GSAP
- **Testing:** Automated Playwright test suite
- **CI/CD:** GitHub Actions workflow with test verification before deployment
- **Verification:** Automated testing on every commit, version tracking in production

## 📝 Data Schema

The application uses IndexedDB with the following schema:

| Table | Purpose |
|-------|---------|
| `exercises` | Core exercise library with muscle group, type, and equipment |
| `exerciseVariations` | Variations of base exercises |
| `workoutTemplates` | User-created workout plans |
| `workoutLogs` | Records of completed workouts |
| `logPerformance` | Performance data (sets, reps, weight) for each exercise |
| `userSettings` | User preferences and settings |

## 🎨 Design Philosophy

- **Mobile-First**: Designed for mobile devices first, then enhanced for larger screens
- **Intrinsic Responsiveness**: Uses CSS Grid `auto-fit` and `minmax` to create fluid layouts without media queries
- **Progressive Enhancement**: Core functionality works everywhere, enhanced features where supported
- **Performance**: Leverages browser-native APIs for optimal performance

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Documentation

- [Web-Only JavaScript Development Plan](./Web-Only%20JavaScript%20Development%20Plan.md) - Complete architectural blueprint
- [Vue.js 3 Documentation](https://vuejs.org/)
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [Dexie.js Documentation](https://dexie.org/)
- [Playwright Documentation](https://playwright.dev/)
