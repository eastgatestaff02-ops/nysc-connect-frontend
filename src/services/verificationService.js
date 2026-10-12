import apiClient, { unwrap } from "./apiClient";

/* ============================================================
   Landlord/Agent account verification
   ============================================================ */

/**
 * Step 1 — upload each document as an image.
 * Returns { url, publicId } for the uploaded file.
 */
export async function uploadVerificationDocument(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post("/media/verification-documents", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = unwrap(res);
  return data.file ?? data.image ?? data; // shape per backend response
}

/**
 * Step 2 — submit the packet with the URLs from step 1.
 * Agent payload:
 *   id_type, id_document_url, authority_type, authority_document_url,
 *   zero_upfront_fee_agreed
 * Landlord payload:
 *   id_type, id_document_url, prepaid_meter_number (or utility bill equivalent)
 */
export async function submitVerification(payload) {
  const res = await apiClient.post("/users/me/verification", payload);
  return unwrap(res);
}

/** Read the current user's verification packet. */
export async function getMyVerification() {
  const res = await apiClient.get("/users/me/verification");
  return unwrap(res);
}

/* ============================================================
   Admin account verification queue
   ============================================================ */

export async function getPendingVerifications(status = "pending", page = 1, limit = 20) {
  const res = await apiClient.get("/admin/account-verifications", {
    params: { status, page, limit },
  });
  return unwrap(res);
}

/**
 * Approve or reject an account.
 * Approve: { status: "verified" }
 * Reject:  { status: "rejected", rejection_reason: "..." }
 */
export async function moderateVerification(userId, payload) {
  const res = await apiClient.patch(
    `/admin/account-verifications/${userId}`,
    payload
  );
  return unwrap(res);
}