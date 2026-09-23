import React from 'react';
import { ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h4 className="font-bold text-slate-900 mb-2">Construction Waste Recovery Planner</h4>
            <p className="text-slate-500 leading-relaxed">
              An academic research prototype investigating condition-aware Machine Learning decision support for circular economy material recovery.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Circular Recovery Hierarchy</h4>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 flex-wrap">
              <span className="text-emerald-700">REUSE</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-teal-700">REPAIR</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-blue-700">RECYCLE</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-amber-700">RECOVER</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-rose-700">DISPOSE</span>
            </div>
            <p className="text-slate-500 mt-2 text-[11px]">
              Strictly prioritizes higher-value circular loops over downcycling and landfill.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Academic Prototype Disclaimer</span>
            </h4>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              This prototype provides decision support based on a trained Machine Learning model operating under hard civil and environmental safety guardrails. It does not replace engineering judgment, laboratory testing, regulatory requirements, or certified waste-management procedures.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px]">
          <div>Version 2.0.0 — Machine Learning Decision Support System</div>
          <div>Circular Economy & Sustainable Built Environment Research Framework</div>
        </div>
      </div>
    </footer>
  );
};
