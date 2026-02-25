export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top, #0f172a 0%, #020617 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      textAlign: "center",
      padding: "40px"
    }}>

      <h1 style={{
        fontSize: "72px",
        fontWeight: "700",
        letterSpacing: "2px",
        background: "linear-gradient(90deg, #d1d5db, #ffffff, #9ca3af)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textShadow: "0px 0px 30px rgba(255,255,255,0.15)"
      }}>
        BellySwiss Warzone
      </h1>

      <h2 style={{
        fontSize: "36px",
        marginTop: "10px",
        fontWeight: "500",
        color: "#e5e7eb"
      }}>
        Trading Algorítmico de Nivel Institucional
      </h2>

      <p style={{
        marginTop: "20px",
        maxWidth: "700px",
        fontSize: "18px",
        color: "#94a3b8",
        lineHeight: "1.6"
      }}>
        Tecnología avanzada de trading automatizado en tiempo real.
        Máxima eficiencia de inversión con algoritmos precisos.
      </p>

      <a href="/login">
        <button style={{
          marginTop: "40px",
          padding: "16px 40px",
          fontSize: "18px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(90deg, #1e40af, #2563eb)",
          color: "white",
          boxShadow: "0px 10px 30px rgba(37,99,235,0.4)",
          transition: "0.3s"
        }}>
          Acceder a la Zona
        </button>
      </a>

    </div>
  );
}
