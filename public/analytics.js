(() => {
  const SCRIPT = document.currentScript;
  const API_KEY = SCRIPT?.dataset.apiKey;
  const API_ENDPOINT = window.__ANALYTICS_ENDPOINT__ || "https://analytics.winapps.io/api/event";
  if (!API_KEY) {
    console.warn("[Analytics] Missing data-api-key attribute");
    return;
  }

  const sidKey = "_a_sid";
  const getSessionId = () => {
    try {
      let sid = sessionStorage.getItem(sidKey);
      if (!sid) {
        sid = crypto.randomUUID();
        sessionStorage.setItem(sidKey, sid);
      }
      return sid;
    } catch (_) {
      return "";
    }
  };

  const payloadBase = {
    api_key: API_KEY,
    lang: navigator.language,
    screen_w: screen.width,
    screen_h: screen.height,
    session_id: getSessionId(),
  };

  const send = (data) => {
    const body = JSON.stringify({ ...payloadBase, ...data, url: location.href, referrer: document.referrer });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(API_ENDPOINT, body);
    } else {
      fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-KEY": API_KEY },
        body,
        keepalive: true,
      });
    }
  };

  document.addEventListener("DOMContentLoaded", () => send({ event_type: "pageview" }), { once: true });

  window.trackEvent = (event_type, extra = {}) => send({ event_type, ...extra });
})();