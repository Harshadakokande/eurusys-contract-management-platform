# Eurosys Contract Management Platform

This project is a Eurosys Contract Management Platform developed using React and TypeScript.  
It provides a structured way to create reusable contract blueprints, generate contracts from those blueprints, and manage contracts through a controlled lifecycle with clearly defined stages.

The application focuses on maintaining correct workflow transitions, consistent state handling, and a clean, user-friendly interface.

## Setup Instructions

```bash
npm install
npm run dev

```

Opens at http://localhost:3000


## Tech Stack

This project is implemented using a modern frontend technology stack chosen to balance simplicity, scalability, and maintainability.

**React 18**  
React is used for building a component-based user interface. It allows the application to be structured into reusable UI and feature components, making the codebase modular and easy to extend.

**TypeScript**  
TypeScript provides strong static typing across the application. Domain models such as contracts, blueprints, and lifecycle states are strictly typed, which helps prevent invalid state transitions and logical errors during development.

**Component-Based Architecture**  
The UI is divided into atomic components (Button, Input, Table, Badge) and feature-level components (BlueprintForm, SignaturePad). This ensures separation of concerns and keeps each part of the system focused on a single responsibility.

**State Management (Zustand)**  
Zustand is used for global state management. It provides a lightweight and readable alternative to heavier solutions like Redux, while still offering predictable state updates and easy persistence.

**LocalStorage (Mock Data Layer)**  
No backend is used. All data is stored in the browser using `localStorage` through Zustand persistence. This satisfies the assignment requirement for mock data and keeps the project fully frontend-focused.

**CSS Modules**  
CSS Modules are used for styling to avoid global CSS conflicts and keep styles scoped to individual components. Design consistency is maintained using CSS variables for colors, spacing, and typography.


## Features

**Blueprint Management**  
Create reusable contract blueprints with configurable fields.  
Supported field types include Text, Date, Signature, and Checkbox.  
Fields can be ordered using simple move up and move down controls.

**Contract Lifecycle Control**  
Contracts move through a predefined lifecycle:
`Created → Approved → Sent → Signed → Locked`.  
All state transitions are validated to prevent skipping steps or invalid changes.

**Revocation Handling**  
Contracts can be revoked during early stages such as Created, Approved, or Sent.  
Once a contract reaches Signed or Locked status, it becomes immutable.

**Contract Dashboard**  
View all contracts in a structured table.  
Contracts can be filtered by status (Active, Pending, Signed, Archived) and searched by contract or blueprint name.

## Architecture & Design Decisions

### React 18 with TypeScript

React is used to build a modular, component-based user interface that keeps views and logic clearly separated.

TypeScript plays a key role in enforcing correctness across the application. Core concepts such as `ContractStatus` and `FieldType` are defined using strict union types, which helps prevent invalid lifecycle states and transitions during development rather than at runtime. This makes the contract workflow more reliable and easier to maintain.

---

### State Management with Zustand

Zustand is used for state management to keep the codebase simple and readable.  
It provides predictable state updates without introducing the complexity and boilerplate typically associated with larger state management solutions.

State persistence is handled using built-in middleware, allowing blueprint and contract data to be retained across page reloads with minimal configuration.

### Styling Approach with CSS Modules

CSS Modules are used to keep styles scoped to individual components and avoid global styling conflicts.  
This approach provides greater control over layout and visual structure without relying on large utility-class conventions.

Design tokens such as colors, spacing, and typography are managed using CSS variables, making it easy to maintain consistency and support theming across the application.

---

### Lifecycle Validation Logic

Contract lifecycle rules are centralized in `src/utils/stateMachine.ts`.  
All status changes are validated through a single transition-checking function, ensuring that contracts can move only through valid stages and that invalid or skipped transitions are prevented.

This design keeps lifecycle behavior consistent across the UI and makes the logic easy to test and reason about. The lifecycle rules are covered by automated tests to verify correct behavior.

---

### Blueprint Snapshot Strategy

When a contract is created from a blueprint, all blueprint fields are copied into the contract instead of being referenced directly.  
This ensures that existing contracts remain unaffected by future blueprint edits and that each contract represents a stable snapshot of its original template.

This approach reflects real-world contract systems, where generated documents are not modified retroactively.


## Project Structure

```
src/
├── components/
│   ├── features/
│   │   ├── BlueprintForm/
│   │   │   ├── BlueprintForm.tsx
│   │   │   └── BlueprintForm.module.css
│   │   │   # Blueprint creation and field configuration
│   │   │
│   │   └── SignaturePad/
│   │       ├── SignaturePad.tsx
│   │       └── SignaturePad.module.css
│   │       # Canvas-based signature component
│   │
│   ├── Layout/
│   │   ├── Layout.tsx
│   │   └── Layout.module.css
│   │   # Application shell and navigation
│   │
│   └── ui/
│       ├── Badge/
│       ├── Button/
│       ├── Card/
│       ├── Input/
│       ├── Modal/
│       ├── Select/
│       ├── Table/
│       └── Toast/
│       # Reusable atomic UI components
│
├── data/
│   # Preloaded default blueprint templates
│
├── pages/
│   ├── Blueprints/
│   │   ├── BlueprintCreate/
│   │   ├── BlueprintEdit/
│   │   └── BlueprintList/
│   │
│   ├── Contracts/
│   │   ├── ContractCreate/
│   │   └── ContractView/
│   │
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.module.css
│   │
│   └── NotFound/
│       # 404 fallback page
│
├── stores/
│   ├── blueprintStore.ts
│   ├── contractStore.ts
│   ├── index.ts
│   └── uiStore.ts
│   # Zustand state management with persistence
│
├── styles/
│   ├── global.css
│   ├── reset.css
│   └── variables.css
│   # Global styling, CSS reset, and theme tokens
│
├── types/
│   ├── blueprint.ts
│   ├── contract.ts
│   └── index.ts
│   # Strongly typed domain models
│
├── utils/
│   ├── stateMachine.ts
│   └── index.ts
│   # Core business logic and helpers
│
├── tests/
│   ├── setup.ts
│   └── stateMachine.test.ts
│   # Unit tests for lifecycle rules
│
├── router.tsx
│   # Application routing configuration
│
├── main.tsx
│   # React application entry point
│
└── vite-env.d.ts
    # Vite TypeScript environment definitions


```

## Assumptions

**Single-User Demonstration Mode**  
The application is designed to demonstrate the complete contract lifecycle within a single UI. The same user performs both internal actions (creating, approving, sending contracts) and client-side actions (reviewing and signing). UI hints clearly indicate which actions represent manager vs client behavior.

**Frontend-Only Implementation (No Backend)**  
This project intentionally does not use a backend service. All data is stored locally using browser `localStorage` via Zustand persistence. Because there is no server, actions that would normally involve external users (such as real email delivery or remote client signing) are simulated at the UI level.

**Signature Handling Limitation**  
The signature feature is implemented using an HTML5 Canvas to visually capture a signature. However, since there is no backend or authentication layer, the contract lifecycle is intentionally constrained after the `SENT` stage.  
This prevents artificial or unrealistic progression of the lifecycle and ensures that state transitions remain logically correct and non-deceptive.

This limitation is a conscious design decision to preserve lifecycle integrity in a frontend-only system.


## Limitations

- Contract signing is simulated and does not involve real user authentication.
- After sending a contract, progression depends on simulated client interaction.
- No PDF export or document download is implemented.
- Field ordering uses buttons instead of drag-and-drop.
- UI is optimized primarily for desktop screens.

## Tests

```bash
npm run test
```

14 unit tests covering:
- Valid forward transitions (Created → Approved → Sent → etc.)
- Blocked transitions (can't skip states, can't go backward except Revert to Draft)
- Terminal state enforcement (Locked/Revoked contracts can't transition)
- Dashboard filter mapping Verifies correct mapping of contract statuses to dashboard filters (Active, Pending, Signed, Archived)

## Default Templates

The application includes preloaded blueprint templates so the system can be explored immediately without manual setup:

Employment Contract

Non-Disclosure Agreement (NDA)

Freelance Service Agreement

These templates are included directly within the application code to demonstrate real-world usage scenarios and ensure that evaluators can test blueprint creation, contract generation, and lifecycle flow immediately after setup.