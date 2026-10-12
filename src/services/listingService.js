import apiClient, { unwrap } from "./apiClient";

/* ============================================================
   Media upload — accommodation photos
   ============================================================ */

/**
 * Upload up to 3 photos. Returns an array of { url, publicId }.
 */
export async function uploadAccommodationImages(files) {
  const form = new FormData();
  files.slice(0, 3).forEach((file) => form.append("photos", file));
  const res = await apiClient.post("/media/accommodation-images", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = unwrap(res);
  return data.images ?? [];
}

/* ============================================================
   Listing submission
   ============================================================ */

/**
 * Submit a listing as a verified landlord or agent.
 * `photos` is an array of URLs returned by uploadAccommodationImages.
 * The server sets status: "active" and verification_status: "pending".
 * The listing stays off the public feed until admin approval.
 */
export async function submitListing(payload) {
  const body = {
    title: payload.title,
    description: payload.description,
    price: payload.price,
    state: payload.state,
    lga: payload.lga,
    address: payload.address,
    ppa_proximity: payload.ppa_proximity || "",
    contact_phone: payload.contact_phone,
    contact_whatsapp: payload.contact_whatsapp,
    property_info: payload.property_info || [],
    photos: payload.photos || [],
    source: payload.source || "Landlord Submission",
  };
  const res = await apiClient.post("/accommodations", body);
  return unwrap(res);
}

/** Owner: list own submissions. */
export async function getMySubmissions() {
  const res = await apiClient.get("/accommodations/mine");
  return unwrap(res);
}

/* ============================================================
   Admin listing queue
   ============================================================ */

export async function getPendingListings(status = "pending", page = 1, limit = 20) {
  const res = await apiClient.get("/admin/accommodations", {
    params: { verificationStatus: status, page, limit },
  });
  return unwrap(res);
}

/**
 * Approve or reject a listing.
 * Approve: { verificationStatus: "verified" }
 * Reject:  { verificationStatus: "rejected" }
 */
export async function moderateListing(id, verificationStatus) {
  const res = await apiClient.patch(
    `/admin/accommodations/${id}/verification`,
    { verificationStatus }
  );
  return unwrap(res);
}