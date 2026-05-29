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

    // Serve static assets natively via Worker static assets binding
    try {
      const response = await env.ASSETS.fetch(request);
      
      // Fallback for SPA routing: if requesting a client-side path (not a static file like css/png),
      // redirect and load index.html to let React handle it
      if (response.status === 404 && !url.pathname.includes('.')) {
        const spaRequest = new Request(new URL('/index.html', url.origin), request);
        return env.ASSETS.fetch(spaRequest);
      }
      
      return response;
    } catch (e) {
      return new Response("Error loading static asset", { status: 500 });
    }
  }
};
