export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Provide a simple API route example if serverless API capability is needed in the future
    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({ 
        status: "ok", 
        time: new Date().toISOString(),
        service: "Masonic Lodge Registry API"
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Force trailing slash or base path /index.html if we request root directly, 
    // to safeguard against some asset fetch routing issues
    let finalRequest = request;
    if (url.pathname === "/" || url.pathname === "") {
      const indexUrl = new URL('/index.html', url.origin);
      finalRequest = new Request(indexUrl, request);
    }

    // Serve static assets natively via Worker static assets binding
    try {
      const response = await env.ASSETS.fetch(finalRequest);
      
      // Fallback for SPA routing: if requesting a client-side path (not a static file like css/png),
      // redirect and load index.html to let React handle it
      if ((response.status === 404 || response.status === 405) && !url.pathname.includes('.')) {
        const spaRequest = new Request(new URL('/index.html', url.origin), request);
        return env.ASSETS.fetch(spaRequest);
      }
      
      return response;
    } catch (e) {
      return new Response(`Error loading static asset: ${(e as Error).message}`, { status: 500 });
    }
  }
};
