import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  Layers,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { AssessmentRecord } from '../types';
import { api } from '../services/api';
import { HierarchyBadge } from '../components/HierarchyBadge';

interface HistoryPageProps {
  onSelectAssessment: (id: number) => void;
  onNewAssessment: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectAssessment,
  onNewAssessment,
}) => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [materialFilter, setMaterialFilter] = useState<string>('');
  const [pathwayFilter, setPathwayFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadHistory();
  }, [materialFilter, pathwayFilter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAssessments(materialFilter, pathwayFilter, searchQuery);
      setAssessments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve assessment history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete assessment #${id}?`)) {
      return;
    }
    try {
      await api.deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory();
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            <span>Assessment History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of evaluations stored persistently in local SQLite database
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search material, model tag, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </form>

        {/* Material Filter */}
        <div className="w-full sm:w-48">
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
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

        {/* Pathway Filter */}
        <div className="w-full sm:w-48">
          <select
            value={pathwayFilter}
            onChange={(e) => setPathwayFilter(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Pathways</option>
            <option value="REUSE">Reuse</option>
            <option value="REPAIR">Repair</option>
            <option value="RECYCLE">Recycle</option>
            <option value="RECOVER">Recover</option>
            <option value="DISPOSE">Dispose / Specialized</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200">
          {error}
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Contamination</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Recommended Pathway</th>
                <th className="py-3 px-4">Model Tag</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Loading history records from database...
                  </td>
                </tr>
              ) : assessments.length > 0 ? (
                assessments.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => onSelectAssessment(rec.id)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(rec.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-emerald-700 transition">
                      {rec.material}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{rec.condition}</td>
                    <td className="py-3 px-4 text-slate-700">{rec.contamination}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {rec.quantity} {rec.unit}
                    </td>
                    <td className="py-3 px-4">
                      <HierarchyBadge pathway={rec.recommended_pathway} size="sm" showTier />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {rec.matched_rule}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectAssessment(rec.id)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200 transition"
                          title="Inspect details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(rec.id, e)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200 transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-slate-600">No assessments match your filters.</p>
                      <p className="text-[11px]">
                        Try clearing filter criteria or create a new waste assessment.
                      </p>
                      <button
                        onClick={onNewAssessment}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        + Create New Assessment
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
