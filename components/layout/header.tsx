"use client"

import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  role: "guest" | "expert" | "admin"
}

export function Header({ title, role }: HeaderProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-slate-700">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-slate-700">
            <User className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-slate-700" />
          <span className="text-sm text-slate-400">Demo Session</span>
        </div>
      </div>
    </header>
  )
}
