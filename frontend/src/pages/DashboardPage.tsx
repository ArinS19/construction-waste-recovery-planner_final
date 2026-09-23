import React, { useEffect, useState } from 'react';
import {
  Layers,
  RotateCcw,
  RefreshCw,
  Flame,
  Trash2,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Play,
  Cpu,
} from 'lucide-react';
import { StatisticsResponse, WasteInput, AssessmentResult, MLModelStatus } from '../types';
import { api } from '../services/api';
import { HierarchyBadge } from '../components/HierarchyBadge';

interface DashboardPageProps {
  onStartAssessment: () => void;
  onSelectAssessment: (id: number) => void;
  onSelectDemo: (demo: WasteInput) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartAssessment,
  onSelectAssessment,
  onSelectDemo,
}) => {
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [mlStatus, setMlStatus] = useState<MLModelStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [data, mlData] = await Promise.all([
        api.getStatistics().catch(() => null),
        api.getMLStatus().catch(() => null),
      ]);
      if (data) setStats(data);
      if (mlData) setMlStatus(mlData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const quickDemos = [
    {
      title: 'Demo 1: Damaged Concrete (500 kg)',
      badge: 'Structural Damage Scenario',
      desc: 'Concrete aggregate downcycling proposal scenario',
      input: {
        material: 'Concrete',
        condition: 'Damaged',
        contamination: 'None',
        quantity: 500,
        unit: 'kg',
        additional_characteristics: { cracks: 'Moderate', structural_integrity: 'Compromised' },
      },
    },
    {
      title: 'Demo 2: Reusable Bricks (300 kg)',
      badge: 'Heritage Masonry Scenario',
      desc: 'Clean intact heritage masonry bricks',
      input: {
        material: 'Brick',
        condition: 'Good',
        contamination: 'None',
        quantity: 300,
        unit: 'kg',
        additional_characteristics: { broken_percentage: 5, mortar_attached: 'Cleanable' },
      },
    },
    {
      title: 'Demo 3: Recyclable Steel (250 kg)',
      badge: 'Deformed Steel Scenario',
      desc: 'Deformed structural steel with low surface rust',
      input: {
        material: 'Steel',
        condition: 'Damaged',
        contamination: 'Low',
        quantity: 250,
        unit: 'kg',
        additional_characteristics: { rust_level: 'Moderate', structural_integrity: 'Deformed' },
      },
    },
    {
      title: 'Demo 4: Clean Soil (800 kg)',
      badge: 'Clean Fill Scenario',
      desc: 'Clean excavated subsoil for site grading',
      input: {
        material: 'Soil',
        condition: 'Good',
        contamination: 'None',
        quantity: 800,
        unit: 'kg',
        additional_characteristics: { tested_clean: 'Yes' },
      },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero / Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-700/50">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Academic Research Prototype • Decision Support System</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Construction Waste Recovery Planner
          </h2>
          <p className="text-emerald-300 font-medium text-sm sm:text-base mt-1">
            Machine Learning Decision Support for Sustainable Material Recovery
          </p>
          <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
            Analyze construction waste characteristics and identify the most suitable recovery pathway using a trained Machine Learning model with transparent, explainable decision steps. Prioritizes high-value circularity across the recovery hierarchy.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartAssessment}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Assessment</span>
            </button>
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Machine Learning Decision Engine • Guardrail Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Assessments</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {loading ? '...' : stats?.total_assessments || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Stored evaluation runs</span>
        </div>

        {/* Reuse */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>Reuse (Tier 1)</span>
            <RotateCcw className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
            {loading ? '...' : stats?.pathway_counts?.REUSE || 0}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Highest circular value</span>
        </div>

        {/* Recycle */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
            <span>Recycle (Tier 3)</span>
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">
            {loading ? '...' : stats?.pathway_counts?.RECYCLE || 0}
          </div>
          <span className="text-[11px] text-blue-700 mt-1 block">Secondary feedstock</span>
        </div>

        {/* Recover */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>Recover (Tier 4)</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">
            {loading ? '...' : stats?.pathway_counts?.RECOVER || 0}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">MRF / Energy recovery</span>
        </div>

        {/* Dispose */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold">
            <span>Disposal (Tier 5)</span>
            <Trash2 className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-2">
            {loading ? '...' : stats?.pathway_counts?.DISPOSE || 0}
          </div>
          <span className="text-[11px] text-rose-700 mt-1 block">Specialized containment</span>
        </div>
      </div>

      {/* Machine Learning Model Integration Status Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 border border-slate-700 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Machine Learning Decision Engine Status
              </h3>
              <p className="text-xs text-slate-400">
                Multi-class classification pipeline with civil engineering safety guardrails
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            mlStatus?.is_user_trained_model_loaded
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {mlStatus?.is_user_trained_model_loaded ? 'Trained Model Active' : 'Model Slot Ready (Awaiting User Model)'}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Active Engine</span>
            <span className="font-bold text-white text-xs truncate block">
              {mlStatus?.model_engine || 'Probabilistic Classifier'}
            </span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Model Version</span>
            <span className="font-bold text-white text-xs">
              {mlStatus?.model_version || 'v1.0'}
            </span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Feature Columns</span>
            <span className="font-bold text-white text-xs">
              {mlStatus?.required_feature_columns?.length || 15} Standard Features
            </span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Target Classes</span>
            <span className="font-bold text-white text-xs">
              5 Hierarchy Pathways
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>
            Drop your trained model artifact at: <code className="text-emerald-400 font-mono">backend/app/ml/saved_models/waste_recovery_model.joblib</code>
          </span>
          <button
            onClick={onStartAssessment}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline self-start sm:self-auto"
          >
            Launch Assessment &rarr;
          </button>
        </div>
      </div>

      {/* Recovery Hierarchy Explanatory Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              The Circular Construction Waste Hierarchy
            </h3>
            <p className="text-xs text-slate-500">
              Theoretical foundation for transparent multi-tier circular decision support
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start md:self-auto">
            Prioritize Highest Feasible Value
          </span>
        </div>

        {/* Visual Hierarchy Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-bold mb-4">
          <div className="bg-emerald-600 text-white py-3 px-2 rounded-lg shadow-2xs flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider opacity-80">Tier 1</span>
            <span className="text-sm font-black">REUSE</span>
            <span className="text-[10px] font-normal opacity-90 mt-1">Direct Salvage</span>
          </div>
          <div className="bg-teal-600 text-white py-3 px-2 rounded-lg shadow-2xs flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider opacity-80">Tier 2</span>
            <span className="text-sm font-black">REPAIR</span>
            <span className="text-[10px] font-normal opacity-90 mt-1">Refurbishment</span>
          </div>
          <div className="bg-blue-600 text-white py-3 px-2 rounded-lg shadow-2xs flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider opacity-80">Tier 3</span>
            <span className="text-sm font-black">RECYCLE</span>
            <span className="text-[10px] font-normal opacity-90 mt-1">Secondary Aggregate</span>
          </div>
          <div className="bg-amber-600 text-white py-3 px-2 rounded-lg shadow-2xs flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider opacity-80">Tier 4</span>
            <span className="text-sm font-black">RECOVER</span>
            <span className="text-[10px] font-normal opacity-90 mt-1">MRF / Energy</span>
          </div>
          <div className="bg-rose-700 text-white py-3 px-2 rounded-lg shadow-2xs flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider opacity-80">Tier 5</span>
            <span className="text-sm font-black">DISPOSE</span>
            <span className="text-[10px] font-normal opacity-90 mt-1">Hazardous / Landfill</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The ML model attempts to preserve maximum material and energetic value by scoring every pathway from Tier 1 downward. Lower-tier recovery (such as downcycling into aggregate or thermal recovery) is only selected when structural degradation, physical cracking, or contamination rules out higher-tier reuse.
        </p>
      </div>

      {/* Quick Demo Launchers */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>One-Click Academic Demonstrations</span>
            </h3>
            <p className="text-xs text-slate-500">
              Instantly test proposal scenarios with pre-configured verified inputs
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">4 Core Scenarios</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickDemos.map((demo, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-lg border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition group cursor-pointer flex flex-col justify-between"
              onClick={() => onSelectDemo(demo.input)}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {demo.title}
                  </span>
                </div>
                <span className="inline-block text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded mb-2">
                  {demo.badge}
                </span>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {demo.desc}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                <span>Evaluate Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution Charts / Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pathway Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Recovery Pathway Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Database Breakdown</span>
          </div>

          <div className="space-y-3">
            {stats && stats.pathway_counts ? (
              Object.entries(stats.pathway_counts).map(([pathway, count]) => {
                const total = stats.total_assessments || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={pathway} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{pathway}</span>
                      <span className="text-slate-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pathway === 'REUSE'
                            ? 'bg-emerald-500'
                            : pathway === 'REPAIR'
                            ? 'bg-teal-500'
                            : pathway === 'RECYCLE'
                            ? 'bg-blue-500'
                            : pathway === 'RECOVER'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">Loading pathway statistics...</p>
            )}
          </div>
        </div>

        {/* Material Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Material Waste Streams</span>
            </h3>
            <span className="text-xs text-slate-400">Assessed Fractions</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {stats && stats.material_counts ? (
              Object.entries(stats.material_counts).map(([mat, count]) => (
                <div
                  key={mat}
                  className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800">{mat}</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 text-[11px]">
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 col-span-2">Loading material statistics...</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Assessment Records */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Stored Assessments</h3>
            <p className="text-xs text-slate-500">Live records from local SQLite database</p>
          </div>
          <button
            onClick={onStartAssessment}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Run New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Contamination</th>
                <th className="py-3 px-4">Recommended Pathway</th>
                <th className="py-3 px-4">Model Tag</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recent_assessments && stats.recent_assessments.length > 0 ? (
                stats.recent_assessments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.material}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.condition}</td>
                    <td className="py-3 px-4 text-slate-600">{item.contamination}</td>
                    <td className="py-3 px-4">
                      <HierarchyBadge pathway={item.pathway} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {item.matched_rule}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectAssessment(item.id)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                      >
                        Inspect Result
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">
                    No stored assessments found.
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
