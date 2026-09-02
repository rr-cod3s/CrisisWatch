export async function fetchServices() {
  const response = await fetch("./data/services.json");

  if (!response.ok) {
    throw new Error("Services could not be loaded.");
  }

  const validStatuses = ["operational", "degraded", "outage"];
  function isValidService(service) {
    return (
      service !== null &&
      typeof service === "object" &&
      !Array.isArray(service) &&
      typeof service.id === "number" &&
      typeof service.name === "string" &&
      service.name.trim() !== "" &&
      validStatuses.includes(service.status) &&
      (service.responseTime === null || (typeof service.responseTime === "number" && Number.isFinite(service.responseTime) && service.responseTime >= 0)) &&
      typeof service.lastChecked === "string" &&
      !Number.isNaN(Date.parse(service.lastChecked))
    );
  }

  function isValidServices(services) {
    return Array.isArray(services) && services.every(isValidService) && new Set(services.map((service) => service.id)).size === services.length;
  }

  const services = await response.json();

  if (!isValidServices(services)) {
    throw new Error("Service data has an invalid format.");
  }

  return services;
}
