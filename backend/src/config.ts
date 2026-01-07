const constants = {
  jwtSecret: process.env.JWT_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  vercelProduction: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  vercelUrl: process.env.VERCEL_URL,
  vercelEnv: process.env.VERCEL_ENV as "production" | "preview" | undefined,
};

export { constants };
