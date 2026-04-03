import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../DashboardLayout';
import ProfileForm from './ProfileForm';
import {
  fetchCompanyProfile,
  getApiErrorMessage,
  updateCompanyProfile,
  type CompanyProfile as CompanyProfileData,
  type CompanyProfilePayload,
} from '../../api/companyDashboardApi';
import { useToast } from '../../hooks/useToast';

const CompanyProfile: React.FC = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCompanyProfile();
      setProfile(data);
    } catch (error) {
      setProfile(null);
      showToast(getApiErrorMessage(error, 'Failed to load company profile'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (payload: CompanyProfilePayload) => {
    try {
      setSaving(true);
      const updated = await updateCompanyProfile(payload);
      setProfile(updated);
      showToast('Company profile updated successfully', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to update company profile'), 'error');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="company">
      <div className="mx-auto max-w-5xl">
        <ProfileForm profile={profile} loading={loading} saving={saving} onSubmit={handleSubmit} />
      </div>
    </DashboardLayout>
  );
};

export default CompanyProfile;
