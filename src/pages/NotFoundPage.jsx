import { Link, useLocation } from "react-router-dom";

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 12 }}>🔍</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        Page not found
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>
        We couldn't find <code>{pathname}</code>.
      </p>
      <Link
        to="/"
        style={{
          background: "#059669",
          color: "white",
          padding: "12px 20px",
          borderRadius: 10,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}