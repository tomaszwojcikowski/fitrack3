# FiTrack3 - Zero-Build Workout Tracking Web Application

A sophisticated workout tracking Progressive Web Application (PWA) built entirely with modern, browser-native technologies—**no build step required**.

## 🌟 Features

- **Modifiable Exercise Library** - Browse, filter, and manage exercises by muscle group
- **Offline-First Architecture** - All data stored locally using IndexedDB
- **Responsive Design** - Mobile-first UI that works on all devices
- **Zero-Build Development** - No bundlers, no transpilers, just native ES Modules
- **Web Components** - Reusable, encapsulated UI components
- **Reactive State Management** - Powered by Vue.js 3 ESM build

## 🏗️ Architecture

This application follows a unique "zero-build" architecture as outlined in the [Web-Only JavaScript Development Plan](./Web-Only%20JavaScript%20Development%20Plan.md):

### Core Technologies

1. **Vue.js 3 ESM Build** - Reactive framework loaded directly from CDN
2. **Vanilla Web Components** - Native browser components for UI
3. **Dexie.js** - High-performance IndexedDB wrapper for data persistence
4. **GSAP** - Professional-grade animations
5. **Mocha.js + Playwright** - Comprehensive testing strategy

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
2. **Stage 2: E2E Tests** - Playwright tests for user flows
3. **Stage 3: CI/CD** - Automated testing on every commit via GitHub Actions

## 🌐 Deployment

The application is automatically deployed to GitHub Pages when changes are merged to the `main` branch.

**Live Demo**: [https://tomaszwojcikowski.github.io/fitrack3/](https://tomaszwojcikowski.github.io/fitrack3/)

### Manual Deployment

The application is entirely static and can be deployed to any static hosting service:

- GitHub Pages (automated via GitHub Actions)
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web server (nginx, Apache, etc.)

Simply copy all files to your hosting provider—no build step needed!

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
