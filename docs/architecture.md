# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Build the React app as route-based capability pages under `octofit-tracker/frontend/src`, each reading from a shared API client and rendering accessible loading, empty, and error states that match the contract tests.
- Logic tier decision: Keep Express route handlers thin and delegate domain behavior to services or inline logic in `octofit-tracker/backend/src` so the HTTP layer is responsible for validation, status codes, and JSON responses while persistence stays separate.
- Data tier decision: Model the domain with Mongoose schemas in `octofit-tracker/backend/src/models` and seed representative data with idempotent updates so the backend starts with consistent fixtures across local and test environments.
- Activity tracking approach: Validate required activity fields and references, reject invalid user/team IDs with a deliberate 4xx instead of a Mongo cast error, and store `user`, `team`, `type`, `minutes`, computed `points`, and `occurredAt` values.
- Team management approach: Require a team name and mascot, preserve a `members` array, and ensure list/create responses reflect the submitted team payload and linked member IDs.
- Leaderboard approach: Aggregate team totals from activity points, sort descending by total points, and assign a 1-based ranking that matches the API contract exactly.
- Workout suggestions approach: Match suggestions to a saved user by email, consider recent activity patterns and fitness goals, return a reason string, and reject unknown emails with a deliberate 4xx response.

## Test plan

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — validates the Mongoose schema contracts and the seed script's idempotent data setup. A failure here usually means the data model or seeded fixtures do not match the required domain contract.
- API command: `npm run test:api --prefix octofit-tracker/backend` — exercises the HTTP contract for activities, teams, leaderboard, and workout suggestions. A failure here indicates the route logic, validation, status codes, or payload shape do not match the API contract.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — validates the React UI contract including route rendering, fetch calls, loading states, empty states, and accessible error alerts. A failure here usually means the page is still showing placeholder content or not handling API responses correctly.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — checks that the TypeScript backend compiles cleanly and that types align with the Express/Mongoose implementation.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — checks that the Vite/React app compiles, with any failure pointing to type or bundling issues in the presentation layer.
