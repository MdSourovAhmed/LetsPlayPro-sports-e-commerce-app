import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { FullPageSpinner } from '@/components/common/Spinner';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';

// Route-level code splitting — each page is its own chunk
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const UnauthorizedPage = lazy(() => import('@/pages/auth/UnauthorizedPage'));
const DashboardHomePage = lazy(() => import('@/pages/dashboard/DashboardHomePage'));

const ProductsListPage = lazy(() => import('@/pages/products/ProductsListPage'));
const ProductFormPage = lazy(() => import('@/pages/products/ProductFormPage'));
const OrdersListPage = lazy(() => import('@/pages/orders/OrdersListPage'));
const OrderDetailPage = lazy(() => import('@/pages/orders/OrderDetailPage'));
const UsersListPage = lazy(() => import('@/pages/users/UsersListPage'));
const UserDetailPage = lazy(() => import('@/pages/users/UserDetailPage'));
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

function withSuspense(Component) {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: withSuspense(LoginPage) },
      { path: '/register', element: withSuspense(RegisterPage) },
      { path: '/forgot-password', element: withSuspense(ForgotPasswordPage) },
      { path: '/reset-password', element: withSuspense(ResetPasswordPage) },
    ],
  },
  { path: '/unauthorized', element: withSuspense(UnauthorizedPage) },
  {
    element: <ProtectedRoute minimumRole="staff" />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: withSuspense(DashboardHomePage) },

          { path: '/products', element: withSuspense(ProductsListPage) },
          { path: '/products/new', element: withSuspense(ProductFormPage) },
          { path: '/products/:id/edit', element: withSuspense(ProductFormPage) },

          { path: '/orders', element: withSuspense(OrdersListPage) },
          { path: '/orders/:id', element: withSuspense(OrderDetailPage) },

          { path: '/users', element: withSuspense(UsersListPage) },
          { path: '/users/:id', element: withSuspense(UserDetailPage) },

          { path: '/analytics', element: withSuspense(AnalyticsPage) },
          { path: '/settings', element: withSuspense(SettingsPage) },
        ],
      },
    ],
  },
  { path: '*', element: <PlaceholderPage title="Page not found" /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
