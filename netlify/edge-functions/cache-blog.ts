export default async function handler(request: Request) {
  const response = await fetch(request);

  const newHeaders = new Headers(response.headers);
  newHeaders.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
