import React, { useEffect, useState } from 'react';
import { getMyProfile, updatePassword } from '../../services/clientService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FormInput from '../../components/auth/FormInput'; // Reusing components
import PasswordInput from '../../components/auth/PasswordInput';
import FormButton from '../../components/auth/FormButton';
import { useToast } from '../../context/ToastContext';

const ClientProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getMyProfile();
                if (res.success) setProfile(res.data);
            } catch (err) {
                console.error(err);
                showToast('Failed to load profile', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            showToast('Please fill in both password fields', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            await updatePassword(currentPassword, newPassword);
            showToast('Password updated successfully', 'success');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            showToast(err.message || 'Failed to update password', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;
    if (!profile) return <div>Failed to load profile.</div>;

    const { personalInfo, companyInfo, address, accountInfo } = profile;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

            {/* Vendor Info */}
            <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
                <h2 className="text-lg font-semibold mb-4 border-b border-blue-200 pb-2 text-blue-800">Your Service Provider</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-sm text-blue-600">Business Name</span>
                        <span className="font-medium text-gray-900">{profile.vendorInfo?.businessName}</span>
                    </div>
                    <div>
                        <span className="block text-sm text-blue-600">Contact Person</span>
                        <span className="font-medium text-gray-900">{profile.vendorInfo?.contactName}</span>
                    </div>
                    <div>
                        <span className="block text-sm text-blue-600">Email</span>
                        <span className="font-medium text-gray-900">{profile.vendorInfo?.email}</span>
                    </div>
                    <div>
                        <span className="block text-sm text-blue-600">Phone</span>
                        <span className="font-medium text-gray-900">{profile.vendorInfo?.phone}</span>
                    </div>
                </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Personal Info</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-sm text-gray-500">Full Name</span>
                        <span className="font-medium">{personalInfo.firstName} {personalInfo.lastName}</span>
                    </div>
                    <div>
                        <span className="block text-sm text-gray-500">Email</span>
                        <span className="font-medium">{personalInfo.email}</span>
                    </div>
                    <div>
                        <span className="block text-sm text-gray-500">Phone</span>
                        <span className="font-medium">{personalInfo.phone}</span>
                    </div>
                </div>
            </div>

            {/* Company Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Company Info</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-sm text-gray-500">Company Name</span>
                        <span className="font-medium">{companyInfo.companyName || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="block text-sm text-gray-500">GST Number</span>
                        <span className="font-medium">{companyInfo.gstNumber || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="block text-sm text-gray-500">Address</span>
                        <span className="font-medium">
                            {address.street}, {address.city}, {address.state} - {address.zipCode}
                        </span>
                    </div>
                </div>
            </div>

            {/* Account Status */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Account Status</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-sm text-gray-500">Status</span>
                        <span className={`font-medium capitalize ${accountInfo.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                            {accountInfo.status || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-sm text-gray-500">Risk Level</span>
                        <span className={`font-medium capitalize ${accountInfo.riskLevel === 'high' ? 'text-red-600' : accountInfo.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                            {accountInfo.riskLevel || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="block text-sm text-gray-500">Member Since</span>
                        <span className="font-medium">
                            {accountInfo.createdAt ? new Date(accountInfo.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Security</h2>
                <form onSubmit={handlePasswordUpdate} className="max-w-md">
                    <PasswordInput
                        label="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                    />
                    <PasswordInput
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                    />
                    <div className="mt-4">
                        <FormButton text="Update Password" loading={passwordLoading} type="submit" />
                    </div>
                </form>
            </div>

        </div>
    );
};

export default ClientProfilePage;
