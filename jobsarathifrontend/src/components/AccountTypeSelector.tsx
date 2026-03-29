import React from 'react';
import { X } from 'lucide-react';

interface AccountTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'company' | 'candidate') => void;
}

const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Choose Account Type</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onSelectType('candidate')}
            className="w-full p-4 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
          >
            <div className="text-left">
              <h3 className="text-lg font-semibold text-indigo-900">I'm a Candidate</h3>
              <p className="text-gray-600">Looking for job opportunities</p>
            </div>
          </button>

          <button
            onClick={() => onSelectType('company')}
            className="w-full p-4 border-2 border-emerald-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
          >
            <div className="text-left">
              <h3 className="text-lg font-semibold text-emerald-900">I'm a Company</h3>
              <p className="text-gray-600">Hiring talented professionals</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeSelector;