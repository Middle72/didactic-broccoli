import { defineMiddleware } from 'astro:middleware';

const REDIRECT_HOSTS = new Set(['luckypennykitties.com', 'www.luckypennykitties.com']);
const REDIRECT_TARGET_HOST = 'luckypennykitties.org';
const COUNTDOWN_SECONDS = 15;

function forwardingPage(destination: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lucky Penny Kitties</title>
    <meta http-equiv="refresh" content="${COUNTDOWN_SECONDS};url=${destination}" />
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        background: #fff7ed;
        color: #292524;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        text-align: center;
        padding: 1.5rem;
      }
      .card { max-width: 32rem; }
      h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
      p { line-height: 1.6; }
      a { color: #c2410c; font-weight: 600; }
      .count { font-weight: 700; font-size: 1.25rem; color: #c2410c; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>🐾 Lucky Penny Kitties</h1>
      <p>
        You can find us at <a href="${destination}">luckypennykitties.org</a>.
        Redirecting in <span class="count" id="count">${COUNTDOWN_SECONDS}</span> seconds&hellip;
      </p>
      <p><a href="${destination}">Click here if you're not redirected automatically</a></p>
    </div>
    <script>
      let remaining = ${COUNTDOWN_SECONDS};
      const el = document.getElementById('count');
      const timer = setInterval(() => {
        remaining -= 1;
        if (el) el.textContent = String(Math.max(remaining, 0));
        if (remaining <= 0) {
          clearInterval(timer);
          window.location.replace(${JSON.stringify(destination)});
        }
      }, 1000);
    </script>
  </body>
</html>`;
}

export const onRequest = defineMiddleware((context, next) => {
  const { url } = context;
  const hostname = (context.request.headers.get('host') ?? url.hostname).split(':')[0];

  if (REDIRECT_HOSTS.has(hostname)) {
    const destination = `https://${REDIRECT_TARGET_HOST}${url.pathname}${url.search}`;

    return new Response(forwardingPage(destination), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  return next();
});
