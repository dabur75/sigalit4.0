'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';
import { Select } from '~/app/_components/ui/select';

interface MedicalReferralsProps {
  houseId: string;
  selectedDate: Date;
}

export function MedicalReferrals({ houseId, selectedDate }: MedicalReferralsProps) {
  const [patientName, setPatientName] = useState('');
  const [reason, setReason] = useState('');
  const [doctorName, setDoctorName] = useState('ד״ר אורית');

  const { data: referrals, refetch } = api.sigalit.getMedicalReferrals.useQuery({
    houseId,
    date: selectedDate,
  });

  const createReferralMutation = api.sigalit.createMedicalReferral.useMutation({
    onSuccess: () => {
      refetch();
      setPatientName('');
      setReason('');
    },
  });

  const handleCreateReferral = () => {
    if (!patientName.trim() || !reason.trim()) return;

    void createReferralMutation.mutate({
      houseId,
      patientName: patientName.trim(),
      reason: reason.trim(),
      doctorName,
      date: selectedDate,
    });
  };

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">תאריך:</span>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
          >
            יום קודם ←
          </Button>
          <Button
            size="sm"
            className="bg-sigalit-500 hover:bg-sigalit-600 text-white text-xs"
          >
            היום
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
          >
            מחר →
          </Button>
        </div>
      </div>

      {/* Referrals List */}
      {referrals && referrals.length > 0 ? (
        <div className="space-y-3">
          {referrals.map((referral) => (
            <div
              key={referral.id}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {referral.patientName}
                </h4>
                <span className="text-xs text-gray-500">
                  {new Date(referral.date).toLocaleDateString('he-IL')}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {referral.reason}
              </p>
              <div className="text-xs text-gray-500">
                ל: {referral.doctorName}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          אין הפניות לרופא בתאריך זה
        </div>
      )}

      {/* Create New Referral */}
      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Input
          placeholder="שם המטופל"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="text-right"
        />
        <Input
          placeholder="סיבת ההפניה"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="text-right"
        />
        <div className="flex items-center space-x-2 space-x-reverse">
          <Select 
            value={doctorName} 
            onChange={(e) => setDoctorName(e.target.value)}
            options={[
              { value: 'ד״ר אורית', label: 'ד״ר אורית' },
              { value: 'ד״ר דוד', label: 'ד״ר דוד' },
              { value: 'ד״ר שרה', label: 'ד״ר שרה' },
            ]}
            className="flex-1"
          />
          <Button
            onClick={handleCreateReferral}
            disabled={!patientName.trim() || !reason.trim() || createReferralMutation.isPending}
            className="bg-sigalit-500 hover:bg-sigalit-600 text-white"
          >
            הוסף
          </Button>
        </div>
      </div>
    </div>
  );
}
