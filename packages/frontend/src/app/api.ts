const AUTH_TOKEN_KEY = "AUTH_TOKEN";

let authToken;
let onAuthFail;

const setAuthToken = (r?: Response) => {
  authToken = r?.headers.get("x-auth-token"); // signature part
  localStorage.setItem(AUTH_TOKEN_KEY, authToken);
  return r;
};

export const init = (onAuthFail_) => {
  onAuthFail = onAuthFail_;
  authToken = localStorage.getItem(AUTH_TOKEN_KEY);
};

const host = "http://localhost:3002/api/";
let lastMethod = "";

const rawRequest: (
  url: string,
  init?: RequestInit & { auth?: boolean }
) => Promise<any> = (url, init?) => {
  const cache = lastMethod === "GET" ? "default" : "no-cache";
  lastMethod = init?.method || "GET";

  const finalInit: RequestInit = {
    cache,
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "max-age=60",
      ...init?.headers,
    } as Record<string, string>,
  };

  if (init?.auth)
    (finalInit.headers as any).Authorization = `Bearer ${authToken}`;

  return fetch(host + url, finalInit);
};

const check401 = (r) => {
  if (r.status === 401) {
    setAuthToken(undefined);
    onAuthFail();
  }
  return r;
};

const toJson = async (r) => {
  const text = await r.text();
  if (r.ok) return (text && JSON.parse(text)) || undefined;
  throw new Error(`[${r.status}]: ${text || r.statusText}`);
};

const request = (...args: Parameters<typeof rawRequest>) =>
  rawRequest(...args)
    .then(check401)
    .then(toJson);

const api = {
  login: ({ username, password }) =>
    rawRequest("login", {
      method: "post",
      body: JSON.stringify({ username, password }),
    })
      .then(setAuthToken)
      .then(toJson),

  logout: () => setAuthToken(undefined),

  articles: {
    list: ({ page, perPage = 10 }) =>
      request(`posts?page=${page}&perPage=${perPage}`),

    get: (id) => request(`posts/${id}`),

    create: ({ title, body, tags }) =>
      request("posts", {
        method: "post",
        body: JSON.stringify({ title, body, tags }),
        auth: true,
      }),

    edit: ({ id, title, body, tags }) =>
      request(`posts/${id}`, {
        method: "put",
        body: JSON.stringify({ title, body, tags }),
        auth: true,
      }),

    delete: (id) => request(`posts/${id}`, { method: "delete", auth: true }),
  },
};

export default api;
