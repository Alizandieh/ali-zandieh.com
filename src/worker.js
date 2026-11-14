export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.ali-zandieh.com') {
      url.hostname = 'ali-zandieh.com';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
