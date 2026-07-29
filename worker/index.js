const NOT_FOUND_PATH = "/404.html";

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const notFoundUrl = new URL(NOT_FOUND_PATH, request.url);
    const notFound = await env.ASSETS.fetch(new Request(notFoundUrl, request));

    return new Response(notFound.body, {
      status: 404,
      headers: notFound.headers,
    });
  },
};
