"use client"

export function UsersTable() {
  const users = [
    { id: 1, name: "Dr. Sarah Johnson", email: "sarah@example.com", role: "Expert", status: "Active" },
    { id: 2, name: "Prof. Michael Chen", email: "michael@example.com", role: "Expert", status: "Active" },
    { id: 3, name: "James Wilson", email: "james@example.com", role: "Guest", status: "Active" },
    { id: 4, name: "Maria Garcia", email: "maria@example.com", role: "Guest", status: "Inactive" },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Role</th>
            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
              <td className="py-3 px-4 text-slate-100">{user.name}</td>
              <td className="py-3 px-4 text-slate-300">{user.email}</td>
              <td className="text-center py-3 px-4">
                <span className="bg-purple-900 text-purple-200 px-2 py-1 rounded text-xs font-medium">{user.role}</span>
              </td>
              <td className="text-center py-3 px-4">
                <span className={user.status === "Active" ? "text-green-400" : "text-slate-400"}>{user.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
