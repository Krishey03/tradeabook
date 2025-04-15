import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers } from '../../store/admin/user-slice/index';
import axios from 'axios';
import { TicketX } from 'lucide-react'; // ⬅️ Import TicketX icon

function AdminUser() {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    const toggleBlock = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${id}/block`, {}, { withCredentials: true });
            dispatch(getUsers());
        } catch (err) {
            console.error("Error toggling block status:", err);
        }
    };

    const filteredUsers = users?.filter(user =>
        user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center mt-10 text-gray-600">Loading users...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">📋 All Users</h2>

            <div className="mb-4 flex justify-center">
                <input
                    type="text"
                    placeholder="Search by username or email"
                    className="w-full max-w-md px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg shadow-md">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4">Username</th>
                            <th className="text-left py-3 px-4">Email</th>
                            <th className="text-left py-3 px-4">Phone</th>
                            <th className="text-left py-3 px-4">Address</th>
                            <th className="text-left py-3 px-4">Role</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user._id} className="border-t hover:bg-gray-50">
                                    <td className="py-2 px-4">{user.userName}</td>
                                    <td className="py-2 px-4">{user.email}</td>
                                    <td className="py-2 px-4">{user.phone}</td>
                                    <td className="py-2 px-4">{user.address}</td>
                                    <td className="py-2 px-4 capitalize">{user.role}</td>
                                    <td className="py-2 px-4">
                                        {user.isBlocked ? (
                                            <span className="flex items-center gap-1 text-red-600 font-semibold">
                                                <TicketX className="w-5 h-5" /> Blocked
                                            </span>
                                        ) : (
                                            <span className="text-green-600 font-semibold">✅ Active</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-4">
                                        <button
                                            onClick={() => toggleBlock(user._id)}
                                            className={`px-3 py-1 rounded-lg font-medium text-white ${
                                                user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                            }`}
                                        >
                                            {user.isBlocked ? 'Unblock' : 'Block'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                    No users available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUser;
