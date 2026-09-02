import { fetchServices } from "./api.js";
import { renderOverviewCards, showLoading, showError, renderServiceTable, showTable, renderSearchResultMessage, renderLastUpdated } from "./render.js";
import { filterServices } from "./filters.js";

let allServices = [];
let searchTerm = "";
let selectedStatus = "all";

const tryAgainButton = document.getElementById("tryAgainButton");

tryAgainButton.addEventListener("click", init);

init();

async function init() {
  showLoading();

  try {
    allServices = await fetchServices();
    const services = allServices;

    const stats = {
      total: services.length,
      operational: services.filter((service) => service.status === "operational").length,
      degraded: services.filter((service) => service.status === "degraded").length,
      outage: services.filter((service) => service.status === "outage").length,
    };
    renderOverviewCards(stats);

    renderLastUpdated(services);

    const systemText = document.getElementById("systemText");
    const serviceText = document.getElementById("serviceText");
    const statusImage = document.getElementById("statusImage");

    if (stats.outage > 0) {
      serviceText.textContent = `${stats.outage} Services are unavailable.`;
      systemText.textContent = "Overall system health is Critical";
      statusImage.src = "./images/system-critical.svg";
    } else if (stats.degraded > 0 && stats.outage === 0) {
      serviceText.textContent = `${stats.degraded} Services are degraded.`;
      systemText.textContent = "Overall system health is degraded";
      statusImage.src = "./images/system-degraded.svg";
    } else if (stats.total <= 0) {
      serviceText.textContent = "No Data found.";
      systemText.textContent = "No Data";
      statusImage.src = "./images/system-no-data.svg";
    } else {
      serviceText.textContent = "All systems operational.";
      systemText.textContent = "Overall system health is good.";
      statusImage.src = "./images/system-operational.svg";
    }

    updateView();
    showTable();
  } catch (error) {
    console.error(error);
    showError();
  }
}

function updateView() {
  const filteredServices = filterServices(allServices, searchTerm, selectedStatus);

  renderSearchResultMessage(filteredServices.length, allServices.length);
  renderServiceTable(filteredServices);
}

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  updateView();
});

document.querySelectorAll('input[name="status"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    selectedStatus = event.target.value;
    updateView();
  });
});
