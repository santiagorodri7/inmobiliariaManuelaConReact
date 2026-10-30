import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import { PageLoader } from "./components/ui/Spinner.jsx";
import PublicLayout from "./components/layout/PublicLayout.jsx";
import { ProtectedRoute, PublicOnlyRoute } from "./routes/ProtectedRoute.jsx";
import { ROLES } from "./utils/roles.js";

const HomePage = lazy(() => import("./pages/public/HomePage.jsx"));
const AboutPage = lazy(() => import("./pages/public/AboutPage.jsx"));
const ServicesPage = lazy(() => import("./pages/public/ServicesPage.jsx"));
const ContactPage = lazy(() => import("./pages/public/ContactPage.jsx"));
const PropertyDetailPage = lazy(
  () => import("./pages/public/PropertyDetailPage.jsx"),
);
const NotFoundPage = lazy(() => import("./pages/public/NotFoundPage.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.jsx"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage.jsx"),
);
const AccountPage = lazy(() => import("./pages/account/AccountPage.jsx"));
const BuyerDashboard = lazy(
  () => import("./pages/dashboard/BuyerDashboard.jsx"),
);
const SellerDashboard = lazy(
  () => import("./pages/dashboard/SellerDashboard.jsx"),
);
const AdminDashboard = lazy(
  () => import("./pages/dashboard/AdminDashboard.jsx"),
);
const SalesReportPage = lazy(
  () => import("./pages/dashboard/SalesReportPage.jsx"),
);

function LegacyPropertyRedirect() {
  const [searchParams] = useSearchParams();
  const id =
    searchParams.get("id") ||
    searchParams.get("propiedad") ||
    searchParams.get("property");
  return <Navigate to={id ? `/propiedad/${encodeURIComponent(id)}` : "/"} replace />;
}

function RoutedFallback() {
  return <PageLoader message="Cargando tu espacio…" />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<RoutedFallback />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/nosotros" element={<AboutPage />} />
                  <Route path="/servicios" element={<ServicesPage />} />
                  <Route path="/contacto" element={<ContactPage />} />
                  <Route path="/propiedad/:id" element={<PropertyDetailPage />} />
                  <Route
                    path="/propiedades"
                    element={<Navigate to="/#propiedades" replace />}
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/registro"
                  element={
                    <PublicOnlyRoute>
                      <RegisterPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/recuperar-contrasena"
                  element={
                    <PublicOnlyRoute>
                      <ForgotPasswordPage />
                    </PublicOnlyRoute>
                  }
                />

                <Route
                  path="/cuenta"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/comprador"
                  element={
                    <ProtectedRoute roles={[ROLES.BUYER]}>
                      <BuyerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendedor"
                  element={
                    <ProtectedRoute roles={[ROLES.SELLER]}>
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={[ROLES.ADMIN]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reportes-ventas"
                  element={
                    <ProtectedRoute roles={[ROLES.ADMIN]}>
                      <SalesReportPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/index.html" element={<Navigate to="/" replace />} />
                <Route path="/home.html" element={<Navigate to="/" replace />} />
                <Route path="/welcome.html" element={<Navigate to="/" replace />} />
                <Route path="/about.html" element={<Navigate to="/nosotros" replace />} />
                <Route path="/nosotros.html" element={<Navigate to="/nosotros" replace />} />
                <Route path="/service.html" element={<Navigate to="/servicios" replace />} />
                <Route path="/servicios.html" element={<Navigate to="/servicios" replace />} />
                <Route path="/contact.html" element={<Navigate to="/contacto" replace />} />
                <Route path="/contacto.html" element={<Navigate to="/contacto" replace />} />
                <Route
                  path="/property-details.html"
                  element={<LegacyPropertyRedirect />}
                />
                <Route path="/login.html" element={<Navigate to="/registro" replace />} />
                <Route path="/profiles.html" element={<Navigate to="/login" replace />} />
                <Route path="/buyer.html" element={<Navigate to="/comprador" replace />} />
                <Route path="/seller.html" element={<Navigate to="/vendedor" replace />} />
                <Route path="/vandedorr.html" element={<Navigate to="/vendedor" replace />} />
                <Route path="/admin.html" element={<Navigate to="/admin" replace />} />
                <Route
                  path="/reporteVentas.html"
                  element={<Navigate to="/admin/reportes-ventas" replace />}
                />
                <Route path="/setup.html" element={<Navigate to="/login" replace />} />
                <Route path="/blog.html" element={<Navigate to="/servicios" replace />} />
                <Route path="/guide.html" element={<Navigate to="/servicios" replace />} />
                <Route path="/single.html" element={<Navigate to="/#propiedades" replace />} />
                <Route
                  path="/testimonial.html"
                  element={<Navigate to="/servicios#testimonios" replace />}
                />
              </Routes>
            </Suspense>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
