const constants = {
  jwtSecret: process.env.JWT_SECRET as string,
  productionUrl: "https://neighbour-zone.vercel.app",
  baseUrl: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:8000",
};

export { constants };
