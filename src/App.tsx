import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth';
import { Layout } from './Layout';
import { RequireAuth } from './RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { CatListPage } from './pages/CatListPage';
import { CatDetailPage } from './pages/CatDetailPage';
import { CatEditPage } from './pages/CatEditPage';
import { MapPage } from './pages/MapPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/cats" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/cats"
            element={<RequireAuth><CatListPage /></RequireAuth>}
          />
          <Route
            path="/cats/new"
            element={<RequireAuth><CatEditPage /></RequireAuth>}
          />
          <Route
            path="/cats/:id"
            element={<RequireAuth><CatDetailPage /></RequireAuth>}
          />
          <Route
            path="/cats/:id/edit"
            element={<RequireAuth><CatEditPage /></RequireAuth>}
          />
          <Route
            path="/map"
            element={<RequireAuth><MapPage /></RequireAuth>}
          />
          <Route path="*" element={<Navigate to="/cats" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
