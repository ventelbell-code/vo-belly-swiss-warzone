export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #020617)",
        color: "white",
        padding: "80px 24px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 48, marginBottom: 20 }}>
          Belly Swiss Warzone
        </h1>

        <p style={{ fontSize: 20, opacity: 0.85, marginBottom: 40 }}>
          Infraestructura institucional de trading automatizado.
          Precisión suiza. Ejecución real. Sin humo.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a
            href="/login"
            style={{
              background: "#22c55e",
              color: "#022c22",
              padding: "14px 28px",
              borderRadius: 10,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Acceder
          </a>

          <a
            href="#"
            style={{
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "14px 28px",
              borderRadius: 10,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Ver documentación
          </a>
        </div>

        <div style={{ marginTop: 80, opacity: 0.5, fontSize: 14 }}>
          © {new Date().getFullYear()} Belly Swiss · Institutional Systems
        </div>
      </div>
    </main>
  )
}
