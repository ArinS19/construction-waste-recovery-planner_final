import React from 'react';
import { X, BookOpen, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { RuleResponse } from '../types';
import { HierarchyBadge } from './HierarchyBadge';

interface PathwayReferenceModalProps {
  rule: RuleResponse | null;
  onClose: () => void;
}

export const PathwayReferenceModal: React.FC<PathwayReferenceModalProps> = ({ rule, onClose }) => {
  if (!rule) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-mono font-bold text-base">
              {rule.rule_id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Reference {rule.rule_id} Details</h3>
                <HierarchyBadge pathway={rule.pathway} size="sm" showTier />
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Target Material: <span className="text-white font-bold">{rule.material}</span> (Hierarchy Priority: {rule.priority})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Conditions */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reference Conditions</span>
            </h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-slate-800">
              {rule.conditions_description}
            </div>
          </div>

          {/* Pathway & Reason */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Reference Pathway</span>
            </h4>
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
              <div className="font-bold text-emerald-900 text-sm mb-1">
                {rule.pathway}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {rule.reason}
              </p>
            </div>
          </div>

          {/* Potential Applications */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Potential Engineering Applications
            </h4>
            <div className="flex flex-wrap gap-2">
              {rule.applications && rule.applications.length > 0 ? (
                rule.applications.map((app, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md"
                  >
                    • {app}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Standard recycling stream</span>
              )}
            </div>
          </div>

          {/* Viable Alternatives */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Secondary / Alternative Recovery Options
            </h4>
            <div className="space-y-1.5">
              {rule.alternatives && rule.alternatives.length > 0 ? (
                rule.alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{alt}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400">No secondary option defined</span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
