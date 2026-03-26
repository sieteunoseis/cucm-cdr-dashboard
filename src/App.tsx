import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold">CDR Dashboard</h1>
      </header>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<p>Search page coming soon</p>} />
          <Route
            path="/call/:callId"
            element={<p>Call detail coming soon</p>}
          />
          <Route path="/sql" element={<p>SQL page coming soon</p>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
