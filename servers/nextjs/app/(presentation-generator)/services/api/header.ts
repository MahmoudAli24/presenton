const apiKeyHeader = (): Record<string, string> => {
  const key = process.env.NEXT_PUBLIC_AHLAN_API_KEY;
  return key ? { "X-API-Key": key } : {};
};

export const getHeader = () => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...apiKeyHeader(),
  };
};

export const getHeaderForFormData = () => {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    ...apiKeyHeader(),
  };
};
