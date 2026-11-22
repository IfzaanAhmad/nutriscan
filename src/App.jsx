import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import SavedPage from './pages/SavedPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import LimitsPage from './pages/LimitsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';


export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/product/:code" element={<ProductDetailPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/limits" element={<LimitsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
