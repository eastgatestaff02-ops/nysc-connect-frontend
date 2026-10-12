/* ============================================================
   Mock API — single entry point: mockRequest(config)
   Dispatched by the Axios adapter in apiClient.js when
   VITE_MOCK_API=true. Returns the same envelope shape as the
   real backend.
   ============================================================ */

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/* ---------- Seed users ---------- */
const users = [
  {
    _id: "user-admin-1",
    name: "Admin User",
    email: "admin@nysc.test",
    phone: "+2348011111111",
    password: "Password123!",
    role: "ADMIN",
    verification_status: "verified",
  },
  {
    _id: "user-corps-1",
    name: "Chinedu Okafor",
    email: "chinedu@nysc.test",
    phone: "+2348012345678",
    password: "Password123!",
    role: "corps_member",
    verification_status: "verified",
  },
  {
    _id: "user-landlord-1",
    name: "Tunde Balogun",
    email: "landlord@nysc.test",
    phone: "+2348022222222",
    password: "Password123!",
    role: "landlord",
    // change to "verified" to test the submission flow
    verification_status: "pending",
    verification_submitted_at: new Date().toISOString(),
  },
  {
    _id: "user-agent-1",
    name: "Test Agent",
    email: "agent@nysc.test",
    phone: "+2348033333333",
    password: "Password123!",
    role: "agent",
    // change to "pending" or "verified" to test the other states
    verification_status: "unverified",
  },
];

/* ---------- Seed locations ---------- */
const STATES = ["Lagos", "Oyo"];
const LGAS = {
  Lagos: ["Ikeja", "Kosofe"],
  Oyo: ["Ibadan North", "Ibadan South-West"],
};

/* ---------- Seed accommodations ---------- */
const accommodations = [
  {
    _id: "acc_001",
    title: "Self-contain lodge near Ikeja Secretariat",
    description:
      "Clean self-contain with tiled floor, running borehole water, and prepaid meter.",
    price: 320000,
    caution_fee: 30000,
    address: "14 Allen Avenue, Ikeja, Lagos",
    state: "Lagos",
    lga: "Ikeja",
    ppa_proximity: "Approximately 7 minutes by bus to State Secretariat",
    photos: [],
    property_info: ["borehole_water", "prepaid_meter", "fenced_gate"],
    contact_phone: "+2348011223344",
    contact_whatsapp: "+2348011223344",
    source: "Alumni Referral",
    status: "active",
    moderation_status: "approved",
  },
  {
    _id: "acc_002",
    title: "Room and parlor mini flat near Oregun",
    description:
      "Spacious flat with separate living room, balcony, and steady community transformer.",
    price: 450000,
    caution_fee: 50000,
    address: "8 Kudirat Abiola Way, Oregun, Ikeja, Lagos",
    state: "Lagos",
    lga: "Ikeja",
    ppa_proximity: "Approximately 12 minutes to Ikeja PPA clusters",
    photos: [],
    property_info: ["car_park", "borehole_water", "fenced_gate"],
    contact_phone: "+2348044556677",
    contact_whatsapp: "+2348044556677",
    source: "Landlord Submission",
    status: "active",
    moderation_status: "approved",
  },
];

/* ---------- Seed local info ---------- */
const localInfo = [
  {
    id: "li_001",
    state: "Lagos",
    lga: "Ikeja",
    category: "transport",
    title: "Commuting via Ikeja Bus Terminal",
    content:
      "Take official yellow buses (Danfo) or use the Cowry Card for BRT from the terminal.",
  },
  {
    id: "li_002",
    state: "Lagos",
    lga: "Ikeja",
    category: "health",
    title: "Nearest General Hospital",
    content: "Ikeja General Hospital is on Oba Akran Avenue, open 24 hours.",
  },
  {
    id: "li_003",
    state: "Lagos",
    lga: "Ikeja",
    category: "security",
    title: "Ikeja Police Division",
    content: "Ikeja Police Division can be reached on the emergency line 112.",
  },
  {
    id: "li_004",
    state: "Lagos",
    lga: "Ikeja",
    category: "ppa",
    title: "Ministry of Education — Ikeja",
    content:
      "Reporting hours are 8am to 4pm. Bring your call-up letter, ID, and a passport photograph on the first day.",
  },
  {
    id: "li_005",
    state: "Lagos",
    lga: "Ikeja",
    category: "food",
    title: "Ikeja Along Market",
    content:
      "Fresh food is available daily. Local food vendors sell rice and stew for ₦500 to ₦800 per plate.",
  },
  {
    id: "li_006",
    state: "Lagos",
    lga: "Ikeja",
    category: "essential",
    title: "Everyday services around Ikeja",
    content:
      "Pharmacies on Allen Avenue are open late. Banks cluster around the Ikeja City Mall. The BRT terminal is the main transport hub.",
  },
];
/* ---------- Seed submissions ---------- */
const submissions = [
  {
    _id: "sub_001",
    title: "Self-contain lodge near Ikeja Secretariat",
    description: "Clean self-contain with tiled floor and prepaid meter.",
    price: 320000,
    caution_fee: 30000,
    address: "14 Allen Avenue, Ikeja, Lagos",
    state: "Lagos",
    lga: "Ikeja",
    ppa_proximity: "Approximately 7 minutes by bus to State Secretariat",
    contact_phone: "+2348011223344",
    contact_whatsapp: "+2348011223344",
    property_info: ["borehole_water", "prepaid_meter", "fenced_gate"],
    photos: [],
    source: "Landlord Submission",
    submitted_by: "user-landlord-1",
    moderation_status: "pending",
    review_notes: "",
    submitted_at: new Date().toISOString(),
  },
];

/* ---------- Seed verifications ---------- */
const verifications = [
  {
    _id: "ver_001",
    user_id: "user-landlord-1",
    status: "pending",
    documents: [
      { type: "utility_bill", url: "https://example.com/fake-utility.pdf" },
      { type: "proof_of_ownership", url: "https://example.com/fake-deed.pdf" },
    ],
    submitted_at: new Date().toISOString(),
  },
];

/* ---------- Seed reports + saved ---------- */
const reports = [];
const savedItems = [];

/* ---------- Auth token store ---------- */
const tokens = new Map();

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

/* ---------- Auth resolver ---------- */
const resolveAuth = (config) => {
  const auth =
    config.headers?.Authorization || config.headers?.get?.("Authorization");
  const token = typeof auth === "string" ? auth.replace("Bearer ", "") : null;
  const userId = token ? tokens.get(token) : null;
  return userId ? users.find((u) => u._id === userId) : null;
};

/* ============================================================
   Main dispatcher
   ============================================================ */
export async function mockRequest(config) {
  const method = (config.method || "get").toLowerCase();
  const url = (config.url || "").replace(/^\/+/, "");
  const body =
    typeof config.data === "string"
      ? JSON.parse(config.data || "{}")
      : config.data || {};

  await delay();

  /* ---------- POST /auth/register ---------- */
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
      verification_status: "verified",
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

  /* ---------- POST /auth/login ---------- */
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

  /* ---------- GET /auth/me ---------- */
  if (method === "get" && (url === "auth/me" || url === "users/me")) {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    return envelope({ user: publicUser(user) }, "Profile fetched successfully");
  }

  /* ---------- GET /locations/states ---------- */
  if (method === "get" && url === "locations/states") {
    return envelope({ states: STATES }, "States retrieved successfully");
  }

  /* ---------- GET /locations/lgas?state= ---------- */
  if (method === "get" && url.startsWith("locations/lgas")) {
    const query = url.includes("?") ? url.split("?")[1] : "";
    const params = Object.fromEntries(new URLSearchParams(query));
    return envelope(
      { state: params.state, lgas: LGAS[params.state] || [] },
      "LGAs retrieved successfully"
    );
  }

  /* ---------- GET /accommodations ---------- */
  if (method === "get" && url === "accommodations") {
    const query = url.includes("?") ? url.split("?")[1] : "";
    const params = Object.fromEntries(new URLSearchParams(query));
    let list = accommodations.filter(
      (a) => a.status === "active" && a.moderation_status === "approved"
    );
    if (params.state) list = list.filter((a) => a.state === params.state);
    if (params.lga) list = list.filter((a) => a.lga === params.lga);
    if (params.minPrice) list = list.filter((a) => a.price >= Number(params.minPrice));
    if (params.maxPrice) list = list.filter((a) => a.price <= Number(params.maxPrice));
    return envelope(
      {
        total: list.length,
        page: Number(params.page || 1),
        limit: Number(params.limit || 10),
        accommodations: list,
      },
      "Accommodations retrieved successfully"
    );
  }

  /* ---------- GET /accommodations/:id ---------- */
  if (method === "get" && /^accommodations\/[^/]+$/.test(url)) {
    const id = url.split("/").pop();
    const acc = accommodations.find((a) => a._id === id);
    if (!acc) return errorResponse(404, "Accommodation not found");
    return envelope({ accommodation: acc }, "Accommodation retrieved");
  }

  /* ---------- GET /accommodations/mine ---------- */
  if (method === "get" && url === "accommodations/mine") {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    const mine = submissions.filter((s) => s.submitted_by === user._id);
    return envelope({ submissions: mine }, "Your submissions");
  }

  /* ---------- POST /accommodations  (landlord/agent submission) ---------- */
  if (method === "post" && url === "accommodations") {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    if (user.role !== "landlord" && user.role !== "agent") {
      return errorResponse(403, "Only landlords or agents can submit listings");
    }
    if (user.verification_status !== "verified") {
      return errorResponse(
        403,
        "Account must be verified before submitting listings"
      );
    }

    let payload = body;
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      payload = Object.fromEntries(config.data.entries());
      if (payload.price) payload.price = Number(payload.price);
      if (payload.caution_fee) payload.caution_fee = Number(payload.caution_fee);
      if (typeof payload.property_info === "string") {
        try {
          payload.property_info = JSON.parse(payload.property_info);
        } catch {
          payload.property_info = [];
        }
      }
    }

    const submission = {
      _id: `sub_${Date.now()}`,
      title: payload.title,
      description: payload.description || "",
      price: payload.price || 0,
      caution_fee: payload.caution_fee || 0,
      address: payload.address || "",
      state: payload.state || "",
      lga: payload.lga || "",
      ppa_proximity: payload.ppa_proximity || "",
      contact_phone: payload.contact_phone || "",
      contact_whatsapp: payload.contact_whatsapp || "",
      property_info: payload.property_info || [],
      photos: [],
      source: payload.source || "Landlord Submission",
      submitted_by: user._id,
      moderation_status: "pending",
      review_notes: "",
      submitted_at: new Date().toISOString(),
    };

    submissions.push(submission);
    return envelope(
      { accommodation: submission },
      "Listing submitted for review"
    );
  }

  /* ---------- POST /verifications ---------- */
  if (method === "post" && url === "verifications") {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    if (user.role !== "landlord" && user.role !== "agent") {
      return errorResponse(403, "Only landlords or agents can verify");
    }

    let payload = {};
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      payload = Object.fromEntries(config.data.entries());
    } else if (body && typeof body === "object") {
      payload = body;
    }

    const docTypes = Object.keys(payload).filter(
      (k) => payload[k] instanceof File || typeof payload[k] === "string"
    );

    const existing = verifications.find((v) => v.user_id === user._id);
    const now = new Date().toISOString();

    if (existing) {
      existing.status = "pending";
      existing.reason = "";
      existing.documents = docTypes.map((type) => ({
        type,
        url: `https://example.com/mock-${type}`,
      }));
      existing.submitted_at = now;
    } else {
      verifications.push({
        _id: `ver_${Date.now()}`,
        user_id: user._id,
        status: "pending",
        reason: "",
        documents: docTypes.map((type) => ({
          type,
          url: `https://example.com/mock-${type}`,
        })),
        submitted_at: now,
      });
    }

    user.verification_status = "pending";
    user.verification_submitted_at = now;
    delete user.verification_reason;

    return envelope({ ok: true }, "Verification submitted");
  }

  /* ---------- GET /verifications/me ---------- */
  if (method === "get" && url === "verifications/me") {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    const v = verifications.find((x) => x.user_id === user._id) || null;
    return envelope({ verification: v }, "Verification fetched");
  }

  /* ---------- GET /admin/verifications ---------- */
  if (method === "get" && url.startsWith("admin/verifications")) {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    if (user.role !== "ADMIN" && user.role !== "admin") {
      return errorResponse(403, "Admin access required");
    }
    const query = url.includes("?") ? url.split("?")[1] : "";
    const params = Object.fromEntries(new URLSearchParams(query));
    const status = params.status || "pending";
    const list = verifications
      .filter((v) => status === "all" || v.status === status)
      .map((v) => ({
        ...v,
        user: publicUser(users.find((u) => u._id === v.user_id) || {}),
      }));
    return envelope(
      { total: list.length, verifications: list },
      "Verifications fetched"
    );
  }

  /* ---------- PATCH /admin/verifications/:id ---------- */
  if (method === "patch" && url.startsWith("admin/verifications/")) {
    const admin = resolveAuth(config);
    if (!admin) return errorResponse(401, "Not authenticated");
    if (admin.role !== "ADMIN" && admin.role !== "admin") {
      return errorResponse(403, "Admin access required");
    }
    const id = url.split("/").pop();
    const v = verifications.find((x) => x._id === id);
    if (!v) return errorResponse(404, "Verification not found");

    if (!["verified", "rejected"].includes(body.status)) {
      return errorResponse(400, "Invalid verification status");
    }

    v.status = body.status;
    v.reason = body.reason || "";

    const targetUser = users.find((u) => u._id === v.user_id);
    if (targetUser) {
      targetUser.verification_status = body.status;
      if (body.status === "rejected") {
        targetUser.verification_reason = body.reason || "";
      } else {
        delete targetUser.verification_reason;
      }
    }

    return envelope({ verification: v }, `Verification ${body.status}`);
  }

  /* ---------- GET /local-info ---------- */
  if (method === "get" && url.startsWith("local-info")) {
    const query = url.includes("?") ? url.split("?")[1] : "";
    const params = Object.fromEntries(new URLSearchParams(query));
    let list = localInfo;
    if (params.state) list = list.filter((i) => i.state === params.state);
    if (params.lga) list = list.filter((i) => i.lga === params.lga);
    if (params.category) list = list.filter((i) => i.category === params.category);
    return envelope({ guides: list }, "Local info retrieved");
  }

  /* ---------- GET /saved ---------- */
  if (method === "get" && url === "saved") {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    return envelope({ saved_items: savedItems }, "Saved items fetched");
  }

  /* ---------- POST /saved ---------- */
  if (method === "post" && url === "saved") {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    const { accommodation_id } = body;
    const acc = accommodations.find((a) => a._id === accommodation_id);
    if (!acc) return errorResponse(404, "Accommodation not found");
    if (!savedItems.find((s) => s.accommodation._id === accommodation_id)) {
      savedItems.push({
        _id: "saved_" + Date.now(),
        user_id: user._id,
        accommodation: {
          _id: acc._id,
          title: acc.title,
          price: acc.price,
          state: acc.state,
          lga: acc.lga,
        },
      });
    }
    return envelope({ ok: true }, "Saved");
  }

  /* ---------- DELETE /saved/:id ---------- */
  if (method === "delete" && url.startsWith("saved/")) {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    const id = url.split("/").pop();
    const idx = savedItems.findIndex((s) => s._id === id);
    if (idx >= 0) savedItems.splice(idx, 1);
    return envelope({ ok: true }, "Removed from saved");
  }

  /* ---------- POST /reports ---------- */
  if (method === "post" && url === "reports") {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    const report = {
      _id: "rep_" + Date.now(),
      reporter_id: user._id,
      target_type: body.target_type,
      target_id: body.target_id,
      reason: body.reason === "scam" ? "suspicious" : body.reason,
      details: body.details || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };
    reports.push(report);
    return envelope({ report }, "Report submitted");
  }

  /* ---------- GET /admin/reports ---------- */
  if (method === "get" && url.startsWith("admin/reports")) {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    if (user.role !== "ADMIN" && user.role !== "admin") {
      return errorResponse(403, "Admin access required");
    }
    const query = url.includes("?") ? url.split("?")[1] : "";
    const params = Object.fromEntries(new URLSearchParams(query));
    const status = params.status || "pending";
    const list = reports.filter((r) => status === "all" || r.status === status);
    return envelope({ total: list.length, reports: list }, "Reports fetched");
  }

  /* ---------- PATCH /admin/reports/:id ---------- */
  if (method === "patch" && url.startsWith("admin/reports/")) {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    if (user.role !== "ADMIN" && user.role !== "admin") {
      return errorResponse(403, "Admin access required");
    }
    const id = url.split("/").pop();
    const r = reports.find((x) => x._id === id);
    if (!r) return errorResponse(404, "Report not found");
    r.status = body.status;
    r.admin_action = body.admin_action;
    r.admin_notes = body.admin_notes || "";
    if (body.hide_target) {
      const acc = accommodations.find((a) => a._id === r.target_id);
      if (acc) acc.status = "inactive";
    }
    return envelope({ report: r }, "Report moderated");
  }

  /* ---------- GET /admin/listings ---------- */
  if (method === "get" && url.startsWith("admin/listings")) {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    if (user.role !== "ADMIN" && user.role !== "admin") {
      return errorResponse(403, "Admin access required");
    }
    const query = url.includes("?") ? url.split("?")[1] : "";
    const params = Object.fromEntries(new URLSearchParams(query));
    const status = params.status || "pending";
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 20);
    const filtered = submissions.filter(
      (s) => status === "all" || s.moderation_status === status
    );
    const start = (page - 1) * limit;
    const listings = filtered.slice(start, start + limit);
    return envelope(
      { total: filtered.length, page, limit, listings },
      "Listings fetched"
    );
  }

  /* ---------- PATCH /admin/listings/:id ---------- */
  if (method === "patch" && url.startsWith("admin/listings/")) {
    const user = resolveAuth(config);
    if (!user) return errorResponse(401, "Not authenticated");
    if (user.role !== "ADMIN" && user.role !== "admin") {
      return errorResponse(403, "Admin access required");
    }
    const id = url.split("/").pop();
    const item = submissions.find((s) => s._id === id);
    if (!item) return errorResponse(404, "Listing not found");
    const { moderation_status, review_notes } = body;
    if (
      !["approved", "returned", "rejected", "hidden"].includes(moderation_status)
    ) {
      return errorResponse(400, "Invalid moderation_status");
    }
    item.moderation_status = moderation_status;
    item.review_notes = review_notes || "";
    item.reviewed_at = new Date().toISOString();
    item.reviewed_by = user._id;

    if (moderation_status === "approved") {
      accommodations.unshift({
        ...item,
        _id: "acc_" + item._id,
        status: "active",
        moderation_status: "approved",
      });
    }

    return envelope(
      { accommodation: item },
      `Listing ${moderation_status}`
    );
  }

  /* ---------- Fallback ---------- */
  return errorResponse(404, `No mock handler for ${method.toUpperCase()} ${url}`);
}