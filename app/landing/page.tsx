export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, #1f2937 0%, #0b1120 40%, #05070f 100%)",
        color: "white",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* LOGO SUPERIOR IZQUIERDO */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 50,
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: 3
        }}
      >
        <span style={{ color: "#ef4444" }}>BELLY</span>
        <span style={{ color: "#e5e7eb" }}> WARZONE</span>
      </div>

      {/* CONTENIDO CENTRAL */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px"
        }}
      >
        {/* TITULO METALICO GRANDE */}
        <h1
          style={{
            fontSize: "100px",
            fontWeight: 900,
            background:
              "linear-gradient(90deg,#9ca3af,#f9fafb,#9ca3af,#6b7280)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 4,
            margin: 0
          }}
        >
          Warzone
        </h1>

        {/* SUBTITULO */}
        <h2
          style={{
            fontSize: "40px",
            fontWeight: 600,
            marginTop: 10,
            marginBottom: 30,
            color: "#d1d5db"
          }}
        >
          Trading Algorítmico Institucional
        </h2>

        {/* TEXTO PERSUASIVO PROFESIONAL */}
        <p
          style={{
            maxWidth: 750,
            fontSize: 20,
            lineHeight: 1.7,
            opacity: 0.85,
            marginBottom: 60
          }}
        >
          Infraestructura algorítmica diseñada bajo estándares de ejecución
          institucional. Optimización de capital, precisión matemática y
          arquitectura construida para rendimiento constante. No es una
          plataforma pública. Es un entorno privado desarrollado para quienes
          operan con visión profesional.
        </p>

        {/* BOTON INSTITUCIONAL */}
        <a
          href="/login"
          style={{
            padding: "20px 50px",
            fontSize: 18,
            fontWeight: 600,
            borderRadius: 14,
            background:
              "linear-gradient(90deg,#1e3a8a,#2563eb,#1e3a8a)",
            color: "white",
            textDecoration: "none",
            boxShadow: "0 15px 40px rgba(37,99,235,0.35)",
            transition: "all 0.3s ease"
          }}
        >
          Acceder a la zona
        </a>
      </div>
    </main>
  );
}
