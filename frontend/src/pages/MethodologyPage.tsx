import React from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileCode,
  GraduationCap,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-200">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>Academic Research Documentation</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Research Methodology & System Architecture
        </h2>
        <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
          Theoretical foundations, decision support logic, and architectural specifications for the Construction Waste Recovery Planner.
        </p>
      </div>

      {/* 1. Problem Statement */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">1</span>
          <span>Core Problem</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Construction and demolition (C&D) activities account for more than 35% of total solid waste generated globally. While modern circular economy frameworks mandate material valorization, on-site personnel and waste handlers frequently resort to rapid bulk downcycling (e.g. crushing all masonry into low-grade aggregate) or landfill disposal due to the absence of rapid, standardized, condition-aware decision support tools.
        </p>
      </div>

      {/* 2. Research Gap */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">2</span>
          <span>Identified Research Gap</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Existing decision models are either high-level macroeconomic policy guidelines that offer no actionable advice for specific truckloads of site waste, or "black-box" machine learning algorithms that lack explainability, require unavailable training datasets, and cannot guarantee safety or compliance under strict civil engineering standards.
        </p>
      </div>

      {/* 3. Proposed Solution */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">3</span>
          <span>Proposed Solution: ML Decision Engine with Guardrails</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          A condition-aware Machine Learning decision support system (DSS). By vectorizing material physical characteristics, degradation stages, and contamination parameters into a multi-class probabilistic classification pipeline, the system predicts the optimal circular recovery pathway with calibrated confidence scores, while hard civil engineering safety guardrails eliminate algorithmic hallucination for hazardous waste.
        </p>
      </div>

      {/* 4. ML with Safety Guardrails */}
      <div className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <span>Machine Learning with Hybrid Safety Guardrails</span>
          </h3>
          <span className="text-xs font-bold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded">
            Architectural Paradigm
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-4 rounded-lg border border-emerald-200/80 space-y-2">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Guardrail-Protected ML (This Application)</span>
            </h4>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li>Supervised multi-class probabilistic classification (5 recovery pathways)</li>
              <li>Calibrated confidence scores & full posterior probability distributions</li>
              <li>Hard environmental safety guardrails: zero-tolerance hazardous override</li>
              <li>Modular drop-in model adapter supporting user-trained scikit-learn artifacts</li>
              <li>Traceable feature vectorization and explainable decision steps</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2 opacity-80">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Unconstrained Black-Box ML</span>
            </h4>
            <ul className="space-y-1 text-slate-500 list-disc list-inside">
              <li>Unpredictable outputs in out-of-distribution contamination scenarios</li>
              <li>Risk of hallucinating false reuse certification on toxic/hazardous loads</li>
              <li>Lack of transparent engineering constraints or audit trail</li>
              <li>Zero fallback when model artifacts or weight files are missing</li>
              <li>Cannot guarantee regulatory compliance under civil engineering codes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. Conceptual System Architecture */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>Machine Learning Decision Pipeline Architecture</span>
        </h3>
        <p className="text-xs text-slate-500">
          The software executes this continuous 5-stage Machine Learning inference flow:
        </p>

        {/* Architecture Flowchart */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center space-y-3 max-w-lg mx-auto text-xs font-bold">
          <div className="w-full py-2 px-4 bg-white border border-slate-300 rounded shadow-2xs text-center text-slate-800">
            1. Waste Characteristics Vectorization (15 Tabular & Ordinal Features)
          </div>
          <ArrowDown className="w-4 h-4 text-emerald-600" />
          <div className="w-full py-2 px-4 bg-blue-50 border border-blue-200 rounded shadow-2xs text-center text-blue-900">
            2. Environmental Safety Guardrail Screening (Hazardous / Asbestos / Toxicity Screening)
          </div>
          <ArrowDown className="w-4 h-4 text-emerald-600" />
          <div className="w-full py-2 px-4 bg-emerald-50 border border-emerald-200 rounded shadow-2xs text-center text-emerald-900">
            3. ML Model Probabilistic Classification (Supervised multi-class posterior probability matrix)
          </div>
          <ArrowDown className="w-4 h-4 text-emerald-600" />
          <div className="w-full py-2 px-4 bg-amber-50 border border-amber-200 rounded shadow-2xs text-center text-amber-900">
            4. Circular Waste Hierarchy Priority Mapping (Reuse → Repair → Recycle → Recover → Dispose)
          </div>
          <ArrowDown className="w-4 h-4 text-emerald-600" />
          <div className="w-full py-2 px-4 bg-slate-900 text-white rounded shadow-md text-center">
            5. Final Recommendation + Calibrated Confidence (%) + Multi-Class Probability Bars + LCA Index
          </div>
        </div>
      </div>

      {/* 6. Academic Research Contributions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Key Academic Research Contributions</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-emerald-800 block mb-1">1. Condition-Aware Recovery</span>
            <p className="text-slate-600 leading-tight">
              Incorporates physical degradation thresholds, broken percentages, and chemical contamination into circular sorting logic.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-emerald-800 block mb-1">2. Explainable Decision Pipeline</span>
            <p className="text-slate-600 leading-tight">
              Provides step-by-step decision auditing, satisfied conditions checklists, and transparent justifications for every ML-generated outcome.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-emerald-800 block mb-1">3. Circular Prioritization</span>
            <p className="text-slate-600 leading-tight">
              Prevents premature downcycling into aggregates or landfill by actively testing high-value reuse feasibility first.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-emerald-800 block mb-1">4. Working Full-Stack System</span>
            <p className="text-slate-600 leading-tight">
              Demonstrates a complete, usable, end-to-end software architecture with SQLite persistence, REST APIs, and responsive interface.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Limitations & Future Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Prototype Limitations (Version 1)</span>
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Does not compute real-time dynamic transportation logistics or local plant tip fees.</li>
            <li>Relies on user-reported physical degradation parameters rather than certified lab tests.</li>
            <li>The reference dataset used to derive training labels is synthetic/heuristic-derived, representing generalized regional civil engineering guidelines rather than certified lab-inspected waste records.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <span>Future Scope & Extensions</span>
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Integration with Building Information Modeling (BIM) deconstruction schedules.</li>
            <li>Quantitative Life-Cycle Assessment (LCA) embodied carbon accounting (kg CO2e).</li>
            <li>Regional GIS mapping to local recycling plants and secondary material marketplaces.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
