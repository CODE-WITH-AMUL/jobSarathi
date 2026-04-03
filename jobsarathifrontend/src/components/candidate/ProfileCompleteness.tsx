// components/candidate/ProfileCompleteness.tsx
import React from 'react';

interface ProfileCompletenessProps {
  completeness: number;
  onEdit: () => void;
}

export const ProfileCompleteness: React.FC<ProfileCompletenessProps> = ({ completeness, onEdit }) => {
  const getMessage = () => {
    if (completeness === 100) return 'Profile complete';
    if (completeness >= 70) return 'Almost there';
    if (completeness >= 40) return 'Fill in your details';
    return 'Add your info';
  };

  const getColor = () => {
    if (completeness === 100) return '#22c55e';
    if (completeness >= 70) return '#3b82f6';
    if (completeness >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const message = getMessage();
  const barColor = getColor();

  return (
    <div style={{
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 16,
      marginBottom: 20
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{message}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              flex: 1,
              height: 6,
              background: '#e5e7eb',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${completeness}%`,
                height: '100%',
                background: barColor,
                borderRadius: 3
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{completeness}%</span>
          </div>
        </div>
        <button
          onClick={onEdit}
          style={{
            padding: '6px 14px',
            fontSize: 13,
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            cursor: 'pointer',
            color: '#374151'
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
};