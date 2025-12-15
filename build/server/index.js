var _a;
import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter, UNSAFE_withComponentProps, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, useActionData, Form, redirect, UNSAFE_withErrorBoundaryProps, useRouteError, useFetcher } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-react-router/adapters/node";
import { Session } from "@shopify/shopify-api";
import { shopifyApp, AppDistribution, ApiVersion, LoginErrorType, boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { useState, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Box, Container, Paper, Typography, Fab, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Snackbar, Alert } from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { z } from "zod";
const BACKEND_URL = "https://whatsapp-mern-backend-sidn.onrender.com";
async function callBackendApi(path, options = {}) {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers || {}
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error(
      `Backend API error: ${res.status} at ${url}
Response: ${errorText}`
    );
    throw new Error(`Backend API error: ${res.status} at ${url}`);
  }
  return res.json();
}
const mongoSessionStorage = {
  async storeSession(session) {
    return callBackendApi("/api/phone", {
      method: "POST",
      body: JSON.stringify(session)
    });
  },
  async loadSession(id) {
    const sessionData = await callBackendApi(`/api/phone/${id}`);
    if (!sessionData || !sessionData.id) return void 0;
    const session = new Session({
      id: sessionData.id,
      shop: sessionData.shop,
      state: sessionData.state,
      isOnline: sessionData.isOnline,
      scope: sessionData.scope,
      accessToken: sessionData.accessToken,
      expires: sessionData.expires ? new Date(sessionData.expires) : void 0,
      onlineAccessInfo: sessionData.onlineAccessInfo,
      user: sessionData.user
    });
    return session;
  },
  async deleteSession(id) {
    return callBackendApi(`/api/phone/${id}`, { method: "DELETE" });
  }
};
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: mongoSessionStorage,
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true
  },
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
ApiVersion.October25;
const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
const login = shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, reactRouterContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: reactRouterContext, url: request.url }),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width,initial-scale=1"
      }), /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://cdn.shopify.com/"
      }), /* @__PURE__ */ jsx("link", {
        rel: "stylesheet",
        href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const action$3 = async ({
  request
}) => {
  const {
    payload,
    session,
    topic,
    shop
  } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  return new Response();
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3
}, Symbol.toStringTag, { value: "Module" }));
const action$2 = async ({
  request
}) => {
  const {
    shop,
    session,
    topic
  } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  if (session) {
    await db.session.deleteMany({
      where: {
        shop
      }
    });
  }
  return new Response();
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
function loginErrorMessage(loginErrors) {
  if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }
  return {};
}
const loader$4 = async ({
  request
}) => {
  const errors = loginErrorMessage(await login(request));
  return {
    errors
  };
};
const action$1 = async ({
  request
}) => {
  const errors = loginErrorMessage(await login(request));
  return {
    errors
  };
};
const route$1 = UNSAFE_withComponentProps(function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const {
    errors
  } = actionData || loaderData;
  return /* @__PURE__ */ jsx(AppProvider, {
    embedded: false,
    children: /* @__PURE__ */ jsx("s-page", {
      children: /* @__PURE__ */ jsx(Form, {
        method: "post",
        children: /* @__PURE__ */ jsxs("s-section", {
          heading: "Log in",
          children: [/* @__PURE__ */ jsx("s-text-field", {
            name: "shop",
            label: "Shop domain",
            details: "example.myshopify.com",
            value: shop,
            onChange: (e) => setShop(e.currentTarget.value),
            autocomplete: "on",
            error: errors.shop
          }), /* @__PURE__ */ jsx("s-button", {
            type: "submit",
            children: "Log in"
          })]
        })
      })
    })
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: route$1,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const loader$3 = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const headers$2 = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  headers: headers$2,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const index = "_index_1hqgz_1";
const heading = "_heading_1hqgz_21";
const text = "_text_1hqgz_23";
const content = "_content_1hqgz_43";
const form = "_form_1hqgz_53";
const label = "_label_1hqgz_69";
const input = "_input_1hqgz_85";
const button = "_button_1hqgz_93";
const list = "_list_1hqgz_101";
const styles = {
  index,
  heading,
  text,
  content,
  form,
  label,
  input,
  button,
  list
};
const loader$2 = async ({
  request
}) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return {
    showForm: Boolean(login)
  };
};
const route = UNSAFE_withComponentProps(function App2() {
  const {
    showForm
  } = useLoaderData();
  return /* @__PURE__ */ jsx("div", {
    className: styles.index,
    children: /* @__PURE__ */ jsxs("div", {
      className: styles.content,
      children: [/* @__PURE__ */ jsx("h1", {
        className: styles.heading,
        children: "A short heading about [your app]"
      }), /* @__PURE__ */ jsx("p", {
        className: styles.text,
        children: "A tagline about [your app] that describes your value proposition."
      }), showForm && /* @__PURE__ */ jsxs(Form, {
        className: styles.form,
        method: "post",
        action: "/auth/login",
        children: [/* @__PURE__ */ jsxs("label", {
          className: styles.label,
          children: [/* @__PURE__ */ jsx("span", {
            children: "Shop domain"
          }), /* @__PURE__ */ jsx("input", {
            className: styles.input,
            type: "text",
            name: "shop"
          }), /* @__PURE__ */ jsx("span", {
            children: "e.g: my-shop-domain.myshopify.com"
          })]
        }), /* @__PURE__ */ jsx("button", {
          className: styles.button,
          type: "submit",
          children: "Log in"
        })]
      }), /* @__PURE__ */ jsxs("ul", {
        className: styles.list,
        children: [/* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        }), /* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        }), /* @__PURE__ */ jsxs("li", {
          children: [/* @__PURE__ */ jsx("strong", {
            children: "Product feature"
          }), ". Some detail about your feature and its benefit to your customer."]
        })]
      })]
    })
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({
  request
}) => {
  await authenticate.admin(request);
  return {
    apiKey: process.env.SHOPIFY_API_KEY || ""
  };
};
const app = UNSAFE_withComponentProps(function App3() {
  const {
    apiKey
  } = useLoaderData();
  return /* @__PURE__ */ jsxs(AppProvider, {
    embedded: true,
    apiKey,
    children: [/* @__PURE__ */ jsxs("s-app-nav", {
      children: [/* @__PURE__ */ jsx("s-link", {
        href: "/app",
        children: "Home"
      }), /* @__PURE__ */ jsx("s-link", {
        href: "/app/additional",
        children: "Additional page"
      }), /* @__PURE__ */ jsx("s-link", {
        href: "/app/phone",
        children: "Phone"
      })]
    }), /* @__PURE__ */ jsx(Outlet, {})]
  });
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2() {
  return boundary.error(useRouteError());
});
const headers$1 = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: app,
  headers: headers$1,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const app_additional = UNSAFE_withComponentProps(function AdditionalPage() {
  return /* @__PURE__ */ jsxs("s-page", {
    heading: "Additional page",
    children: [/* @__PURE__ */ jsxs("s-section", {
      heading: "Multiple pages",
      children: [/* @__PURE__ */ jsxs("s-paragraph", {
        children: ["The app template comes with an additional page which demonstrates how to create multiple pages within app navigation using", " ", /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/apps/tools/app-bridge",
          target: "_blank",
          children: "App Bridge"
        }), "."]
      }), /* @__PURE__ */ jsxs("s-paragraph", {
        children: ["To create your own page and have it show up in the app navigation, add a page inside ", /* @__PURE__ */ jsx("code", {
          children: "app/routes"
        }), ", and a link to it in the", " ", /* @__PURE__ */ jsx("code", {
          children: "<ui-nav-menu>"
        }), " component found in", " ", /* @__PURE__ */ jsx("code", {
          children: "app/routes/app.jsx"
        }), "."]
      })]
    }), /* @__PURE__ */ jsx("s-section", {
      slot: "aside",
      heading: "Resources",
      children: /* @__PURE__ */ jsx("s-unordered-list", {
        children: /* @__PURE__ */ jsx("s-list-item", {
          children: /* @__PURE__ */ jsx("s-link", {
            href: "https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav",
            target: "_blank",
            children: "App nav best practices"
          })
        })
      })
    })]
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_additional
}, Symbol.toStringTag, { value: "Module" }));
const loader = async ({
  request
}) => {
  await authenticate.admin(request);
  return null;
};
const action = async ({
  request
}) => {
  const {
    admin
  } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][Math.floor(Math.random() * 4)];
  const response = await admin.graphql(`#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`, {
    variables: {
      product: {
        title: `${color} Snowboard`
      }
    }
  });
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(`#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`, {
    variables: {
      productId: product.id,
      variants: [{
        id: variantId,
        price: "100.00"
      }]
    }
  });
  const variantResponseJson = await variantResponse.json();
  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants
  };
};
const app__index = UNSAFE_withComponentProps(function Index() {
  var _a2, _b, _c, _d;
  const fetcher = useFetcher();
  const shopify2 = useAppBridge();
  const isLoading = ["loading", "submitting"].includes(fetcher.state) && fetcher.formMethod === "POST";
  useEffect(() => {
    var _a3, _b2;
    if ((_b2 = (_a3 = fetcher.data) == null ? void 0 : _a3.product) == null ? void 0 : _b2.id) {
      shopify2.toast.show("Product created");
    }
  }, [(_b = (_a2 = fetcher.data) == null ? void 0 : _a2.product) == null ? void 0 : _b.id, shopify2]);
  const generateProduct = () => fetcher.submit({}, {
    method: "POST"
  });
  return /* @__PURE__ */ jsxs("s-page", {
    heading: "Shopify app template",
    children: [/* @__PURE__ */ jsx("s-button", {
      slot: "primary-action",
      onClick: generateProduct,
      children: "Generate a product"
    }), /* @__PURE__ */ jsx("s-section", {
      heading: "Congrats on creating a new Shopify app 🎉",
      children: /* @__PURE__ */ jsxs("s-paragraph", {
        children: ["This embedded app template uses", " ", /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/apps/tools/app-bridge",
          target: "_blank",
          children: "App Bridge"
        }), " ", "interface examples like an", " ", /* @__PURE__ */ jsx("s-link", {
          href: "/app/additional",
          children: "additional page in the app nav"
        }), ", as well as an", " ", /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/api/admin-graphql",
          target: "_blank",
          children: "Admin GraphQL"
        }), " ", "mutation demo, to provide a starting point for app development."]
      })
    }), /* @__PURE__ */ jsxs("s-section", {
      heading: "Get started with products",
      children: [/* @__PURE__ */ jsxs("s-paragraph", {
        children: ["Generate a product with GraphQL and get the JSON output for that product. Learn more about the", " ", /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate",
          target: "_blank",
          children: "productCreate"
        }), " ", "mutation in our API references."]
      }), /* @__PURE__ */ jsxs("s-stack", {
        direction: "inline",
        gap: "base",
        children: [/* @__PURE__ */ jsx("s-button", {
          onClick: generateProduct,
          ...isLoading ? {
            loading: true
          } : {},
          children: "Generate a product"
        }), ((_c = fetcher.data) == null ? void 0 : _c.product) && /* @__PURE__ */ jsx("s-button", {
          onClick: () => {
            var _a3, _b2, _c2, _d2;
            (_d2 = (_c2 = shopify2.intents).invoke) == null ? void 0 : _d2.call(_c2, "edit:shopify/Product", {
              value: (_b2 = (_a3 = fetcher.data) == null ? void 0 : _a3.product) == null ? void 0 : _b2.id
            });
          },
          target: "_blank",
          variant: "tertiary",
          children: "Edit product"
        })]
      }), ((_d = fetcher.data) == null ? void 0 : _d.product) && /* @__PURE__ */ jsx("s-section", {
        heading: "productCreate mutation",
        children: /* @__PURE__ */ jsxs("s-stack", {
          direction: "block",
          gap: "base",
          children: [/* @__PURE__ */ jsx("s-box", {
            padding: "base",
            borderWidth: "base",
            borderRadius: "base",
            background: "subdued",
            children: /* @__PURE__ */ jsx("pre", {
              style: {
                margin: 0
              },
              children: /* @__PURE__ */ jsx("code", {
                children: JSON.stringify(fetcher.data.product, null, 2)
              })
            })
          }), /* @__PURE__ */ jsx("s-heading", {
            children: "productVariantsBulkUpdate mutation"
          }), /* @__PURE__ */ jsx("s-box", {
            padding: "base",
            borderWidth: "base",
            borderRadius: "base",
            background: "subdued",
            children: /* @__PURE__ */ jsx("pre", {
              style: {
                margin: 0
              },
              children: /* @__PURE__ */ jsx("code", {
                children: JSON.stringify(fetcher.data.variant, null, 2)
              })
            })
          })]
        })
      })]
    }), /* @__PURE__ */ jsxs("s-section", {
      slot: "aside",
      heading: "App template specs",
      children: [/* @__PURE__ */ jsxs("s-paragraph", {
        children: [/* @__PURE__ */ jsx("s-text", {
          children: "Framework: "
        }), /* @__PURE__ */ jsx("s-link", {
          href: "https://reactrouter.com/",
          target: "_blank",
          children: "React Router"
        })]
      }), /* @__PURE__ */ jsxs("s-paragraph", {
        children: [/* @__PURE__ */ jsx("s-text", {
          children: "Interface: "
        }), /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/api/app-home/using-polaris-components",
          target: "_blank",
          children: "Polaris web components"
        })]
      }), /* @__PURE__ */ jsxs("s-paragraph", {
        children: [/* @__PURE__ */ jsx("s-text", {
          children: "API: "
        }), /* @__PURE__ */ jsx("s-link", {
          href: "https://shopify.dev/docs/api/admin-graphql",
          target: "_blank",
          children: "GraphQL"
        })]
      }), /* @__PURE__ */ jsxs("s-paragraph", {
        children: [/* @__PURE__ */ jsx("s-text", {
          children: "Database: "
        }), /* @__PURE__ */ jsx("s-link", {
          href: "https://www.prisma.io/",
          target: "_blank",
          children: "Prisma"
        })]
      })]
    }), /* @__PURE__ */ jsx("s-section", {
      slot: "aside",
      heading: "Next steps",
      children: /* @__PURE__ */ jsxs("s-unordered-list", {
        children: [/* @__PURE__ */ jsxs("s-list-item", {
          children: ["Build an", " ", /* @__PURE__ */ jsx("s-link", {
            href: "https://shopify.dev/docs/apps/getting-started/build-app-example",
            target: "_blank",
            children: "example app"
          })]
        }), /* @__PURE__ */ jsxs("s-list-item", {
          children: ["Explore Shopify's API with", " ", /* @__PURE__ */ jsx("s-link", {
            href: "https://shopify.dev/docs/apps/tools/graphiql-admin-api",
            target: "_blank",
            children: "GraphiQL"
          })]
        })]
      })
    })]
  });
});
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: app__index,
  headers,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const initialForm = { phone_number: "", country_code: "" };
const Phone = () => {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form2, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [sessionId, setSessionId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const phoneSchema = z.object({
    phone_number: z.string().min(1, "Phone number is required"),
    country_code: z.string().min(1, "Country code is required")
  });
  const getShopDomain = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("shop") || "";
  };
  const fetchSessionId = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/phone/session/current`, {
        method: "GET",
        headers: {
          "X-Shopify-Shop-Domain": getShopDomain(),
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "include"
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSessionId(data.session._id);
      } else if (data.installUrl) {
        window.location.href = data.installUrl;
      } else {
        setSessionId(null);
      }
    } catch {
      setSessionId(null);
    }
  };
  const API_BASE_URL = "https://whatsapp-mern-backend-sidn.onrender.com/api";
  const getRequestHeaders = () => ({
    "Content-Type": "application/json",
    "Accept": "application / json",
    "ngrok-skip-browser-warning": "true",
    "X-Requested-With": "XMLHttpRequest"
  });
  const fetchPhones = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/phone`, {
        method: "GET",
        credentials: "include",
        headers: getRequestHeaders()
      });
      const data = await res.json();
      if (!data.status && !res.ok) {
        const responseMsg = JSON.stringify(data);
        const parse = JSON.parse(responseMsg);
        setSnackbar({
          open: true,
          message: parse.message,
          severity: "error"
        });
      }
      setPhones(data.data || []);
    } catch (err) {
      setPhones([]);
    }
    setLoading(false);
  };
  const handleOpenModal = (phone) => {
    if (phone) {
      setEditMode(true);
      setForm({
        phone_number: phone.phone_number,
        country_code: phone.country_code
      });
      setSelectedId(phone._id);
    } else {
      setEditMode(false);
      setForm(initialForm);
      setSelectedId(null);
    }
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setForm(initialForm);
    setSelectedId(null);
    setFormErrors({});
  };
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = editMode ? `${API_BASE_URL}/phone/${selectedId}` : `${API_BASE_URL}/phone/add`;
      const method = editMode ? "PUT" : "POST";
      setFormErrors({});
      const result = phoneSchema.safeParse(form2);
      if (!result.success) {
        const formattedErrors = result.error.format();
        const errors = {};
        if (formattedErrors.phone_number) {
          errors.phone_number = formattedErrors.phone_number._errors[0];
        }
        if (formattedErrors.country_code) {
          errors.country_code = formattedErrors.country_code._errors[0];
        }
        setFormErrors(errors);
        setSnackbar({
          open: true,
          message: "Please fix the form errors",
          severity: "error"
        });
        setLoading(false);
        return;
      }
      const payload = {
        ...form2,
        ...sessionId && { shopify_session_id: sessionId }
      };
      const res = await fetch(url, {
        method,
        body: JSON.stringify(payload),
        credentials: "include",
        headers: getRequestHeaders()
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (Array.isArray(data)) {
          setSnackbar({
            open: true,
            message: Array.isArray(data) ? JSON.stringify(data.join(" | ")) : String(data),
            severity: "error"
          });
        }
        setLoading(false);
        return;
      }
      if (data) {
        setSnackbar({
          open: true,
          message: data.message,
          severity: "success"
        });
      }
      fetchPhones();
      handleCloseModal();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: "error"
      });
    }
    setLoading(false);
  };
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/phone/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getRequestHeaders()
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      fetchPhones();
      setSnackbar({
        open: true,
        message: data.message,
        severity: "success"
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete phone",
        severity: "error"
      });
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchSessionId();
    fetchPhones();
  }, []);
  return /* @__PURE__ */ jsx(Box, { sx: { background: "#f5f6fa", minHeight: "100vh", py: 6 }, children: /* @__PURE__ */ jsxs(Container, { maxWidth: "md", children: [
    /* @__PURE__ */ jsxs(Paper, { elevation: 4, sx: { p: 4, borderRadius: 3 }, children: [
      /* @__PURE__ */ jsxs(
        Box,
        {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          children: [
            /* @__PURE__ */ jsx(Typography, { variant: "h4", color: "primary", fontWeight: 700, children: "Phone Management" }),
            /* @__PURE__ */ jsx(
              Fab,
              {
                color: "primary",
                size: "medium",
                "aria-label": "add",
                onClick: () => handleOpenModal(),
                sx: { boxShadow: 2 },
                children: /* @__PURE__ */ jsx(Add, {})
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(TableContainer, { sx: { maxHeight: 600, overflowY: "auto" }, children: /* @__PURE__ */ jsxs(Table, { stickyHeader: true, children: [
        /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(TableRow, { sx: { backgroundColor: "#e3e6f0" }, children: [
          /* @__PURE__ */ jsx(TableCell, { sx: { fontWeight: 600 }, children: "Phone Number" }),
          /* @__PURE__ */ jsx(TableCell, { sx: { fontWeight: 600 }, children: "Country Code" }),
          /* @__PURE__ */ jsx(TableCell, { align: "right", sx: { fontWeight: 600 }, children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxs(TableBody, { children: [
          phones.map((phone) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: phone.phone_number }),
            /* @__PURE__ */ jsx(TableCell, { children: phone.country_code }),
            /* @__PURE__ */ jsxs(TableCell, { align: "right", children: [
              /* @__PURE__ */ jsx(
                IconButton,
                {
                  color: "primary",
                  onClick: () => handleOpenModal(phone),
                  size: "small",
                  children: /* @__PURE__ */ jsx(Edit, {})
                }
              ),
              /* @__PURE__ */ jsx(
                IconButton,
                {
                  color: "error",
                  onClick: () => handleDelete(phone._id),
                  size: "small",
                  children: /* @__PURE__ */ jsx(Delete, {})
                }
              )
            ] })
          ] }, phone._id)),
          phones.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 3, align: "center", children: /* @__PURE__ */ jsx(Typography, { color: "textSecondary", children: "No phones found." }) }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Dialog, { open: modalOpen, onClose: handleCloseModal, fullWidth: true, children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: editMode ? "Edit Phone" : "Add Phone" }),
      /* @__PURE__ */ jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsx(
          TextField,
          {
            label: "Phone Number",
            value: form2.phone_number,
            type: "number",
            onChange: (e) => {
              handleChange("phone_number", e.target.value.toString());
              if (formErrors.phone_number) {
                setFormErrors((prev) => ({ ...prev, phone_number: "" }));
              }
            },
            error: !!formErrors.phone_number,
            helperText: formErrors.phone_number,
            fullWidth: true,
            margin: "normal",
            required: true
          }
        ),
        /* @__PURE__ */ jsx(
          TextField,
          {
            label: "Country Code",
            value: form2.country_code,
            onChange: (e) => {
              handleChange("country_code", e.target.value);
              if (formErrors.country_code) {
                setFormErrors((prev) => ({ ...prev, country_code: "" }));
              }
            },
            error: !!formErrors.country_code,
            helperText: formErrors.country_code,
            fullWidth: true,
            margin: "normal",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsx(Button, { onClick: handleCloseModal, color: "inherit", children: "Cancel" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleSubmit,
            color: "primary",
            variant: "contained",
            disabled: loading,
            children: editMode ? "Save" : "Add"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Snackbar,
      {
        open: snackbar.open,
        autoHideDuration: snackbar.severity === "error" ? 5e3 : 3e3,
        onClose: () => setSnackbar({ ...snackbar, open: false }),
        children: /* @__PURE__ */ jsx(Alert, { severity: snackbar.severity, sx: { width: "100%" }, children: snackbar.message })
      }
    )
  ] }) });
};
const PhoneViewPage = () => {
  return /* @__PURE__ */ jsx(Phone, {});
};
const app_phone = UNSAFE_withComponentProps(PhoneViewPage);
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: app_phone
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-C0OQBg0x.js", "imports": ["/assets/chunk-WWGJGFF6-C4vau9b-.js", "/assets/index-EI7KE--g.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/root-C_G1byTy.js", "imports": ["/assets/chunk-WWGJGFF6-C4vau9b-.js", "/assets/index-EI7KE--g.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/webhooks.app.scopes_update": { "id": "routes/webhooks.app.scopes_update", "parentId": "root", "path": "webhooks/app/scopes_update", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.scopes_update-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/webhooks.app.uninstalled": { "id": "routes/webhooks.app.uninstalled", "parentId": "root", "path": "webhooks/app/uninstalled", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.uninstalled-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "root", "path": "auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/route-CdfnQ-FY.js", "imports": ["/assets/chunk-WWGJGFF6-C4vau9b-.js", "/assets/AppProxyProvider-NZJz7TGg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/route-D9I204CE.js", "imports": ["/assets/chunk-WWGJGFF6-C4vau9b-.js"], "css": ["/assets/route-CNPfFM0M.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/app-CzHfb-9C.js", "imports": ["/assets/chunk-WWGJGFF6-C4vau9b-.js", "/assets/AppProxyProvider-NZJz7TGg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.additional": { "id": "routes/app.additional", "parentId": "routes/app", "path": "additional", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/app.additional-DrOBUsM7.js", "imports": ["/assets/chunk-WWGJGFF6-C4vau9b-.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/app._index-VfCLUz_K.js", "imports": ["/assets/chunk-WWGJGFF6-C4vau9b-.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/app.phone": { "id": "routes/app.phone", "parentId": "routes/app", "path": "phone", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/app.phone-Be6nG89S.js", "imports": ["/assets/chunk-WWGJGFF6-C4vau9b-.js", "/assets/index-EI7KE--g.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-62b2d55f.js", "version": "62b2d55f", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/webhooks.app.scopes_update": {
    id: "routes/webhooks.app.scopes_update",
    parentId: "root",
    path: "webhooks/app/scopes_update",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/webhooks.app.uninstalled": {
    id: "routes/webhooks.app.uninstalled",
    parentId: "root",
    path: "webhooks/app/uninstalled",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route5
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/app.additional": {
    id: "routes/app.additional",
    parentId: "routes/app",
    path: "additional",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route8
  },
  "routes/app.phone": {
    id: "routes/app.phone",
    parentId: "routes/app",
    path: "phone",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
