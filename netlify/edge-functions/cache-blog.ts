export default async function handler(request: Request, context: { next: () => Promise<Response> }) {
  const response = await context.next();
  response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
  return response;
}
