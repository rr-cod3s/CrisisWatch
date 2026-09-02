export function filterServices(services, searchTerm, selectedStatus) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  return services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(normalizedSearchTerm);
    const matchesStatus = selectedStatus === "all" || service.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });
}
