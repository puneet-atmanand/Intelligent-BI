import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/app/layout/AppShell";
import { HomePage } from "@/features/home/HomePage";
import { DashboardsPage } from "@/features/dashboards/DashboardsPage";
import { ChartsPage } from "@/features/charts/ChartsPage";
import { DatasetsPage } from "@/features/datasets/DatasetsPage";
import { SqlLabPage } from "@/features/sqllab/SqlLabPage";
import { DatabasesPage } from "@/features/databases/DatabasesPage";
import { UploadsPage } from "@/features/uploads/UploadsPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { AdminPage } from "@/features/admin/AdminPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "dashboards",
        element: <DashboardsPage />,
      },
      {
        path: "charts",
        element: <ChartsPage />,
      },
      {
        path: "datasets",
        element: <DatasetsPage />,
      },
      {
        path: "sqllab",
        element: <SqlLabPage />,
      },
      {
        path: "databases",
        element: <DatabasesPage />,
      },
      {
        path: "uploads",
        element: <UploadsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "admin",
        element: <AdminPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

