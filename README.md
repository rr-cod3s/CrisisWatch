# CrisisWatch

CrisisWatch is a responsive service-status dashboard built with HTML, CSS, and vanilla JavaScript. It loads component data from the [GitHub Status API](https://www.githubstatus.com/api/v2/summary.json), derives an overall health status, and provides search, status filters, and manual refreshes. A built-in demo mode makes problem states reproducible with simulated data.

## Project Goal

The project was created to practise working with a real external API and the different UI states that come with asynchronous data. CrisisWatch gives users a quick overview of available, degraded, and unavailable services while keeping the interface simple and responsive.

## Live Demo

[Open CrisisWatch](https://rr-cod3s.github.io/CrisisWatch/)

## Demo Scenarios

Choose **Demo Mode** in the dashboard header to open the critical scenario. Use the links in the demo banner to switch scenarios, or append one of these query strings to the dashboard URL:

| Query string | Expected behaviour |
| --- | --- |
| `?demo=operational` | All sample services have operational status. |
| `?demo=degraded` | Some sample services are degraded, with no outages. |
| `?demo=critical` | Sample data includes outages, producing critical overall health. |
| `?demo=empty` | No services are returned; the dashboard shows its no-data and empty-table states. |
| `?demo=error` | A simulated request error displays the error panel and retry button. |

The banner identifies the active simulation. Demo service data comes from `data/services.json`; the error scenario throws a deliberate error without fetching data. Demo response-time values are illustrative, not real measurements.

The error scenario fails on every retry by design. Choose another scenario to continue, or select **Return to Live Data** to leave demo mode. Removing the `demo` query parameter also restores live mode; unrecognised scenario values fall back to live mode.

## Preview

![Current CrisisWatch dashboard with live GitHub service-status data](./images/CrisisWatch_Overview.png)

Current dashboard interface showing live service data, the manual refresh control, and access to Demo Mode.

## Features

- Loads and validates live service-status data
- Shows loading, error, empty, and retry states
- Displays totals for operational, degraded, and unavailable services
- Derives an overall system-health status
- Supports search and status filtering
- Allows manual refreshes without hiding the previous data
- Cancels outdated requests and stops requests after a 10-second timeout
- Shows the last successful data-load time separately from each component's update time
- Provides five clearly labelled demo scenarios
- Uses labelled form controls, semantic tables, focus styles, live regions, and reduced-motion support

## How It Works

The project is split into four JavaScript modules:

- `api.js` fetches and normalises GitHub data, loads and transforms demo fixtures, and validates service data.
- `app.js` selects live or demo mode and manages application state, requests, and user events.
- `filters.js` combines the text search and status filter.
- `render.js` updates the visible dashboard.

State changes are handled through `setState()`. It calls `renderApp()`, which updates request controls and, when data is available, calculates statistics, filters services, and passes the results to the render functions. Refresh notifications use a separate toast helper.

Overview counts and overall health use the full loaded service list. Search and status filters affect the table and result count without changing that list. An outage takes priority over degraded status; an empty list produces no-data health.

### Data Model and Validation

Each internal service contains `id`, `name`, `status`, `responseTime`, and `lastChecked`. GitHub statuses are mapped as follows:

- `operational` becomes `operational`.
- `degraded_performance`, `partial_outage`, and `under_maintenance` become `degraded`.
- `major_outage` becomes `outage`.

Components marked `showcase: false` and components with unrecognised statuses are excluded before service validation. The remaining services are checked for non-empty IDs and names, known internal statuses, finite non-negative response times or `null`, parseable timestamps, and unique IDs. Demo fixtures are validated both before and after their scenario transformation.

### Timestamps and Performance

- **Data Fetched** records the last successful data load in the current page session, including fixture loads in demo mode. It does not advance after a failed request.
- **Component updated** uses `lastChecked`, which is mapped from GitHub's `updated_at` in live mode. It is a provider update timestamp, not an independent CrisisWatch health check. Demo timestamps come from the fixture.
- **Response Time** displays `No Data` in live mode because the adapter sets `responseTime` to `null`; no latency measurement is performed.
- **Performance** displays `Unavailable` for an outage. Otherwise, a missing response time produces `No data`. Numeric demo values are labelled `Fast` below 200 ms, `Moderate` from 200 through 500 ms, and `Slow` above 500 ms.

## Key Decisions

- **Vanilla JavaScript:** The project avoids frameworks so the focus stays on JavaScript fundamentals, DOM rendering, and asynchronous requests.
- **Internal data model:** GitHub's response is converted and validated before it reaches the interface. This keeps the remaining code independent from the exact API structure.
- **Central application state:** Search, filters, request state, refresh state, demo selection, and service data are managed together and rendered through `renderApp()`.
- **Request cancellation and timeout:** Previous requests are cancelled before a new one starts, and requests are stopped after ten seconds to avoid an endless loading state.
- **Keep previous data during refresh:** A failed refresh displays a warning while the last successful dashboard remains visible.

## Project Structure

```text
CrisisWatch/
├── css/
│   └── styles.css
├── data/
│   └── services.json
├── fonts/
├── images/
├── js/
│   ├── api.js
│   ├── app.js
│   ├── filters.js
│   └── render.js
├── index.html
└── README.md
```

`data/services.json` provides the sample data used by demo mode. Live mode loads component data directly from the GitHub Status API.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- ES Modules
- Fetch API
- AbortController
- Git and GitHub Pages

The project has no third-party JavaScript runtime dependencies or build step. It requires a web server for local use and network access to the status provider in live mode.

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/rr-cod3s/CrisisWatch.git
   ```

2. Open the project folder.

3. Start a local web server, for example with the Live Server extension in VS Code.

4. Open the served `index.html` in a browser. For a demo-only session without a request to the GitHub Status API, open `index.html?demo=critical` directly.

The project uses ES modules and remote requests, so opening `index.html` directly through `file://` may not work correctly.

## Testing and Limitations

No automated test suite is included yet. The demo scenarios support repeatable manual checks:

1. Open each scenario and compare its result with the table above. The critical scenario should take priority even when other services are degraded or operational.
2. Combine a search term with a status filter. Check case-insensitive matching, ignored surrounding spaces, and a query with no matches. Overview totals should remain unchanged.
3. Refresh a successfully loaded scenario. Existing data should stay visible while the refresh button is disabled; a successful load should update **Data Fetched** and show a confirmation.
4. Use the error scenario to inspect the error panel. Retry should remain in the error state while that scenario is selected. Return to live mode and confirm that the demo banner disappears.

Network failures and timeouts need separate checks; the error scenario is not a timeout simulation. After a successful live load, block the provider request in browser developer tools and refresh. The previous data and fetch timestamp should remain, with a warning toast. Restore requests afterwards. To check the timeout, use a request delayed beyond ten seconds: an initial load should end in the error panel, while a refresh should retain the previous data and show a timeout warning.

Current limitations:

- Live mode depends on the GitHub Status provider and does not measure response times or independently check service availability.
- Overall health is a simplified summary of included components, not GitHub's separate overall status or an incident feed. Maintenance is grouped with degraded status; unrecognised component statuses are currently omitted.
- Updates happen on page load and through manual refresh. There is no automatic polling or persistent cache; the last successful data is kept only within the current page session.
- The application does not collect a continuous status history or display incidents.

## What I Learned

- Working with `fetch()`, `async`, and `await`
- Validating and normalising external API data
- Managing loading, error, success, and refresh states
- Keeping application state and DOM rendering separate
- Combining multiple filters without changing the original data
- Improving responsive design and accessibility

## Possible Next Steps

- Add automated tests
- Add automatic refreshes
- Save the last successful response locally
- Add table sorting
- Add service details and incident history
