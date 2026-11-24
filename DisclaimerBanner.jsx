import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-center space-x-2 shadow-xs">
      <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <span>
        <strong className="font-semibold text-amber-950">DECISION-SUPPORT NOTICE:</strong> SafeSight AI is <u>NOT</u> a crash-prediction system. A detected conflict is an explainable surrogate screening signal for human engineering review, not proof that a crash would occur.
      </span>
    </div>
  );
}
