import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import Cookies from 'js-cookie';
import { Edit, Phone, MapPin, User, Lock } from 'lucide-react';

function ShoppingAccount() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        userName: '',
        email: '',
        phone: '',
        address: '',
    });
    const [editMode, setEditMode] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = Cookies.get('token');
            const response = await api.get('http://localhost:5000/api/auth/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
            setMessage({ text: 'Failed to fetch profile', type: 'error' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate passwords if changing
        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            return;
        }

        try {
            const token = Cookies.get('token');
            const updateData = {
                ...user,
                currentPassword: currentPassword || undefined,
                newPassword: newPassword || undefined
            };

            const response = await api.put(
                'http://localhost:5000/api/auth/profile',
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setMessage({ text: 'Profile updated successfully!', type: 'success' });
                setEditMode(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                fetchUserProfile(); // Refresh data
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update profile';
            setMessage({ text: errorMsg, type: 'error' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">My Account</h1>

            {message.text && (
                <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {!editMode ? (
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <User size={20} />
                        <div>
                            <label className="block text-gray-700 font-medium">Username</label>
                            <p className="mt-1 p-2 bg-gray-50 rounded">{user.userName}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Edit size={20} />
                        <div>
                            <label className="block text-gray-700 font-medium">Email</label>
                            <p className="mt-1 p-2 bg-gray-50 rounded">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Phone size={20} />
                        <div>
                            <label className="block text-gray-700 font-medium">Phone</label>
                            <p className="mt-1 p-2 bg-gray-50 rounded">{user.phone}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <MapPin size={20} />
                        <div>
                            <label className="block text-gray-700 font-medium">Address</label>
                            <p className="mt-1 p-2 bg-gray-50 rounded">{user.address}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setEditMode(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Edit Profile
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <User size={20} />
                        <div>
                            <label htmlFor="userName" className="block text-gray-700 font-medium">
                                Username
                            </label>
                            <input
                                type="text"
                                id="userName"
                                name="userName"
                                value={user.userName}
                                onChange={handleInputChange}
                                className="mt-1 p-2 w-full border rounded bg-white text-black"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Edit size={20} />
                        <div>
                            <label className="block text-gray-700 font-medium">Email</label>
                            <p className="mt-1 p-2 bg-gray-50 rounded">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Phone size={20} />
                        <div>
                            <label htmlFor="phone" className="block text-gray-700 font-medium">
                                Phone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={user.phone}
                                onChange={handleInputChange}
                                className="mt-1 p-2 w-full border rounded bg-white text-black"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <MapPin size={20} />
                        <div>
                            <label htmlFor="address" className="block text-gray-700 font-medium">
                                Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={user.address}
                                onChange={handleInputChange}
                                className="mt-1 p-2 w-full border rounded bg-white text-black"
                                rows="3"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setEditMode(false);
                                setMessage({ text: '', type: '' });
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default ShoppingAccount;
