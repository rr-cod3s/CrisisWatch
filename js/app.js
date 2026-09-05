import { fetchServices, fetchDemoServices } from "./api.js";
import { filterServices } from "./filters.js";
import { renderOverviewCards,
  renderSystemHealth,
  renderServiceTable,
  renderSearchResultMessage,
  renderFetchedAt,
  showRefreshStatus,
  renderRequestState,
  renderRefreshButtonState,
  renderDemoBanner } from "./render.js";


  const allowedDemoScenarios = new Set([
    "operational",
    "degraded",
    "critical",
    "empty",
    "error",
  ]
);

function getDemoScenario() {
  const searchParams = new URLSearchParams(window.location.search);

const requestedScenario = searchParams.get("demo");

return allowedDemoScenarios.has(requestedScenario) ? requestedScenario : null;
}


let activeController = null;

const state = {
allServices: [],
requestStatus: "idle",
isRefreshing: false,
searchTerm: "",
selectedStatus: "all",
fetchedAt: null,
error: null,
demoScenario: getDemoScenario(),
}

function setState(patch) {
  Object.assign(state, patch);
  renderApp(state);
}

function renderApp(state) {

  renderRequestState(state.requestStatus);
  renderRefreshButtonState(state.requestStatus, state.isRefreshing);
  renderFetchedAt(state.fetchedAt);
  renderDemoBanner(state.demoScenario);

  if (state.requestStatus !== "success") {
    return;
  }

  const stats = getStats(state.allServices);
  const health = getSystemHealth(stats);

  const filteredServices = filterServices(state.allServices, state.searchTerm, state.selectedStatus);

  renderOverviewCards(stats);
  renderSystemHealth(health, stats);
  renderSearchResultMessage(filteredServices.length, state.allServices.length);
  renderServiceTable(filteredServices);

}

function getStats(services) {
    return {
    total: services.length,
    operational: services.filter((service) => service.status === "operational").length,
    degraded: services.filter((service) => service.status === "degraded").length,
    outage: services.filter((service) => service.status === "outage").length,
  };
}

function getSystemHealth(stats) {
  if (stats.outage > 0) return "critical";
  if (stats.degraded > 0) return "degraded";
  if (stats.total === 0) return "no-data";
  return "operational";
}

async function loadServices({ isInitialLoad = false } = {}) {
  activeController?.abort();

  const controller = new AbortController();
    activeController = controller;


    let didTimeout = false;
    const timeoutID = window.setTimeout(()=> {
    controller.abort();
    didTimeout = true;
    }, 10_000);

  if (isInitialLoad) {
    setState({ requestStatus: "loading" });
  } else {
    setState({ isRefreshing: true });
    showRefreshStatus("Refreshing services..");
  }

  try {
    const services = state.demoScenario
     ? await fetchDemoServices(state.demoScenario, { signal: controller.signal })
     : await fetchServices({ signal: controller.signal });

    setState({
      allServices: services,
      requestStatus: "success",
      isRefreshing: false,
      fetchedAt: new Date().toISOString(),
    });

    if (!isInitialLoad) {
      showRefreshStatus("Services refreshed just now", 3000);
    }
  } catch (error) {

    if (error.name === "AbortError" && !didTimeout) {
      return;
    }

    console.error(error);

      let message = didTimeout ?
      "Request timed out Showing last successful data." :
      "Could not refresh. Showing last successful data.";

    if (isInitialLoad) {
      setState({ requestStatus: "error", isRefreshing: false });
    } else {
      setState({ isRefreshing: false });
      showRefreshStatus(message, 4000);
    }

  } finally {
    window.clearTimeout(timeoutID);
    if (activeController === controller) {
      activeController = null;
    }
  }
}

const tryAgainButton = document.getElementById("tryAgainButton");
tryAgainButton.addEventListener("click", () => {
  loadServices({ isInitialLoad: true });
});

const refreshButton = document.getElementById("refreshButton");
refreshButton.addEventListener("click", function () {
  loadServices({ isInitialLoad: false });
});

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", (event) => {
  setState({ searchTerm: event.target.value });
});

document.querySelectorAll('input[name="status"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    setState({ selectedStatus: event.target.value });
  });
});

loadServices({ isInitialLoad: true });
