import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ROUTES } from '../routes/routeConstants';
import toast from 'react-hot-toast';

const UpdateNamePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [newName, setNewName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        // Initialize name from user context
        if (user?.user_metadata?.full_name) {
            setNewName(user.user_metadata.full_name);
        }
    }, [user]);

    const handleNameChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newName.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        setIsLoading(true);

        try {
            // Updating user metadata via Supabase
            const { error } = await supabase.auth.updateUser({
                data: { full_name: newName.trim() }
            });

            if (error) throw error;

            // Success
            toast.success('Name updated successfully');
            setTimeout(() => {
                navigate(ROUTES.DASHBOARD);
            }, 2000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update name');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="bg-slate-900 p-4 border-b border-slate-700">
                <div className="container mx-auto flex items-center">
                    <button
                        onClick={() => navigate(ROUTES.DASHBOARD)}
                        className="text-slate-400 hover:text-white mr-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl text-white font-semibold">Update Profile Name</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="max-w-md mx-auto bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleNameChange} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.DASHBOARD)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors mr-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UpdateNamePage;