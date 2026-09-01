export function renderOverviewCards(stats) {
  document.getElementById("totalServices").textContent = stats.total;

  document.getElementById("operationalServices").textContent = stats.operational;

  document.getElementById("degradedServices").textContent = stats.degraded;

  document.getElementById("outageServices").textContent = stats.outage;
}

export function showLoading() {
  document.getElementById("loadingState").hidden = false;
  document.getElementById("tableWrapper").hidden = true;
}

export function hideLoading() {
  document.getElementById("loadingState").hidden = true;
  document.getElementById("tableWrapper").hidden = false;
}

export function showError() {
  document.getElementById("errorState").hidden = false;
  document.getElementById("tableWrapper").hidden = true;
}

export function hideError() {
  document.getElementById("errorState").hidden = true;
  document.getElementById("tableWrapper").hidden = false;
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
  }    
}

const serviceTable = document.getElementById("serviceTable");

export function renderServiceTable(services) {
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
      newService.textContent = service.name;
      getPerformanceDetails(service);

      newLastChecked.textContent = service.lastChecked;
      newTableRow.append(newService, newStatus, newResponseTime, newPerformance, newLastChecked);
      serviceTable.append(newTableRow);
    });
}

