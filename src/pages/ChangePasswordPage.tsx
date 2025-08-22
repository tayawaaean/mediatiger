import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ROUTES } from '../routes/routeConstants';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';

const ChangePasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { translate } = useLanguage();

    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!currentPassword) {
            toast.error(translate('currentPasswordRequired'));
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(translate('passwordsDoNotMatch'));
            return;
        }

        if (newPassword.length < 8) {
            toast.error(translate('passwordMinLength'));
            return;
        }

        setIsLoading(true);

        try {
            // First, verify the current password is correct by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: (await supabase.auth.getUser()).data.user?.email || '',
                password: currentPassword,
            });

            if (signInError) {
                throw new Error(translate('incorrectCurrentPassword'));
            }

            // If sign-in succeeds, proceed with password update
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            // Success
            toast.success(translate('passwordUpdated'));
            setNewPassword('');
            setCurrentPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                navigate(ROUTES.DASHBOARD);
            }, 2000);
        } catch (error: any) {
            toast.error(error.message || translate('updatePasswordFailed'));
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
                    <h1 className="text-xl text-white font-semibold">{translate('changePassword')}</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="max-w-md mx-auto bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-2">
                                    {translate('currentPassword')}
                                </label>
                                <input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder={translate('enterCurrentPassword')}
                                />
                            </div>

                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-2">
                                    {translate('newPassword')}
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder={translate('enterNewPassword')}
                                />
                                <p className="mt-1 text-xs text-slate-400">
                                    {translate('passwordRequirement')}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                                    {translate('confirmNewPassword')}
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder={translate('confirmYourNewPassword')}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.DASHBOARD)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors mr-3"
                                >
                                    {translate('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? translate('updating') : translate('changePassword')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChangePasswordPage;