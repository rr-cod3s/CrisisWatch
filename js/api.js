export async function fetchServices() {
  const response = await fetch("./data/services.json");

  if (!response.ok) {
    throw new Error("Services could not be loaded.");
  }
  return response.json();
}
