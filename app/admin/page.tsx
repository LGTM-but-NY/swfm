"use client"

import { AuthenticatedDashboard } from "@/components/dashboard/authenticated-dashboard"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/providers/auth-provider"
import { redirect } from "next/navigation"

export default function AdminPage() {
  const { role, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>

  if (role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <MainLayout>
      <AuthenticatedDashboard role="admin" />
    </MainLayout>
  )
}
