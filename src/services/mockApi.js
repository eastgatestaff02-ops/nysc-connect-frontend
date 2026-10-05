// Simulated latency so loading states are visible
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// In-memory "database" for registered users
const users = [
  {
    _id: "user-admin-1",
    name: "Admin User",
    email: "admin@nysc.test",
    phone: "+2348011111111",
    password: "Password123!",
    role: "ADMIN",
  },
  {
    _id: "user-corps-1",
    name: "Chinedu Okafor",
    email: "chinedu@nysc.test",
    phone: "+2348012345678",
    password: "Password123!",
    role: "corps_member",
  },
];

const tokens = new Map(); // token -> userId

const makeToken = (userId) => `mock.${userId}.${Date.now()}`;

const publicUser = ({ password, ...rest }) => rest;

const envelope = (data, message = "OK") => ({
  status: "success",
  message,
  data,
});

const errorResponse = (status, message) => {
  const err = new Error(message);
  err.response = { status, data: { status: "error", message } };
  return Promise.reject(err);
};

export async function mockRequest(config) {
  const method = (config.method || "get").toLowerCase();
  const url = (config.url || "").replace(/^\/+/, "");
  const body =
    typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};

  await delay(); // simulate network

  // ─── POST /auth/register ───────────────────────────────
  if (method === "post" && url === "auth/register") {
    const { name, email, phone, password } = body;
    if (!name || !email || !phone || !password) {
      return errorResponse(400, "All fields are required");
    }
    if (users.some((u) => u.email === email)) {
      return errorResponse(409, "Email already registered");
    }
    const user = {
      _id: `user-${Date.now()}`,
      name,
      email,
      phone,
      password,
      role: "corps_member",
      created_at: new Date().toISOString(),
    };
    users.push(user);
    const token = makeToken(user._id);
    tokens.set(token, user._id);
    return envelope(
      { user: publicUser(user), token },
      "User registered successfully"
    );
  }

  // ─── POST /auth/login ──────────────────────────────────
  if (method === "post" && url === "auth/login") {
    const { email, password } = body;
    const user = users.find((u) => u.email === email);
    if (!user || user.password !== password) {
      return errorResponse(401, "Invalid email or password");
    }
    const token = makeToken(user._id);
    tokens.set(token, user._id);
    return envelope({ user: publicUser(user), token }, "Login successful");
  }

  // ─── GET /auth/me ──────────────────────────────────────
  if (method === "get" && (url === "auth/me" || url === "users/me")) {
    const auth = config.headers?.Authorization || config.headers?.get?.("Authorization");
    const token = typeof auth === "string" ? auth.replace("Bearer ", "") : null;
    const userId = token ? tokens.get(token) : null;
    const user = userId ? users.find((u) => u._id === userId) : null;
    if (!user) return errorResponse(401, "Not authenticated");
    return envelope({ user: publicUser(user) }, "Profile fetched successfully");
  }

  // ─── Fallback for everything else ──────────────────────
  return errorResponse(404, `No mock handler for ${method.toUpperCase()} ${url}`);
}