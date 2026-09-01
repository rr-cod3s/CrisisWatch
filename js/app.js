import { fetchServices } from "./api.js";
import { renderOverviewCards } from "./render.js";
import { showLoading, hideLoading, renderServiceTable, showError, hideError } from "./render.js";

async function init() {
  hideError();
  showLoading();

  try {
    const services = await fetchServices();

    const stats = {
      total: services.length,
      operational: services.filter((service) => service.status === "operational").length,
      degraded: services.filter((service) => service.status === "degraded").length,
      outage: services.filter((service) => service.status === "outage").length,
    };
    renderOverviewCards(stats);


    const systemText = document.getElementById("systemText");
    const serviceText = document.getElementById("serviceText");
    const statusImage = document.getElementById("statusImage");

    if (stats.outage > 0) {
      serviceText.textContent = `${stats.outage} Services are unavailable.`;
      systemText.textContent = "Overall system health is Critical";
      statusImage.src = "./images/system-critical.svg";
    } else if (stats.degraded > 0 && stats.outage === 0) {
      serviceText.textContent = `${stats.degraded} Services are degraded.`;
      systemText.textContent = "Overall system health is ok";
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

    renderServiceTable(services);

  } catch (err) {
    console.log(err);
    showError();

  } finally {
    hideLoading();
  }
}
init();

const tryAgainButton = document.getElementById("tryAgainButton");
tryAgainButton.addEventListener("click", function retryFetchData() {
  init();
  showLoading()
})