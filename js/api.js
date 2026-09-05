const statusMap = {
  operational: "operational",
  degraded_performance: "degraded",
  partial_outage: "degraded",
  under_maintenance: "degraded",
  major_outage: "outage",
};

function mapGitHubComponent(component) {
  const status = statusMap[component.status];

  if (!status) {
    return null;
  }

  return {
    id: component.id,
    name: component.name,
    status,
    responseTime: null,
    lastChecked: component.updated_at,
  };
}

const validStatuses = ["operational", "degraded", "outage"];

function isValidService(service) {
  return (
    service !== null &&
    typeof service === "object" &&
    !Array.isArray(service) &&
    (typeof service.id === "number" || typeof service.id === "string") &&
    String(service.id).trim() !== "" &&
    typeof service.name === "string" &&
    service.name.trim() !== "" &&
    validStatuses.includes(service.status) &&
    (service.responseTime === null || (typeof service.responseTime === "number" && Number.isFinite(service.responseTime) && service.responseTime >= 0)) &&
    typeof service.lastChecked === "string" &&
    !Number.isNaN(Date.parse(service.lastChecked))
  );
}


export function createDemoServices(services, scenario) {
if (scenario === "operational") {
    return services.map((service) => ({ ...service, status: "operational", responseTime: service.responseTime ?? 150,}));
  }

  if (scenario === "degraded") {
    return services.map((service) => {
      if (service.status !== "outage") {
        return {...service};
      }

      return {...service, status: "operational", responseTime: 180,};
    });
  }

  if (scenario === "critical") {
    return services.map((service) => ({...service}));
  }

  if (scenario === "empty") {
    return [];
  }

  throw new Error("Unknown Demo Scenario");
}

export async function fetchDemoServices(scenario, {signal} = {}) {
  if (scenario === "error") {
    throw new Error("Simulated Demo error.");
  }

  const response = await fetch("./data/services.json", { signal, cache: "no-store" });

  if (!response.ok) {
    throw new Error("Demo services could not be loaded.");
  }

  const baseServices = await response.json();

  if (!isValidServices(baseServices)) {
    throw new Error("Demo service data has an invalid format.");
  }

  const demoServices = createDemoServices(baseServices, scenario);

  if (!isValidServices(demoServices)) {
    throw new Error("Demo service data has an invalid format.");
  }

  return demoServices;
}


function isValidServices(services) {
  return Array.isArray(services) && services.every(isValidService) && new Set(services.map((service) => service.id)).size === services.length;
}

export async function fetchServices({ signal } = {}) {

  const response = await fetch("https://www.githubstatus.com/api/v2/summary.json", { signal, cache: "no-store" });

  if (!response.ok) {
    throw new Error("Services could not be loaded.");
  }

  const apiData = await response.json();
  if (!apiData || !Array.isArray(apiData.components)) {
    throw new Error("Service data has an invalid format.");
  }

  const services = apiData.components
    .filter((component) => component.showcase !== false)
    .map(mapGitHubComponent)
    .filter(Boolean);

  if (!isValidServices(services)) {
    throw new Error("Service data has an invalid format.");
  }

  return services;
}
