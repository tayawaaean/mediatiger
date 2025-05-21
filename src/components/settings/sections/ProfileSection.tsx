import React, { useState, useEffect, useRef } from 'react';
import { User, PenSquare, Lock, UserCircle } from 'lucide-react';
import { FormField } from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { SectionTitle } from '../SectionTitle';
import { useLanguage } from "../../../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/routeConstants";
import { useAuth } from "../../../contexts/AuthContext";
import toast from 'react-hot-toast';
import { supabase } from "../../../lib/supabase";
import { useUserProfile } from "../../../hooks/useUserProfile";

interface ProfileSectionProps {
  initialName?: string;
  initialEmail?: string;
  onSaveName?: (name: string) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
                                                                initialName = '',
                                                                initialEmail = '',
                                                                onSaveName
                                                              }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isUpdating, setIsUpdating] = useState(false);
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reuse the existing profileImage and upload handler from useUserProfile hook
  const { uploadingImage, profileImage, handleImageUpload } = useUserProfile(user);

  const safeTranslate = (key: string) => {
    if (!translate) return key;
    const translated = translate(key);
    return translated === key ? key : translated;
  };

  useEffect(() => {
    if (initialName) setName(initialName);
    if (initialEmail) setEmail(initialEmail);
  }, [initialName, initialEmail]);

  const goToChangePassword = () => {
    navigate(ROUTES.CHANGE_PASSWORD);
  };

  // Direct function to open file selector with explicit stopping of propagation
  const openFileSelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (fileInputRef.current && !uploadingImage) {
      fileInputRef.current.click();
    }
  };

  // Modified to use onSaveName prop if provided
  const handleSaveChanges = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (!email.trim()) {
      toast.error('Email cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      if (onSaveName) {
        onSaveName(name.trim());
      } else {
        const { error } = await supabase.auth.updateUser({
          email: email.trim(),
          data: {
            full_name: name.trim()
          }
        });

        if (error) throw error;
      }

      setIsEditing(false);
      toast.success('Profile updated successfully. Please check your email to confirm changes if required.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setName(initialName);
    setEmail(initialEmail);
    setIsEditing(false);
  };

  // Modified version of handleImageUpload that stops propagation
  const handleImageUploadWithStopPropagation = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handleImageUpload(e);
  };

  return (
      <section className="pt-2" onClick={(e) => e.stopPropagation()}>
        <SectionTitle
            icon={<User size={16} />}
            title={safeTranslate('profile')}
        />

        <div className="mt-4 flex gap-4 items-start">
          <div className="flex-shrink-0">
            {/* Avatar with explicit click handler that stops propagation */}
            <div
                className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold relative overflow-hidden border-2 border-indigo-400/30 group cursor-pointer"
                onClick={openFileSelector}
                role="button"
                tabIndex={0}
                aria-label={safeTranslate('updateAvatar') || 'Update avatar'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }
                }}
            >
              {profileImage ? (
                  <img
                      src={profileImage}
                      alt={safeTranslate('profileAlt') || 'Profile'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = name.charAt(0).toUpperCase();
                      }}
                  />
              ) : (
                  name.charAt(0).toUpperCase() || <UserCircle className="h-10 w-10" />
              )}

              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {uploadingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                    <span className="text-white text-xs">{safeTranslate('update') || 'Update'}</span>
                )}
              </div>
            </div>

            {/* Hidden file input with ref */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUploadWithStopPropagation}
                disabled={uploadingImage}
                onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="flex-1 w-full">
            <FormField label={safeTranslate('name')} htmlFor="name">
              {isEditing ? (
                  <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        e.stopPropagation();
                        setName(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      disabled={isUpdating}
                  />
              ) : (
                  <div className="flex items-center justify-between">
                    <div className="py-2.5 px-4 bg-slate-700/30 rounded-lg border border-slate-700 text-slate-200">
                      {name || 'Not set'}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<PenSquare size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                        }}
                        className="ml-3"
                    >
                      {safeTranslate('edit')}
                    </Button>
                  </div>
              )}
            </FormField>

            <FormField label={safeTranslate('email')} htmlFor="email">
              {isEditing ? (
                  <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        e.stopPropagation();
                        setEmail(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      disabled={isUpdating}
                  />
              ) : (
                  <div className="py-2.5 px-4 bg-slate-700/30 rounded-lg border border-slate-700 text-slate-200">
                    {email || 'Not available'}
                  </div>
              )}
            </FormField>

            {isEditing && (
                <div className="flex justify-end gap-3 mt-4">
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isUpdating}
                  >
                    {safeTranslate('cancel')}
                  </Button>
                  <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveChanges}
                      disabled={isUpdating}
                  >
                    {isUpdating ? safeTranslate('saving') || 'Saving...' : safeTranslate('saveChanges')}
                  </Button>
                </div>
            )}

            <div className="mt-6">
              <Button
                  variant="secondary"
                  size="sm"
                  icon={<Lock size={16} />}
                  className="w-full sm:w-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToChangePassword();
                  }}
              >
                {safeTranslate('changePassword')}
              </Button>
            </div>
          </div>
        </div>
      </section>
  );
};