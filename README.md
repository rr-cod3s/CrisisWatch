# CrisisWatch

CrisisWatch is a responsive service-status dashboard built with vanilla JavaScript.

It loads local sample data with the Fetch API, validates the response before rendering, and presents the resulting system state through summary cards and a searchable, filterable service table.

## Project Status

Version 1 is feature-complete locally. It uses local sample JSON data from `data/services.json`; it is not connected to an external monitoring API and has not been deployed yet.

Deployment, a live link, and a project screenshot are the remaining release steps.

## Features

- Loads JSON data with `fetch()` and `async` / `await`
- Checks HTTP responses with `response.ok`
- Validates the data shape before rendering
- Handles loading, error, empty, and retry states
- Calculates total, operational, degraded, and outage service counts
- Displays a derived overall system-health message
- Shows the latest timestamp available in the local data with `Intl.DateTimeFormat`
- Searches services by name
- Combines search and status filters without changing the original data
- Categorises response times as Fast, Moderate, Slow, Unavailable, or No data
- Uses semantic form controls, visible focus styles, live regions, and reduced-motion support
- Keeps the service table horizontally scrollable and keyboard-focusable on narrow screens

## Data Model and Validation

Each service in `data/services.json` follows this structure:

```json
{
  "id": 1,
  "name": "Payment API",
  "status": "degraded",
  "responseTime": 742,
  "lastChecked": "2026-08-30T12:30:00Z"
}
```

Allowed status values are `operational`, `degraded`, and `outage`.

Before rendering, the application checks that the response is an array, service names are not empty, statuses are known, response times are valid, timestamps can be parsed, and service IDs are unique. Invalid data reaches the error state instead of being partially rendered.

## Architecture

```text
CrisisWatch/
├── css/
│   └── styles.css
├── data/
│   └── services.json
├── fonts/
│   └── Figtree-VariableFont_wght.ttf
├── images/
├── js/
│   ├── api.js       # Fetching and data validation
│   ├── app.js       # Application state and orchestration
│   ├── filters.js   # Search and status-filter logic
│   └── render.js    # DOM rendering and UI states
├── index.html
└── README.md
```

`api.js` is responsible for loading and validating data. `filters.js` returns a new filtered array from the search term and selected status. `render.js` owns the visible UI states and rendered service table, while `app.js` coordinates state and user events.

## Technologies

- HTML
- CSS
- Vanilla JavaScript
- ES Modules
- Fetch API
- Git and GitHub

No dependencies or build step are required.

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/rr-cod3s/CrisisWatch.git
   ```

2. Open the project folder in an editor.

3. Serve the project with any local development server, such as the Live Server extension in VS Code.

The project uses `fetch()`, so opening `index.html` directly from the file system can prevent the JSON data from loading.

## What I Learned

- How `fetch()`, Promises, and `await` work together
- Why HTTP errors require `response.ok` in addition to `try` / `catch`
- How to keep data loading, filtering, and DOM rendering separate
- How to combine multiple filters without mutating original data
- How to design loading, error, empty, and retry states
- How small accessibility decisions improve everyday UI behaviour

## Technical Challenge

The main challenge was applying search and status filtering together while preserving the original service data for the overview cards and subsequent filter changes.

The solution is the central `filterServices()` function. It receives the source array, the search term, and the selected status, then returns a new array for rendering.

## Future Improvements

- Deploy the project and add a live demo link
- Add a screenshot to this README
- Add automated tests for filtering and data validation
- Connect a real external API
- Add automatic refreshes and request cancellation
- Add sorting by response time and status
- Add service detail views and incident history
