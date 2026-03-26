import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SearchPage } from "@/pages/SearchPage";
import { CallDetailPage } from "@/pages/CallDetailPage";
import { SqlPage } from "@/pages/SqlPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/call/:callId" element={<CallDetailPage />} />
        <Route path="/sql" element={<SqlPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
