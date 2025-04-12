import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers } from '../../store/admin/user-slice/index'; // Import your getUsers action
import axios from 'axios'; 

function AdminUser() {
    const dispatch = useDispatch();

    // Get users, loading and error state from the Redux store
    const { users, loading, error } = useSelector((state) => state.users);

    useEffect(() => {
        // Dispatch the action to fetch users when the component mounts
        dispatch(getUsers());
    }, [dispatch]);

    const toggleBlock = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${id}/block`, {}, { withCredentials: true });
            dispatch(getUsers()); // Refresh users after block/unblock
        } catch (err) {
            console.error("Error toggling block status:", err);
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>📋 All Users</h2>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.length > 0 ? (
                        users.map(user => (
                            <tr key={user._id}>
                                <td>{user.userName}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.address}</td>
                                <td>{user.role}</td>
                                <td>{user.isBlocked ? "❌ Blocked" : "✅ Active"}</td>
                                <td>
                                    <button onClick={() => toggleBlock(user._id)}>
                                        {user.isBlocked ? "Unblock" : "Block"}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No users available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUser;
