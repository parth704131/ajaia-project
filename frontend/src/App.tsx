import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
};

export function App() {
  const [apiStatus, setApiStatus] = useState("Connecting…");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/health", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json() as Promise<HealthResponse>;
      })
      .then((data) => setApiStatus(`${data.service}: ${data.status}`))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setApiStatus("Backend unavailable");
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="shell">
      <section className="card">
        <span className="eyebrow">Ajaia</span>
        <h1>Collaborative Docs</h1>
        <p>The React and Express foundation is ready.</p>
        <div className="status" role="status">
          <span className="status-dot" aria-hidden="true" />
          {apiStatus}
        </div>
      </section>
    </main>
  );
}
