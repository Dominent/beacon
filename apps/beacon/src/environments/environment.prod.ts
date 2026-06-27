// Production (Vercel): the API is a serverless function on the SAME origin,
// so requests are root-relative (the base-url interceptor leaves /api/* as-is).
export const environment = {
  apiBaseUrl: '',
};
