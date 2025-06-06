import { useEffect, useState } from "react"
import api from "@/api/axios"
import { Loader2, Trash2, RefreshCw } from "lucide-react"

function AdminOrders() {
  const [exchanges, setExchanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredExchanges = exchanges.filter(
    (exchange) =>
      exchange.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exchange.exchangeOffer?.eTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exchange.exchangeOffer?.eAuthor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exchange.productId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exchange.productId?.author?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const response = await api.get("/admin/exchanges")
        setExchanges(response.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load exchanges")
      } finally {
        setLoading(false)
      }
    }
    fetchExchanges()
  }, [])

  const handleDelete = async (exchangeId) => {
    try {
      await api.delete(`/admin/exchanges/${exchangeId}`)
      setExchanges(exchanges.filter((exchange) => exchange._id !== exchangeId))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete exchange")
    }
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      const response = await api.get("/admin/exchanges")
      setExchanges(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load exchanges")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
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
      <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 mb-6">Manage Book Exchanges</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
        {/* Header with actions */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-semibold text-slate-700">All Exchanges</h2>
            <p className="text-sm text-slate-500">
              {searchTerm ? `${filteredExchanges.length} results found` : `${exchanges.length} exchanges found`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by email, book title, or author"
                className="w-full pl-10 pr-4 py-1.5 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={refreshData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-sm flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Responsive table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Offerer Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Offered Book</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Listed Book</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Offer Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Payment Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date Offered</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Payment Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredExchanges.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                    {searchTerm ? "No exchanges match your search criteria" : "No exchanges found."}
                  </td>
                </tr>
              ) : (
                filteredExchanges.map((exchange) => (
                  <tr key={exchange._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-800">{exchange.userEmail}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-[180px]">
                        <p className="font-medium text-sm text-slate-800 truncate">
                          {exchange.exchangeOffer?.eTitle || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">by {exchange.exchangeOffer?.eAuthor || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[180px]">
                        <p className="font-medium text-sm text-slate-800 truncate">
                          {exchange.productId?.title || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">by {exchange.productId?.author || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                          exchange.offerStatus === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : exchange.offerStatus === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {exchange.offerStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                          exchange.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : exchange.paymentStatus === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {exchange.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {exchange.dateOffered
                        ? new Date(exchange.dateOffered).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {exchange.paymentDate
                        ? new Date(exchange.paymentDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(exchange._id)}
                        className="text-rose-500 bg-white hover:text-rose-700 transition p-1 rounded-full hover:bg-rose-50"
                        title="Delete Exchange"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminOrders
