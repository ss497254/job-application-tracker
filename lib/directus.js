import env from "@beam-australia/react-env";
import { Directus } from "@directus/sdk";

import { AuthStore } from "@/stores/AuthStore";

export const url = env("API_URL");
export const directus = new Directus(url, { storage: { prefix: "WEB_" } });

/**
 * Get current user from API.
 * @returns User object if session is valid.
 */
export async function getUser() {
  try {
    return await directus.users.me.read();
  } catch {
    return;
  }
}

/**
 * Get current access token.
 * @returns Access token.
 */
export async function getToken() {
  try {
    await directus.auth.refreshIfExpired();
  } catch {
    // Ignore error
  }
  return directus.auth.token;
}

export async function getBearer() {
  return `Bearer ${await getToken()}`;
}

/**
 * Login to the API.
 */
export async function login(email, password) {
  await directus.auth.login({ email, password });

  const user = await directus.users.me.read();
  AuthStore.update((s) => {
    s.user = user;
  });
}

let websocket;
let websocketReadyResolver;
let websocketReady;
const websocketSubscriptions = new Map();

async function receiveMessage(message) {
  const data = JSON.parse(message.data);

  if (data.type === "ping") {
    websocket.send(
      JSON.stringify({
        type: "pong",
      })
    );
    return;
  }

  if (data.type === "auth" && data.status === "ok") {
    websocketReadyResolver(websocket);
    return;
  }

  if (
    data.type === "auth" &&
    data.status === "error" &&
    data.error.code === "TOKEN_EXPIRED"
  ) {
    websocketReady = new Promise((r) => {
      websocketReadyResolver = r;
    });
    websocket.send(
      JSON.stringify({
        type: "auth",
        access_token: await getToken(),
      })
    );
    return;
  }

  if (data.type === "subscription" && data.uid && data.event !== "init") {
    const callback = websocketSubscriptions.get(data.uid);
    callback?.(data.data);
  }
}

export async function getWebsocket() {
  if (!websocket) {
    websocket = new WebSocket(env("WS_URL"));
    websocket.addEventListener("open", async () =>
      websocket.send(
        JSON.stringify({
          type: "auth",
          access_token: await getToken(),
        })
      )
    );
    websocketReady = new Promise((r) => {
      websocketReadyResolver = r;
    });
    websocket.addEventListener("message", (message) => receiveMessage(message));
  }
  return websocketReady;
}

export async function subscribe(uid, options, callback) {
  const websocket = await getWebsocket();

  if (websocketSubscriptions.has(uid)) {
    return;
  }

  websocketSubscriptions.set(uid, callback);

  websocket.send(
    JSON.stringify({
      uid,
      type: "subscribe",
      collection: options.collection,
      event: options.event,
      query: options.query,
    })
  );
}

export function unsubscribe(uid) {
  websocket.send(
    JSON.stringify({
      uid,
      type: "unsubscribe",
    })
  );

  websocketSubscriptions.delete(uid);
}
