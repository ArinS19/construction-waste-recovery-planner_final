import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Filter,
  Search,
  Eye,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { RuleResponse } from '../types';
import { api } from '../services/api';
import { HierarchyBadge } from '../components/HierarchyBadge';
import { PathwayReferenceModal } from '../components/PathwayReferenceModal';

export const PathwayReferencePage: React.FC = () => {
  const [rules, setRules] = useState<RuleResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedPathway, setSelectedPathway] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected reference entry for deep inspect modal
  const [activeRule, setActiveRule] = useState<RuleResponse | null>(null);

  useEffect(() => {
    loadRules();
  }, [selectedMaterial, selectedPathway]);

  const loadRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRules(selectedMaterial, selectedPathway);
      setRules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load pathway reference data');
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.rule_id.toLowerCase().includes(term) ||
      r.material.toLowerCase().includes(term) ||
      r.reason.toLowerCase().includes(term) ||
      r.conditions_description.toLowerCase().includes(term) ||
      r.pathway.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span>Pathway Reference Guide</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Domain knowledge base of material/condition heuristics used to derive the ML model's training labels
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full self-start sm:self-auto">
          {rules.length} Reference Entries
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reference ID, predicates, or application keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Material */}
        <div className="w-full sm:w-48">
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Materials</option>
            <option value="Concrete">Concrete</option>
            <option value="Brick">Brick</option>
            <option value="Steel">Steel</option>
            <option value="Wood">Wood</option>
            <option value="Glass">Glass</option>
            <option value="Plastic">Plastic</option>
            <option value="Gypsum">Gypsum</option>
            <option value="Asphalt">Asphalt</option>
            <option value="Soil">Soil</option>
            <option value="Ceramic / Tiles">Ceramic / Tiles</option>
            <option value="Mixed Construction Waste">Mixed Waste</option>
          </select>
        </div>

        {/* Pathway */}
        <div className="w-full sm:w-48">
          <select
            value={selectedPathway}
            onChange={(e) => setSelectedPathway(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Pathways</option>
            <option value="REUSE">Reuse (Tier 1)</option>
            <option value="REPAIR">Repair (Tier 2)</option>
            <option value="RECYCLE">Recycle (Tier 3)</option>
            <option value="RECOVER">Recover (Tier 4)</option>
            <option value="DISPOSE">Dispose / Specialized (Tier 5)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200">
          {error}
        </div>
      )}

      {/* Reference Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Reference ID</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Reference Conditions</th>
                <th className="py-3 px-4">Reference Pathway</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4">Reason / Rationale</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Loading reference data from database...
                  </td>
                </tr>
              ) : filteredRules.length > 0 ? (
                filteredRules.map((rule) => (
                  <tr
                    key={rule.rule_id}
                    onClick={() => setActiveRule(rule)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 group-hover:bg-emerald-100 group-hover:text-emerald-900 group-hover:border-emerald-300 transition">
                        {rule.rule_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {rule.material}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700 max-w-xs">
                      {rule.conditions_description}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <HierarchyBadge pathway={rule.pathway} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-600">
                      Tier {rule.priority}
                    </td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-sm truncate">
                      {rule.reason}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRule(rule);
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No reference entries found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Inspection Modal */}
      <PathwayReferenceModal rule={activeRule} onClose={() => setActiveRule(null)} />
    </div>
  );
};
