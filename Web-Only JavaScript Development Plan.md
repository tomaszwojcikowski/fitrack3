

# **An Architectural Blueprint for a Zero-Build, High-Performance Web Application**

## **Executive Summary: The Zero-Build Architecture for a High-Performance PWA**

This document provides a complete architectural blueprint for the development of a sophisticated workout tracking web application. The project is defined by a primary, formidable constraint: it must be a "web-only" solution, developed entirely with JavaScript, that features **no build step**. This mandate explicitly forbids the use of bundlers (e.g., Webpack, Vite), transpilers (e.g., Babel), or component compilers (e.g., Svelte, .vue Single-File Components).

A common assumption is that this "no-build" constraint relegates a project to simple, static-page interactivity. This analysis refutes that assumption. By strategically leveraging modern, browser-native APIs—specifically ES Modules, Web Components, and the IndexedDB API—and augmenting them with carefully selected, mature libraries loadable via a Content Delivery Network (CDN), this architecture achieves a level of performance, maintainability, and user experience that can meet or exceed that of many bundled applications.

The selected core stack, detailed exhaustively in this report, is founded on three pillars:

1. **Core Framework:** The **Vue.js 3 ES Module (ESM) Build**.1 This provides a full-featured, actively maintained reactive framework for managing complex application state, loaded directly in the browser without a build process.  
2. **Data Architecture:** **Dexie.js** 3, a high-performance wrapper for the browser's IndexedDB. This is the only viable solution for managing the application's complex, modifiable exercise library and workout logs in an offline-first, non-blocking manner.  
3. **UX & Animation:** The **GreenSock Animation Platform (GSAP)**.4 This professional-grade animation library, loaded via CDN, will be used to deliver the "polished UX" and animate the SVG graphics required by the project brief.

This technical stack is supported by a unified, multi-stage verification strategy. This hybrid plan utilizes **Mocha.js** for in-browser, logic-level unit testing and **Playwright** for both end-to-end user flow simulation and the automated CI-level verification of the in-browser unit test suite.5

This architecture is not a compromise. It is a strategic choice that enforces a clean separation of concerns, minimizes dependencies, and delivers unparalleled client-side performance by executing entirely within the browser's native capabilities.

## **Core Application Architecture: The Hybrid Vue.js \+ Web Component Model**

The most critical decision in a "no-build" application is the selection of its UI and state management layer. The requirement for a "modifiable exercise library" and a "polished UX" dictates a solution that is both scalable and maintainable. A critical analysis of the available options reveals a clear, definitive path.

### **Critical Analysis of "No-Build" UI Options**

A preliminary analysis of common "no-build" tools demonstrates their unsuitability for an application of this complexity.

* **Alpine.js:** This micro-framework is designed to be a "minimal framework for composing JavaScript behavior in your markup" 7 and is often used as a "no-build" jQuery replacement.8 While it is excellent for "sprinkling" basic interactivity onto server-rendered pages, its architecture is fundamentally unsuited for a complex Single Page Application (SPA). Its model of embedding logic directly into HTML attributes creates an unmanageable development experience at scale. As noted in developer forums, "Alpine is good for basic interactivity and reactivity but writing reusable code with it is a nightmare".10 For a project defined by a "modifiable exercise library"—a feature demanding dozens of reusable, stateful components—adopting a tool that makes reusability a "nightmare" would be a catastrophic architectural error, guaranteeing massive technical debt. Alpine.js is therefore disqualified.  
* **Petite-Vue:** This library is an even smaller, 5.8KB "progressive enhancement" subset of Vue.11 While it shares a similar syntax, it is not the full Vue framework. Developer reports are definitive: it is a dead end. One developer, after "running into too many of its limitations and issues," described the project as "**abandon-ware**".2 Building a new, complex application on an abandoned, limited library is an unacceptable project risk. Petite-Vue is therefore disqualified.  
* **Vanilla Web Components:** A framework-free approach using only native Web Components is a viable, standards-based option.13 This suite of technologies (Custom Elements, Shadow DOM, HTML Templates) provides the *component model*—encapsulated, reusable UI elements that are framework-agnostic.14 However, Web Components *only* solve the component model. They provide no solution for global state management, reactivity, data-binding, or routing. A solution would be needed to manage application-wide state, such as the currently logged-in user, the active workout, or the settings.

### **Recommended Architecture: Vue.js 3 ESM Build**

The optimal solution is to *not* settle for a limited micro-framework but to use the **full, mature Vue.js 3 framework** itself. This is possible due to its native ES Module (ESM) build, which is designed to be loaded directly from a CDN without any build step.1

The implementation is simple and clean, requiring only a single script tag in the main index.html:

HTML

\<div id\="app"\>  
  \</div\>

\<script type\="module"\>  
  // Import the full 'createApp' function from the browser-native module  
  import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

  // Import our local application logic  
  import App from './js/app.js'

  // Mount the application  
  createApp(App).mount('\#app')  
\</script\>

This approach provides the definitive solution. As noted by developers who previously attempted to use Petite-Vue, the correct path is to "just use the ESM build of Vue.js which also doesn't require a build step, **has the full feature-set, is actively used and maintained**".2 This gives the project the full power of Vue's reactivity system, computed properties, and global state management, all of which are necessary for a complex workout application.

The primary trade-off, as noted in the official documentation, is that "you won't be able to use the Single-File Component (SFC) syntax".1 This means no .vue files. The following hybrid architecture provides the robust, scalable solution to this constraint.

### **Component Strategy: A Hybrid Integration Blueprint**

To solve the "no SFC" constraint, this architecture will employ a hybrid "brain and limbs" model.

1. **The "Brain" (Vue.js):** The global Vue 3 instance, instantiated in js/app.js, will serve as the application's "brain." It will be responsible for all global state management (e.g., user session, application theme, the list of exercises) and orchestrating data flow. It will fetch data from the Data Access Layer and pass it down to the UI.  
2. **The "Limbs" (Web Components):** All reusable UI elements—such as \<exercise-card\>, \<timer-display\>, \<workout-day-selector\>, or \<svg-icon\>—will be built as standard, **vanilla Web Components**.13 These components will be the "limbs" of the application, responsible only for presentation and encapsulation.

This hybrid model leverages the best of both worlds. The Vue instance benefits from a mature, "batteries-included" state management system 2, while the UI components are built using a native browser standard, ensuring encapsulation and long-term maintainability.13

**Implementation Blueprint:**

The interaction between these two layers is seamless and relies entirely on native browser APIs, a pattern that Vue.js explicitly supports.15

1. **Defining a Web Component:** A component will be defined using the native APIs:  
   JavaScript  
   // In /js/components/exercise-card.js  
   const template \= document.createElement('template');  
   template.innerHTML \= \`  
     \<style\>  
       /\* Encapsulated styles via Shadow DOM \*/  
       :host { display: block; border: 1px solid \#ccc; }  
       h3 { color: blue; }  
     \</style\>  
     \<div class="card"\>  
       \<h3 id="name"\>\</h3\>  
       \<p\>Muscle Group: \<slot name="muscle"\>\</slot\>\</p\>  
     \</div\>  
   \`;

   class ExerciseCard extends HTMLElement {  
     constructor() {  
       super();  
       this.attachShadow({ mode: 'open' });  
       this.shadowRoot.appendChild(template.content.cloneNode(true));  
     }

     // Vue will pass data by setting the property  
     set exercise(data) {  
       this.shadowRoot.querySelector('\#name').innerText \= data.name;  
       //...  
     }  
   }

   // Register the custom element  
   customElements.define('exercise-card', ExerciseCard);

2. **Using the Component in Vue:** The Vue application can then use this element like any native HTML tag.  
   JavaScript  
   // In js/app.js (The Vue App "Brain")  
   import { getExercisesByMuscle } from './database.js';

   export default {  
     data() {  
       return {  
         legExercises:  
       }  
     },  
     async mounted() {  
       this.legExercises \= await getExercisesByMuscle('legs');  
     },  
     template: \`  
       \<h2\>Leg Day\</h2\>  
       \<exercise-card   
         v-for="ex in legExercises"   
         :key="ex.id"  
         :exercise="ex"\>  
         \<span slot="muscle"\>{{ ex.muscleGroup }}\</span\>  
       \</exercise-card\>  
     \`  
   }

This hybrid model is the cornerstone of the architecture. It is scalable, maintainable, and directly solves the reusability "nightmare" 10 that plagues the alternative micro-frameworks.

## **Client-Side Data Architecture: Managing the Modifiable Workout Library**

The project's core feature is its "modifiable exercise library with variations" and the ability to log workouts. This is a relational data problem that must be solved entirely on the client, offline-first. The choice of data storage technology is therefore critical.

### **Data Storage Mandate: IndexedDB over LocalStorage**

The LocalStorage API will not be used for application data. It is categorically disqualified for several reasons:

1. **String-Only Storage:** LocalStorage only stores strings.16 This necessitates constant, computationally expensive JSON.stringify and JSON.parse operations for every read and write, which is inefficient for complex objects.  
2. **Synchronous (Blocking) API:** This is the most severe flaw. All LocalStorage operations are synchronous, meaning they block the main browser thread.17 A call to localStorage.setItem() can cause the UI to "jank" or freeze, directly violating the "polished UX" requirement.  
3. **Trivial Size Limit:** LocalStorage is limited to a mere 5-10MB.16 A workout library, combined with user-generated images/blobs and years of workout logs, would exceed this limit almost immediately.

The sole appropriate technology for this application is **IndexedDB**. It is the only professional-grade, client-side database solution.

1. **Asynchronous (Non-Blocking):** It is an event-driven, asynchronous API.17 All operations are non-blocking, ensuring a smooth, responsive UI.  
2. **Rich Data Storage:** IndexedDB stores nearly any data type, including complex objects, arrays, files, and blobs.16  
3. **Large-Scale Capacity:** It has a massive storage limit, often calculated as a percentage of the user's free disk space, easily supporting tens or hundreds of gigabytes.19  
4. **Queryable:** As its name implies, it supports indexes, allowing for high-performance, database-style queries.21

### **Database Wrapper Selection: Dexie.js**

While IndexedDB is the correct *technology*, its native API is notoriously verbose, "quite complicated" 18, and requires "careful handling of versioning and error scenarios".19 This creates a significant development and maintenance burden. Therefore, a wrapper library is not a "nice-to-have," but a hard requirement for project velocity and code quality.

A comparative analysis of the leading options reveals a clear winner:

* **idb (by Jake Archibald):** This is a popular, lightweight, promise-based wrapper.21 It simplifies the native API significantly. However, it is a *minimal* wrapper. It "lacks the advanced querying features found in Dexie" and is less suited for "complex data retrieval".23  
* **localForage:** This is an abstraction layer for simple key-value storage, not a database wrapper.16 It is not designed for the complex relational queries this application requires.24  
* **Dexie.js:** This is the selected library. Dexie.js is a full-featured, high-performance wrapper that solves all of the project's data-layer needs.

**Dexie.js is mandatory for this architecture for two primary reasons:**

1. **Superior Querying Capabilities:** This is the single most important factor. The user's query ("modifiable exercise library with variations") *is* a complex query problem. A user will expect to filter exercises by "muscle group" *and* "equipment type" *or* "difficulty." Dexie.js was built for this. It "**excels in querying capabilities**," providing a "powerful query syntax" that supports "filtering, sorting, and multi-indexed queries" with ease.23 The simpler idb library would force this complex filtering logic to be re-implemented in JavaScript, defeating the purpose of the database.  
2. **Declarative Schema Management:** Dexie.js provides a simple, "well thought-through API" 25 for managing database versions and schemas. It handles the complex onupgradeneeded and migration logic "behind the scenes".26 The schema is defined with a simple, declarative string.26

### **Proposed Data Schema (Version 1\)**

The entire application will be built upon the following Dexie.js database schema. This schema is the blueprint for all application data, defined using Dexie's declarative syntax.26

| Table (Object Store) | Schema String (Indexes) | Description |
| :---- | :---- | :---- |
| exercises | \++id, name, muscleGroup, type, equipment | The core exercise library. \++id defines an auto-incrementing primary key.26 name, muscleGroup, type, and equipment are all indexed for high-performance filtering. |
| exerciseVariations | \++id, \&exerciseId, name, difficulty | Stores variations (e.g., "Incline Dumbbell Press" for "Bench Press"). \&exerciseId is an index linking to the exercises table. |
| workoutTemplates | \++id, name, \*exerciseIds | User-created workout plans. \*exerciseIds is a **multi-entry index**, a key Dexie feature.25 It stores an array of exercise IDs and allows querying for all templates that contain a specific exercise. |
| workoutLogs | \++id, date, templateId | A record of a completed workout. date and templateId are indexed for querying history and progress. |
| logPerformance | \++id, logId, exerciseId, \[set+reps+weight\] | Stores the actual performance data (sets, reps, weight) for each exercise in a log. logId and exerciseId are indexed for joining. |
| userSettings | id | A simple key-value store (with id as the key) for user preferences like theme or units. |

### **Data Access Layer (DAL) Pattern**

To ensure a clean separation of concerns, the Vue.js "brain" will *not* interact with Dexie.js directly. Instead, a dedicated **Data Access Layer (DAL)** module will be created. This module will initialize the database and export an encapsulated, asynchronous API for all data operations.

This pattern makes the application modular, testable, and maintainable.

**Implementation Blueprint (/js/database.js):**

JavaScript

// Import Dexie from its ESM build CDN  
import Dexie from 'https://unpkg.com/dexie/dist/dexie.es.js';

// 1\. Initialize the database  
const db \= new Dexie('WorkoutAppDB');

// 2\. Define the schema  
db.version(1).stores({  
  exercises: '++id, name, muscleGroup, type, equipment',  
  exerciseVariations: '++id, \&exerciseId, name, difficulty',  
  workoutTemplates: '++id, name, \*exerciseIds',  
  workoutLogs: '++id, date, templateId',  
  logPerformance: '++id, logId, exerciseId',  
  userSettings: 'id'  
});

// 3\. Export the encapsulated DAL API  
export const getExercisesByMuscle \= (muscle) \=\> {  
  if (\!muscle) return db.exercises.toArray();  
  return db.exercises.where('muscleGroup').equalsIgnoreCase(muscle).toArray();  
}

export const addWorkoutLog \= async (logData) \=\> {  
  // Dexie transactions ensure data integrity \[22\]  
  return db.transaction('rw', db.workoutLogs, db.logPerformance, async () \=\> {  
    const logId \= await db.workoutLogs.add({  
      date: logData.date,  
      templateId: logData.templateId  
    });

    const performanceData \= logData.performance.map(p \=\> ({  
     ...p,  
      logId: logId  
    }));  
      
    await db.logPerformance.bulkAdd(performanceData);  
    return logId;  
  });  
}

//... all other database interaction functions (getTemplate, addExercise, etc.)

The Vue application will *only* import from this database.js file, making the data layer a replaceable, testable black-box.

## **UI/UX Implementation: Achieving a Polished, Responsive Interface**

The "polished UX" and "responsive UI" requirements will be met using modern, performant, build-free technologies.

### **Responsive Design Strategy: Modern CSS**

The application will be designed **mobile-first**. The layout will be implemented using **Vanilla CSS** only, with a heavy emphasis on **CSS Grid** and **CSS Flexbox**.28

Crucially, the architecture will *minimize* the use of explicit @media query breakpoints.29 While media queries will be used for high-level composition changes (e.g., swapping a mobile tab-bar for a desktop sidebar), the primary component layouts will be *fluid* and *intrinsic*.

This is achieved using modern CSS patterns, such as the auto-fit and minmax combination for grid layouts.30

**Example CSS for a Responsive Exercise Library:**

CSS

.exercise-list-container {  
  display: grid;  
  /\*   
    This one line of code creates a responsive grid.  
    It creates as many 250px columns as will fit.  
    It then grows them equally (1fr) to fill the remaining space.  
    No media queries are needed.   
  \*/  
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));  
  gap: 1rem;  
}

This approach is more performant, dramatically simpler to maintain, and results in a truly fluid UI that looks correct at all viewport sizes, not just at a few arbitrary breakpoints.

### **Animation & Polish: GSAP (GreenSock Animation Platform)**

A "polished UX" is synonymous with fluid, high-performance animation. While simple CSS transitions are available 31, they are insufficient for a complex *application*. They lack the fine-grained control, sequencing, and performance needed for a professional feel.

The architecture will therefore incorporate the **GreenSock Animation Platform (GSAP)**.

**Justification for GSAP:**

1. **Performance:** GSAP is a high-speed property manipulator, optimized to work around countless browser inconsistencies and performance bugs.4  
2. **Control & Sequencing:** This is the primary differentiator. Unlike CSS, GSAP provides a **timeline**.33 This allows for the creation of complex, multi-stage animation sequences that can be paused, played, reversed, or scrubbed. This is essential for application-level animations (e.g., a "workout complete" sequence) and complex SVG visualizations.34  
3. **Framework-Agnostic:** GSAP is "framework-agnostic" 4 and has zero dependencies, making it a perfect addition to our Vue \+ Web Component stack.

GSAP will be loaded directly from its CDN into index.html 4:

HTML

\<script src\="https://cdn.jsdelivr.net/npm/gsap@3.13/dist/gsap.min.js"\>\</script\>

### **SVG Graphics Implementation**

All icons (play, pause, add, edit) and data visualizations (progress charts, muscle-group diagrams) will be implemented as **inline SVG**. This provides infinite scalability and a minimal footprint.

GSAP will be used to directly animate SVG properties, providing a level of polish that is difficult to achieve with other methods.

**Example Implementation (Animating a Rest Timer):**

JavaScript

// Assumes an SVG \<circle\> with a 'stroke-dasharray'  
const timerRing \= document.querySelector('\#timer-svg-path');

// GSAP provides precise control over the 60-second animation  
// This can be paused, killed, or reversed from Vue  
const restTimerAnimation \= gsap.to(timerRing, {  
  strokeDashoffset: 0,  
  duration: 60,  
  ease: 'linear',  
  paused: true   
});

// Vue app can now control this animation  
// app.startTimer() \-\> restTimerAnimation.play()  
// app.pauseTimer() \-\> restTimerAnimation.pause()

This combination of modern CSS for layout and GSAP for animation will fully satisfy the requirements for a responsive, polished UI.

## **Multi-Stage Automated Verification Strategy**

A "no build step" project does *not* mean a "no testing" project. This architecture includes an exhaustive, multi-stage verification strategy to ensure high confidence and rapid, automated feedback. This plan is designed to run both locally and in a Continuous Integration (CI) environment.

### **Stage 1: Unit & Logic Verification (Mocha.js \+ Chai)**

This stage focuses on testing the application's "business logic" in isolation, specifically the **Data Access Layer** (database.js) and any utility modules.

**Technology Selection:**

* **Test Runner (Mocha.js):** The test framework will be Mocha.js. It is flexible, mature, and, most importantly, can be run **directly in the browser**.36  
* **Assertion Library (Chai.js):** Chai will be used to provide a readable assert() and expect() syntax.6  
* **Disqualified (Jest):** Jest is the most popular JavaScript testing framework, but it is **unusable** for this project. Jest is built for a Node.js environment and relies on JSDOM to emulate a browser.38 It *requires* a build/transpilation step to handle modules, violating the project's primary constraint. Mocha.js, running in-browser, is the correct choice.

**Implementation: The test.html Runner**

A single HTML file, /test/test.html, will be created to act as the in-browser test runner. This file will load Mocha, Chai, the application's source modules, and the test files.6

**Deliverable: test.html Blueprint**

HTML

\<\!DOCTYPE **html**\>  
\<html\>  
\<head\>  
  \<title\>Mocha Unit Tests\</title\>  
  \<link rel\="stylesheet" href\="https://unpkg.com/mocha/mocha.css"\>  
\</head\>  
\<body\>  
  \<div id\="mocha"\>\</div\>

  \<script src\="https://unpkg.com/mocha/mocha.js"\>\</script\>  
  \<script src\="https://unpkg.com/chai/chai.js"\>\</script\>

  \<script class\="mocha-setup"\>  
    mocha.setup('bdd');  
    window.assert \= chai.assert; // Make assert global  
  \</script\>

  \<script type\="module" src\="./database.test.js"\>\</script\>  
  \<script type\="module" src\="./utils.test.js"\>\</script\>

  \<script type\="module" class\="mocha-exec"\>  
    mocha.run();  
  \</script\>  
\</body\>  
\</html\>

**Deliverable: database.test.js Example**

JavaScript

// This file is loaded as a module in test.html  
// It can import from the actual application source code  
import { getExercisesByMuscle, db } from '../js/database.js';

describe('Database Access Layer', function() {  
    
  // Clear the DB before each test  
  beforeEach(async function() {  
    await db.exercises.clear();  
  });

  it('should add and retrieve exercises', async function() {  
    await db.exercises.bulkAdd();

    const legs \= await getExercisesByMuscle('Legs');  
      
    assert.equal(legs.length, 1);  
    assert.equal(legs.name, 'Squat');  
  });  
});

### **Stage 2: Browser Verification & Integration Testing (Playwright)**

This stage validates the *full application* by simulating real user flows in a real browser.

**Technology Selection:**

* **Playwright:** This is the definitive modern E2E testing framework.5 It is fast, reliable, and provides full control over Chromium, Firefox, and WebKit.

**The "Double-Duty" Strategy:**

Playwright will be configured to run **two** distinct test suites in our CI pipeline:

1. **Unit Test Verification:** A single Playwright test that loads the test.html page and asserts that all Mocha tests passed. This automates Stage 1\.  
2. **E2E User Flow Tests:** The primary test suite that simulates user behavior (e.g., "user can create an exercise," "user can log a workout").

**Implementation: Unit Test Verification (/tests/mocha.spec.js)**

This test acts as a gatekeeper, ensuring all low-level logic is sound before running the expensive E2E tests.

JavaScript

import { test, expect } from '@playwright/test';

test('Run in-browser Mocha unit tests', async ({ page }) \=\> {  
  // 1\. Go to the local URL for the test runner  
  await page.goto('/test/test.html');  
    
  // 2\. Wait for Mocha to finish  
  // We poll the DOM for the '\#mocha-stats' element  
  await page.waitForFunction(() \=\>   
    document.querySelector('\#mocha-stats.failures'),  
    { timeout: 10000 }  
  );  
    
  // 3\. Check the "failures" count in the report  
  const failures \= await page.locator('\#mocha-stats.failures').textContent();  
    
  // 4\. Assert that 0 failures were reported  
  expect(failures).toBe('failures: 0');  
});

**Implementation: E2E User Flow Tests (/tests/workout.spec.js)**

JavaScript

import { test, expect } from '@playwright/test';

test('User can create a new exercise in the library', async ({ page }) \=\> {  
  // 1\. Go to the app's home page  
  await page.goto('/');  
    
  // 2\. Simulate user actions  
  await page.click('a\[href="/library"\]');  
  await page.click('button\#add-new-exercise');  
    
  // 3\. Fill the form  
  await page.fill('input\[name="exercise-name"\]', 'Test Pushup');  
  await page.selectOption('select\[name="muscle-group"\]', 'Chest');  
  await page.click('button\[type="submit"\]');  
    
  // 4\. Assert the result  
  await expect(page.locator('text=Test Pushup')).toBeVisible();  
});

### **Stage 3: Continuous Integration (GitHub Actions)**

The final stage is to automate the entire Stage 2 process on every push and pull\_request using GitHub Actions.

**The Static Server Problem:**

A common pitfall when testing static sites is that the default Playwright GitHub Action 40 *does not* serve the local HTML/JS files. The tests will run against an empty void. The solution is to configure Playwright's built-in webServer feature to start a simple static server before running the tests.

**Implementation: playwright.config.js**

This file, placed in the project root, instructs Playwright how to serve and test the application.

JavaScript

// playwright.config.js  
import { defineConfig } from '@playwright/test';

export default defineConfig({  
  // 1\. Directory where tests are located  
  testDir: './tests',

  // 2\. The magic: Start a web server before tests  
  webServer: {  
    // Command to start a simple static server  
    // (Requires 'npm install \-D http-server')  
    command: 'npx http-server \-p 8080',  
    // URL to poll  
    url: 'http://localhost:8080',  
    reuseExistingServer:\!process.env.CI,  
  },

  // 3\. Base URL for all 'page.goto()' calls  
  use: {  
    baseURL: 'http://localhost:8080',  
  },  
});

**Deliverable: Full .github/workflows/playwright.yml Blueprint**

This file fully automates the checkout, dependency installation, browser installation, and test execution.

YAML

\# Based on \[40, 41, 42\]  
name: Playwright Tests

on:  
  push:  
    branches: \[ main \]  
  pull\_request:  
    branches: \[ main \]

jobs:  
  test:  
    timeout-minutes: 60  
    runs-on: ubuntu-latest

    steps:  
      \- name: Checkout repository  
        uses: actions/checkout@v5

      \- name: Set up Node.js  
        uses: actions/setup-node@v5  
        with:  
          node-version: lts/\*

      \- name: Install dependencies  
        \# Install Playwright and the 'http-server' for the webServer  
        run: npm ci

      \- name: Install Playwright Browsers  
        \# Install Chromium, Firefox, WebKit and their dependencies  
        run: npx playwright install \--with-deps

      \- name: Run Playwright tests  
        \# This one command will:  
        \# 1\. Start the 'http-server' (from playwright.config.js)  
        \# 2\. Run all tests in the '/tests' directory  
        \# 3\. This includes 'mocha.spec.js' and 'workout.spec.js'  
        run: npx playwright test

      \- name: Upload test report  
        \# This step saves the HTML report as a CI artifact  
        \# \[40, 43\]  
        uses: actions/upload-artifact@v4  
        if: always() \# Run even if tests fail  
        with:  
          name: playwright-report  
          path: playwright-report/  
          retention-days: 30

## **Phased Development Roadmap & Conclusion**

This architecture will be implemented in four distinct, verifiable phases.

### **Phase 1: The Foundation (Data & Logic)**

1. **Implementation:** Implement the Dexie.js schema (database.js) as defined in Section III.C. Build the complete Data Access Layer (DAL) with asynchronous functions for all CRUD operations (e.g., addExercise, getTemplateById, addWorkoutLog).  
2. **Deliverable:** Build the test.html runner and write the complete Mocha.js unit test suite for the DAL.  
3. **Verification Gate:** All Mocha tests pass when test.html is opened in a browser.

### **Phase 2: The Skeleton (UI & Components)**

1. **Implementation:** Develop the core index.html structure. Build the full library of reusable, unstyled Vanilla Web Components (e.g., \<exercise-card\>, \<nav-bar\>) using Shadow DOM for encapsulation.  
2. **Deliverable:** Implement the responsive, mobile-first CSS using the Grid and Flexbox patterns from Section IV.A.  
3. **Verification Gate:** All components render correctly when populated with mock data. The layout is fully responsive.

### **Phase 3: The Brain (State & Interactivity)**

1. **Implementation:** Integrate the Vue.js 3 ESM build (main.js and app.js). Connect the Vue application state to the DAL (database.js).  
2. **Deliverable:** Implement the hybrid component model: use Vue to fetch data, manage state, and pass data *to* the Web Components via props. Listen for custom events *from* the Web Components to update state.  
3. **Verification Gate:** The application is fully interactive. Data flows end-to-end: from the Vue app, to the Web Components, into the Dexie database, and back.

### **Phase 4: The Polish (UX & Automation)**

1. **Implementation:** Integrate GSAP for all SVG and UI animations. Develop the full Playwright E2E test suite (/tests/).  
2. **Deliverable:** Implement the playwright.config.js and .github/workflows/playwright.yml files to create the full CI/CD pipeline.  
3. **Verification Gate:** The CI pipeline is "green." All unit tests (Stage 1\) and E2E tests (Stage 2\) pass automatically on every commit. The application is feature-complete and ready for deployment.

### **Final Conclusion**

This report has outlined a complete, end-to-end development plan for a sophisticated, high-performance workout application that strictly adheres to the "no build step" constraint. This architecture is not a compromise; it is a deliberate strategic choice.

By rejecting fragile, abandoned micro-frameworks in favor of the **full Vue.js 3 ESM build**, a scalable and maintainable state management "brain" is established. By pairing this with encapsulated **Vanilla Web Components**, a robust "no SFC" component model is achieved.

The critical data-layer requirements are met by selecting **Dexie.js**, whose "excellent querying capabilities" are the definitive solution for the application's complex library. This is wrapped in a testable Data Access Layer.

Finally, the entire architecture is validated by a professional-grade, multi-stage testing strategy using **Mocha.js** and **Playwright**, fully automated in a **GitHub Actions** CI pipeline. This blueprint delivers on every project requirement, providing a path to a modern, maintainable, and exceptionally fast web application.

#### **Works cited**

1. Quick Start | Vue.js, accessed on November 16, 2025, [https://vuejs.org/guide/quick-start](https://vuejs.org/guide/quick-start)  
2. Is this aimed at being in the same role as petite-vue and alpinejs? They also do... | Hacker News, accessed on November 16, 2025, [https://news.ycombinator.com/item?id=45245647](https://news.ycombinator.com/item?id=45245647)  
3. Dexie.js \- Offline-First Database with Cloud Sync, Collaboration & Real-Time Updates, accessed on November 16, 2025, [https://dexie.org/](https://dexie.org/)  
4. greensock/GSAP: GSAP (GreenSock Animation Platform), a ... \- GitHub, accessed on November 16, 2025, [https://github.com/greensock/GSAP](https://github.com/greensock/GSAP)  
5. Top JavaScript Test Automation Frameworks to Know in 2025 | TestEvolve, accessed on November 16, 2025, [https://www.testevolve.com/blog/top-javascript-test-automation-frameworks](https://www.testevolve.com/blog/top-javascript-test-automation-frameworks)  
6. javascript \- How do you run mocha tests in the browser? \- Stack ..., accessed on November 16, 2025, [https://stackoverflow.com/questions/42857778/how-do-you-run-mocha-tests-in-the-browser](https://stackoverflow.com/questions/42857778/how-do-you-run-mocha-tests-in-the-browser)  
7. AlpineJS compared to VueJS \- DEV Community, accessed on November 16, 2025, [https://dev.to/marcusatlocalhost/alpinejs-compared-to-vuejs-5014](https://dev.to/marcusatlocalhost/alpinejs-compared-to-vuejs-5014)  
8. Full-Stack Go App with HTMX and Alpine.js \- ntorga's, accessed on November 16, 2025, [https://ntorga.com/full-stack-go-app-with-htmx-and-alpinejs/](https://ntorga.com/full-stack-go-app-with-htmx-and-alpinejs/)  
9. A comparison of a simple app in Vue.js and Alpine.js | by Liam Hall \- Medium, accessed on November 16, 2025, [https://medium.com/@wearethreebears/a-comparison-of-a-simple-app-in-vue-js-and-alpine-js-2a8c57f8b0e3](https://medium.com/@wearethreebears/a-comparison-of-a-simple-app-in-vue-js-and-alpine-js-2a8c57f8b0e3)  
10. Why choose Vue over AlpineJS when the website is already server side rendered? : r/vuejs \- Reddit, accessed on November 16, 2025, [https://www.reddit.com/r/vuejs/comments/1g4j13g/why\_choose\_vue\_over\_alpinejs\_when\_the\_website\_is/](https://www.reddit.com/r/vuejs/comments/1g4j13g/why_choose_vue_over_alpinejs_when_the_website_is/)  
11. How PetiteVue Transformed Our Real-Time System Development (from Alpinejs \- Medium, accessed on November 16, 2025, [https://medium.com/@royantihassan/how-petite-vue-transformed-our-real-time-system-development-from-alpine-js-0207748a7bbc](https://medium.com/@royantihassan/how-petite-vue-transformed-our-real-time-system-development-from-alpine-js-0207748a7bbc)  
12. petite-vue: An Alpine alternative for progressive enhancement \- LogRocket Blog, accessed on November 16, 2025, [https://blog.logrocket.com/petite-vue-alpine-alternative-progressive-enhancement/](https://blog.logrocket.com/petite-vue-alpine-alternative-progressive-enhancement/)  
13. Web Components \- Web APIs \- MDN Web Docs \- Mozilla, accessed on November 16, 2025, [https://developer.mozilla.org/en-US/docs/Web/API/Web\_components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)  
14. Web Components: A Dive into Modern Component Architecture | by Frontend Highlights, accessed on November 16, 2025, [https://medium.com/@ignatovich.dm/web-components-a-dive-into-modern-component-architecture-529b8e983671](https://medium.com/@ignatovich.dm/web-components-a-dive-into-modern-component-architecture-529b8e983671)  
15. Vue and Web Components, accessed on November 16, 2025, [https://vuejs.org/guide/extras/web-components](https://vuejs.org/guide/extras/web-components)  
16. 9 differences between IndexedDB and LocalStorage \- DEV Community, accessed on November 16, 2025, [https://dev.to/armstrong2035/9-differences-between-indexeddb-and-localstorage-30ai](https://dev.to/armstrong2035/9-differences-between-indexeddb-and-localstorage-30ai)  
17. Any downsides to using indexedDB vs localStorage? : r/sveltejs \- Reddit, accessed on November 16, 2025, [https://www.reddit.com/r/sveltejs/comments/15rj12h/any\_downsides\_to\_using\_indexeddb\_vs\_localstorage/](https://www.reddit.com/r/sveltejs/comments/15rj12h/any_downsides_to_using_indexeddb_vs_localstorage/)  
18. How is localStorage different from indexedDB? \- Software Engineering Stack Exchange, accessed on November 16, 2025, [https://softwareengineering.stackexchange.com/questions/219953/how-is-localstorage-different-from-indexeddb](https://softwareengineering.stackexchange.com/questions/219953/how-is-localstorage-different-from-indexeddb)  
19. IndexedDB: A Comprehensive Overview for Frontend Developers \- Medium, accessed on November 16, 2025, [https://medium.com/@shashika.silva88/indexeddb-a-comprehensive-overview-for-frontend-developers-6b47a9f32e23](https://medium.com/@shashika.silva88/indexeddb-a-comprehensive-overview-for-frontend-developers-6b47a9f32e23)  
20. Does anyone still use IndexedDB in JavaScript? : r/webdev \- Reddit, accessed on November 16, 2025, [https://www.reddit.com/r/webdev/comments/1516sf6/does\_anyone\_still\_use\_indexeddb\_in\_javascript/](https://www.reddit.com/r/webdev/comments/1516sf6/does_anyone_still_use_indexeddb_in_javascript/)  
21. Work with IndexedDB | Articles \- web.dev, accessed on November 16, 2025, [https://web.dev/articles/indexeddb](https://web.dev/articles/indexeddb)  
22. Client-side Data Persistence with IndexedDB \- Chariot Solutions, accessed on November 16, 2025, [https://chariotsolutions.com/blog/post/client-side-data-persistence-with-indexeddb/](https://chariotsolutions.com/blog/post/client-side-data-persistence-with-indexeddb/)  
23. idb vs dexie | IndexedDB Libraries Comparison \- NPM Compare, accessed on November 16, 2025, [https://npm-compare.com/dexie,idb](https://npm-compare.com/dexie,idb)  
24. idb vs localforage vs dexie | JavaScript IndexedDB Libraries Comparison \- NPM Compare, accessed on November 16, 2025, [https://npm-compare.com/dexie,idb,localforage](https://npm-compare.com/dexie,idb,localforage)  
25. Why is Dexie.js needed?, accessed on November 16, 2025, [https://dexie.org/docs/Dexie.js.html](https://dexie.org/docs/Dexie.js.html)  
26. Using Dexie.js to write slick IndexedDB code \- DEV Community, accessed on November 16, 2025, [https://dev.to/andyhaskell/using-dexie-js-to-write-slick-indexeddb-code-304o](https://dev.to/andyhaskell/using-dexie-js-to-write-slick-indexeddb-code-304o)  
27. Understanding the basics | Dexie.js Documentation \- Offline-First Database, accessed on November 16, 2025, [https://dexie.org/docs/Tutorial/Understanding-the-basics](https://dexie.org/docs/Tutorial/Understanding-the-basics)  
28. Blog: Flexbox, Grid Layout and Media Queries: Advanced CSS Guide for Professional Web Designers \- Kranio, accessed on November 16, 2025, [https://www.kranio.io/en/blog/introduccion-a-css-parte-2-flexbox-grid-layout-y-media-queries-para-profesionales-del-diseno-web](https://www.kranio.io/en/blog/introduccion-a-css-parte-2-flexbox-grid-layout-y-media-queries-para-profesionales-del-diseno-web)  
29. Using media queries \- CSS \- MDN Web Docs, accessed on November 16, 2025, [https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media\_queries/Using](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using)  
30. Can a responsive page layout be achieved using css grid and flexbox without media queries? \- Stack Overflow, accessed on November 16, 2025, [https://stackoverflow.com/questions/59165503/can-a-responsive-page-layout-be-achieved-using-css-grid-and-flexbox-without-medi](https://stackoverflow.com/questions/59165503/can-a-responsive-page-layout-be-achieved-using-css-grid-and-flexbox-without-medi)  
31. UI/UX sketching techniques 101 \- UX Collective, accessed on November 16, 2025, [https://uxdesign.cc/ui-ux-sketching-techniques-101-7e91d854ae3d](https://uxdesign.cc/ui-ux-sketching-techniques-101-7e91d854ae3d)  
32. gsap \- Libraries \- cdnjs \- The \#1 free and open source CDN built to make life easier for developers, accessed on November 16, 2025, [https://cdnjs.com/libraries/gsap](https://cdnjs.com/libraries/gsap)  
33. The Power of GSAP: Taking JavaScript Animations to the Next Level | by Ramzi Bouzaiene, accessed on November 16, 2025, [https://medium.com/@ramzibouzaiene.dev/the-power-of-gsap-taking-javascript-animations-to-the-next-level-adf268be2fa0](https://medium.com/@ramzibouzaiene.dev/the-power-of-gsap-taking-javascript-animations-to-the-next-level-adf268be2fa0)  
34. Is framer motion as powerful as GSAP to create good animations? : r/Frontend \- Reddit, accessed on November 16, 2025, [https://www.reddit.com/r/Frontend/comments/157zmvf/is\_framer\_motion\_as\_powerful\_as\_gsap\_to\_create/](https://www.reddit.com/r/Frontend/comments/157zmvf/is_framer_motion_as_powerful_as_gsap_to_create/)  
35. React & GSAP | GSAP | Docs & Learning, accessed on November 16, 2025, [https://gsap.com/resources/React/](https://gsap.com/resources/React/)  
36. Best JavaScript Testing Framework? 5 to Consider \- Testim.io, accessed on November 16, 2025, [https://www.testim.io/blog/best-javascript-testing-framework-five-to-consider/](https://www.testim.io/blog/best-javascript-testing-framework-five-to-consider/)  
37. What test library to use? QUnit or Jasmine? \- javascript \- Reddit, accessed on November 16, 2025, [https://www.reddit.com/r/javascript/comments/6l7017/what\_test\_library\_to\_use\_qunit\_or\_jasmine/](https://www.reddit.com/r/javascript/comments/6l7017/what_test_library_to_use_qunit_or_jasmine/)  
38. Setting up Jest for a browser based JavaScript project | Mario's Site, accessed on November 16, 2025, [https://marioyepes.com/blog/jest-setup-vanilla-javascript-project/](https://marioyepes.com/blog/jest-setup-vanilla-javascript-project/)  
39. How to Unit Test HTML and Vanilla JavaScript Without a UI Framework \- DEV Community, accessed on November 16, 2025, [https://dev.to/thawkin3/how-to-unit-test-html-and-vanilla-javascript-without-a-ui-framework-4io](https://dev.to/thawkin3/how-to-unit-test-html-and-vanilla-javascript-without-a-ui-framework-4io)  
40. Setting up CI \- Playwright, accessed on November 16, 2025, [https://playwright.dev/docs/ci-intro](https://playwright.dev/docs/ci-intro)