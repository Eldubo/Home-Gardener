export const getHealthStatus = async (api) => {
  const res = await api.get("/health");
  return res.data; // { status, message, timestamp, environment }
};
