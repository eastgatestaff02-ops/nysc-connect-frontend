import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import VerificationGate from "./features/VerificationGate";
import { submitListing } from "../services/listingService";

const PROPERTY_OPTIONS = [
  "borehole_water",
  "prepaid_meter",
  "fenced_gate",
  "car_park",
  "security",
  "furnished",
];

export default function ListingSubmissionForm() {
  const { user } = useAuth();
  const verificationStatus = user?.verification_status || "unverified";

  if (verificationStatus !== "verified") {
    return (
      <VerificationGate
        status={verificationStatus}
        reason={user?.verification_reason}
      />
    );
  }

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    caution_fee: 0,
    address: "",
    state: "",
    lga: "",
    ppa_proximity: "",
    contact_phone: "",
    contact_whatsapp: "",
    property_info: [],
    source: "Landlord Submission",
    photos: [],
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title required";
    if (form.price <= 0) e.price = "Price must be greater than 0";
    if (form.caution_fee < 0) e.caution_fee = "Caution fee cannot be negative";
    if (!form.state) e.state = "State required";
    if (!form.lga) e.lga = "LGA required";
    if (!form.address.trim()) e.address = "Address required";
    if (!/^0[789][01]\d{8}$/.test(form.contact_phone.replace(/\s/g, "")))
      e.contact_phone = "Valid Nigerian phone required";
    if ((form.photos?.length ?? 0) > 3) e.photos = "Max 3 photos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitListing(form);
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="verification-gate">
        <div className="vg-icon">✅</div>
        <h3>Submission received</h3>
        <p>
          Your listing is now <strong>Pending Review</strong>. An admin will
          approve, return, or reject it. Nothing publishes automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="submission-form">
      <div
        className="info-banner"
        style={{ background: "#fffbeb", borderColor: "#fef3c7", color: "#78350f" }}
      >
        <div>
          <strong>SUBMISSION — NOT A LIVE LISTING</strong>
          <div style={{ fontSize: 12, marginTop: 2 }}>
            Admin approval is required before this appears to Corps Members.
          </div>
        </div>
      </div>

      <div className="field">
        <label>Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        {errors.title && <div className="field-error">{errors.title}</div>}
      </div>

      <div className="field">
        <label>Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="form-row">
        <div className="field">
          <label>Annual rent (₦)</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
          {errors.price && <div className="field-error">{errors.price}</div>}
        </div>
        <div className="field">
          <label>Caution fee (₦)</label>
          <input
            type="number"
            value={form.caution_fee}
            onChange={(e) =>
              setForm({ ...form, caution_fee: Number(e.target.value) })
            }
          />
          {errors.caution_fee && (
            <div className="field-error">{errors.caution_fee}</div>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>State</label>
          <input
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          {errors.state && <div className="field-error">{errors.state}</div>}
        </div>
        <div className="field">
          <label>LGA</label>
          <input
            value={form.lga}
            onChange={(e) => setForm({ ...form, lga: e.target.value })}
          />
          {errors.lga && <div className="field-error">{errors.lga}</div>}
        </div>
      </div>

      <div className="field">
        <label>Address</label>
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        {errors.address && <div className="field-error">{errors.address}</div>}
      </div>

      <div className="field">
        <label>PPA proximity (text — not calculated)</label>
        <input
          placeholder="e.g. Approximately 7 minutes by bus to State Secretariat"
          value={form.ppa_proximity}
          onChange={(e) => setForm({ ...form, ppa_proximity: e.target.value })}
        />
      </div>

      <div className="field">
        <label>Property info</label>
        <div className="chip-row">
          {PROPERTY_OPTIONS.map((opt) => {
            const active = form.property_info.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                className={`chip ${active ? "chip-active" : ""}`}
                onClick={() =>
                  setForm({
                    ...form,
                    property_info: active
                      ? form.property_info.filter((x) => x !== opt)
                      : [...form.property_info, opt],
                  })
                }
              >
                {opt.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>Contact phone</label>
          <input
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
          />
          {errors.contact_phone && (
            <div className="field-error">{errors.contact_phone}</div>
          )}
        </div>
        <div className="field">
          <label>Contact WhatsApp</label>
          <input
            value={form.contact_whatsapp}
            onChange={(e) =>
              setForm({ ...form, contact_whatsapp: e.target.value })
            }
          />
        </div>
      </div>

      <div className="field">
        <label>Photos (max 3)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []).slice(0, 3);
            setForm({ ...form, photos: files });
          }}
        />
        {errors.photos && <div className="field-error">{errors.photos}</div>}
      </div>

      {errors.submit && <div className="field-error">{errors.submit}</div>}

      <button
        className="btn btn-primary btn-block"
        disabled={submitting}
        onClick={handleSubmit}
      >
        {submitting ? "Submitting…" : "Submit for Review"}
      </button>
    </div>
  );
}