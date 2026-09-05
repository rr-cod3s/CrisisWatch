export function renderOverviewCards(stats) {
  document.getElementById("totalServices").textContent = stats.total;

  document.getElementById("operationalServices").textContent = stats.operational;

  document.getElementById("degradedServices").textContent = stats.degraded;

  document.getElementById("outageServices").textContent = stats.outage;
}

export function renderDemoBanner(demoScenario) {
  const demoBanner = document.getElementById("demoBanner");
  const demoScenarioLabel = document.getElementById("demoScenarioLabel");

  const isDemoMode = demoScenario !== null;
  demoBanner.hidden = !isDemoMode;

  if (isDemoMode) {
    demoScenarioLabel.textContent = demoScenario;
  }
}

export function renderSystemHealth(health, stats) {
  const systemText = document.getElementById("systemText");
  const serviceText = document.getElementById("serviceText");
  const statusImage = document.getElementById("statusImage");

  if (health === "critical") {
    serviceText.textContent = `${stats.outage} Services are unavailable.`;
    systemText.textContent = "Overall system health is Critical";
    statusImage.src = "./images/system-critical.svg";
    return;
  }
  if (health === "degraded") {
    serviceText.textContent = `${stats.degraded} Services are degraded.`;
    systemText.textContent = "Overall system health is degraded";
    statusImage.src = "./images/system-degraded.svg";
    return;
  }
  if (health === "no-data") {
    serviceText.textContent = "No Data found.";
    systemText.textContent = "No Data";
    statusImage.src = "./images/system-no-data.svg";
    return;
  }

    serviceText.textContent = "All systems operational.";
    systemText.textContent = "Overall system health is good.";
    statusImage.src = "./images/system-operational.svg";
}

export function renderFetchedAt(fetchedAt) {
  const fetchedAtTime = document.getElementById("fetchedAtTime");

  if (!fetchedAtTime) {
    return;
  }

  if (!fetchedAt) {
    fetchedAtTime.textContent = "--";
    fetchedAtTime.removeAttribute("datetime");
    return;
  }

  const formattedDate = Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(fetchedAt));

  fetchedAtTime.dateTime = fetchedAt;
  fetchedAtTime.textContent = formattedDate;
}

function getPerformanceDetails(service) {
  if (service.status === "outage") {
    return { label: "Unavailable", type: "unavailable" };
  }

  if (service.responseTime === null) {
    return { label: "No data", type: "no-data" };
  }

  if (service.responseTime < 200) {
    return { label: "Fast", type: "fast" };
  }

  if (service.responseTime <= 500) {
    return { label: "Moderate", type: "moderate" };
  }

  return { label: "Slow", type: "slow" };
}

function responseTimeHandle(service, newResponseTime) {
  if (service.responseTime === null) {
    newResponseTime.textContent = "No Data";
  } else {
    newResponseTime.textContent = service.responseTime + " ms";
  }
}

function getStatusDetails(service) {
  if (service.status === "operational") {
    return {
      label: "Operational",
      type: "operational",
      icon: "./images/operational.svg",
    };
  }
  if (service.status === "degraded") {
    return {
      label: "Degraded",
      type: "degraded",
      icon: "./images/degraded.svg",
    };
  }
  return {
    label: "Outage",
    type: "outage",
    icon: "./images/outage.svg",
  };
}

export function renderSearchResultMessage(count, totalCount) {
  const message = document.getElementById("searchResultMessage");


  if (totalCount === 0) {
    message.textContent = "No services are available.";
  } else if (count === 0) {
    message.textContent = "No services match the current filters.";
  } else {
    message.textContent = `${count} services shown`;
  }
}

const serviceTable = document.getElementById("serviceTable");

export function renderServiceTable(services) {
  serviceTable.replaceChildren();

  if (services.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.textContent = "No services found.";

    row.append(cell);
    serviceTable.append(row);
    return;
  }

  services.forEach((service) => {
    const newTableRow = document.createElement("tr");
    const newService = document.createElement("td");
    const newStatus = document.createElement("td");
    const newResponseTime = document.createElement("td");
    const newPerformance = document.createElement("td");
    const newLastChecked = document.createElement("td");

    const performanceDetails = getPerformanceDetails(service);

    const performanceSpan = document.createElement("span");
    performanceSpan.classList.add("performance", `performance--${performanceDetails.type}`);
    performanceSpan.textContent = performanceDetails.label;
    newPerformance.appendChild(performanceSpan);
    const statusDetails = getStatusDetails(service);
    const statusContent = document.createElement("span");
    const statusIcon = document.createElement("img");
    statusContent.classList.add("status", `status--${statusDetails.type}`);
    statusIcon.src = statusDetails.icon;
    statusIcon.alt = "";
    statusContent.append(statusIcon, statusDetails.label);
    newStatus.append(statusContent);

    responseTimeHandle(service, newResponseTime);

    const date = new Date(service.lastChecked);
    const formatDate = Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(date);
    newService.textContent = service.name;

    newLastChecked.textContent = formatDate;
    newTableRow.append(newService, newStatus, newResponseTime, newPerformance, newLastChecked);
    serviceTable.append(newTableRow);
  });
}

let refreshStatusTimeoutId = null;

export function showRefreshStatus(message, dismissAfter = null) {
  const refreshStatus = document.getElementById("refreshStatus");

  window.clearTimeout(refreshStatusTimeoutId);

  refreshStatus.textContent = message;
  refreshStatus.hidden = false;

  if (dismissAfter !== null) {
    refreshStatusTimeoutId = window.setTimeout(() => {
      refreshStatus.hidden = true;
      refreshStatus.textContent = "";
    }, dismissAfter);
  }
}

export function renderRequestState(requestStatus) {
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const tableWrapper = document.getElementById("tableWrapper");
  const searchResults = document.getElementById("searchResults");

  const isLoading = requestStatus === "loading";
  const hasError = requestStatus === "error";
  const hasLoaded = requestStatus === "success";

  loadingState.hidden = !isLoading;
  errorState.hidden = !hasError;
  tableWrapper.hidden = !hasLoaded;
  searchResults.hidden = !hasLoaded;
}

export function renderRefreshButtonState(requestStatus, isRefreshing) {
  const refreshButton = document.getElementById("refreshButton");

  const shouldBeDisabled = requestStatus !== "success" || isRefreshing;

  refreshButton.disabled = shouldBeDisabled;
  refreshButton.setAttribute("aria-busy", String(isRefreshing));

  refreshButton.textContent = isRefreshing ? "Refreshing..." : "Refresh Services";
}
