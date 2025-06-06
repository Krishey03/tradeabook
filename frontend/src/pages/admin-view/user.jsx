import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getUsers } from "../../store/admin/user-slice/index"
import api from "@/api/axios"
import { TicketX, CheckCircle, Search, RefreshCw, UserCog, Users } from "lucide-react"

function AdminUser() {
  const dispatch = useDispatch()
  const { users, loading, error } = useSelector((state) => state.users)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])

  const toggleBlock = async (id) => {
    try {
      await api.put(`/admin/users/${id}/block`, {}, { withCredentials: true })
      dispatch(getUsers())
    } catch (err) {
      console.error("Error toggling block status:", err)
    }
  }

  const refreshData = () => {
    dispatch(getUsers())
  }

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || user.role === filterRole

    return matchesSearch && matchesRole
  })

  const userCount = filteredUsers?.length || 0
  const blockedCount = filteredUsers?.filter((user) => user.isBlocked)?.length || 0
  const activeCount = userCount - blockedCount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-100 text-rose-700 rounded-lg max-w-2xl mx-auto">
        <p>{error}</p>
        <button
          onClick={refreshData}
          className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 flex items-center gap-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="flex items-center justify-center mb-6">
        <Users className="h-6 w-6 text-slate-700 mr-2" />
        <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800">User Management</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
        {/* Header with stats and search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="font-semibold text-slate-700 flex items-center gap-1">
                <UserCog className="h-4 w-4" /> User Administration
              </h2>
              <p className="text-sm text-slate-500">Manage user accounts and permissions</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-700">
                Total: <span className="font-semibold">{userCount}</span>
              </div>
              <div className="px-3 py-1 bg-emerald-100 rounded-full text-xs text-emerald-700">
                Active: <span className="font-semibold">{activeCount}</span>
              </div>
              <div className="px-3 py-1 bg-rose-100 rounded-full text-xs text-rose-700">
                Blocked: <span className="font-semibold">{blockedCount}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by username or email"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={refreshData}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 flex items-center gap-1 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Username</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-800">{user.userName}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{user.phone || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-slate-800 max-w-[180px] truncate">{user.address || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          user.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isBlocked ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                          <TicketX className="w-4 h-4" /> Blocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle className="w-4 h-4" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleBlock(user._id)}
                        className={`px-3 py-1 rounded-md text-xs font-medium text-white transition-colors ${
                          user.isBlocked ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    {searchTerm ? "No users match your search criteria" : "No users available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUser
