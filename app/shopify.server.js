import "@shopify/shopify-app-react-router/adapters/node";
import { Session } from "@shopify/shopify-api";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";

// Helper to call the live backend API
const BACKEND_URL =
  import.meta.env.VITE_SHOPIFY_APP_URL 

async function callBackendApi(path, options = {}) {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    // Log details for debugging
    const errorText = await res.text();
    console.error(
      `Backend API error: ${res.status} at ${url}\nResponse: ${errorText}`,
    );
    // 404 likely means the /sessions endpoint is not implemented on your backend
    throw new Error(`Backend API error: ${res.status} at ${url}`);
  }
  return res.json();
}

// Session storage implementation using backend API (MongoDB)
const mongoSessionStorage = {
  async storeSession(session) {
    // POST to /api/phone with session data
    return callBackendApi("/api/phone", {
      method: "POST",
      body: JSON.stringify(session),
    });
  },
  async loadSession(id) {
    // GET from /api/phone/:id
    const sessionData = await callBackendApi(`/api/phone/${id}`);
    if (!sessionData || !sessionData.id) return undefined;
    // Rehydrate the session object for Shopify
    // Adjust the fields as needed based on your session schema
    const session = new Session({
      id: sessionData.id,
      shop: sessionData.shop,
      state: sessionData.state,
      isOnline: sessionData.isOnline,
      scope: sessionData.scope,
      accessToken: sessionData.accessToken,
      expires: sessionData.expires ? new Date(sessionData.expires) : undefined,
      onlineAccessInfo: sessionData.onlineAccessInfo,
      user: sessionData.user,
    });
    return session;
  },
  async deleteSession(id) {
    // DELETE to /api/phone/:id
    return callBackendApi(`/api/phone/${id}`, { method: "DELETE" });
  },
};

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: mongoSessionStorage,
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
// Exporting the sessionStorage used by Shopify (backed by MongoDB via backend API)
export const sessionStorage = shopify.sessionStorage;
