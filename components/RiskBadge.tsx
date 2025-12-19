
import React from 'react';

interface Props {
  status: 'Critical' | 'Warning' | 'Secure' | 'Approved' | 'Conditional' | 'Restricted';
}

export const RiskBadge: React.FC<Props> = ({ status }) => {
  const styles = {
    Critical: 'bg-red-100 text-red-700 border-red-200',
    Restricted: 'bg-red-100 text-red-700 border-red-200',
    Warning: 'bg-amber-100 text-amber-700 border-amber-200',
    Conditional: 'bg-amber-100 text-amber-700 border-amber-200',
    Secure: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};
