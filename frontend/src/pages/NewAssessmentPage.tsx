import React, { useState, useEffect } from 'react';
import {
  FilePlus2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Cpu,
  Check,
  RotateCcw,
} from 'lucide-react';
import { WasteInput, AssessmentResult } from '../types';
import { api } from '../services/api';

interface NewAssessmentPageProps {
  onAssessmentCompleted: (result: AssessmentResult) => void;
  prefillData?: WasteInput | null;
}

export const NewAssessmentPage: React.FC<NewAssessmentPageProps> = ({
  onAssessmentCompleted,
  prefillData,
}) => {
  const materialsList = [
    'Concrete',
    'Brick',
    'Steel',
    'Wood',
    'Glass',
    'Plastic',
    'Gypsum',
    'Asphalt',
    'Soil',
    'Ceramic / Tiles',
    'Mixed Construction Waste',
  ];

  const conditionList = ['Excellent', 'Good', 'Moderate', 'Damaged', 'Severely Damaged'];
  const contaminationList = ['None', 'Low', 'Moderate', 'High', 'Hazardous'];
  const unitsList = ['kg', 'tonnes', 'units', 'cubic metres'];

  // Form State
  const [material, setMaterial] = useState<string>('Concrete');
  const [condition, setCondition] = useState<string>('Damaged');
  const [contamination, setContamination] = useState<string>('None');
  const [quantity, setQuantity] = useState<string>('500');
  const [unit, setUnit] = useState<string>('kg');
  const [additional, setAdditional] = useState<Record<string, any>>({
    cracks: 'Moderate',
    structural_integrity: 'Compromised',
    mixed_with_other: 'No',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync with prefillData if provided
  useEffect(() => {
    if (prefillData) {
      setMaterial(prefillData.material);
      setCondition(prefillData.condition);
      setContamination(prefillData.contamination);
      setQuantity(prefillData.quantity.toString());
      setUnit(prefillData.unit);
      setAdditional(prefillData.additional_characteristics || {});
    }
  }, [prefillData]);

  // Update default additional fields when material changes
  const handleMaterialChange = (newMat: string) => {
    setMaterial(newMat);
    switch (newMat) {
      case 'Concrete':
        setAdditional({ cracks: 'None', structural_integrity: 'Sound', mixed_with_other: 'No' });
        break;
      case 'Brick':
        setAdditional({ broken_percentage: 0, mortar_attached: 'Cleanable' });
        break;
      case 'Steel':
        setAdditional({ rust_level: 'None', structural_integrity: 'Sound' });
        break;
      case 'Wood':
        setAdditional({ rot: 'No', paint_coating: 'Unpainted', moisture: 'Dry' });
        break;
      case 'Glass':
        setAdditional({ cracked: 'No', intact_percentage: 100 });
        break;
      case 'Plastic':
        setAdditional({ polymer_type: 'Rigid PVC / HDPE', dirt_level: 'Low' });
        break;
      case 'Gypsum':
        setAdditional({ moisture: 'Dry', wet: 'No' });
        break;
      case 'Asphalt':
        setAdditional({ reclaimed_milled: 'Yes', foreign_contaminants: 'None' });
        break;
      case 'Soil':
        setAdditional({ tested_clean: 'Yes', foreign_debris: 'None' });
        break;
      case 'Ceramic / Tiles':
        setAdditional({ intact_percentage: 100, mortar_attached: 'Clean' });
        break;
      case 'Mixed Construction Waste':
        setAdditional({ separable_on_site: 'Yes', inert_fraction_pct: 75 });
        break;
      default:
        setAdditional({});
    }
  };

  const handleAdditionalChange = (key: string, value: any) => {
    setAdditional((prev) => ({ ...prev, [key]: value }));
  };

  const applyDemo = (demo: {
    material: string;
    condition: string;
    contamination: string;
    quantity: number;
    unit: string;
    additional: Record<string, any>;
  }) => {
    setMaterial(demo.material);
    setCondition(demo.condition);
    setContamination(demo.contamination);
    setQuantity(demo.quantity.toString());
    setUnit(demo.unit);
    setAdditional(demo.additional);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const qNum = parseFloat(quantity);
    if (isNaN(qNum) || qNum <= 0) {
      setErrorMessage('Please enter a valid positive quantity greater than 0.');
      return;
    }

    if (!material) {
      setErrorMessage('Please select a material type.');
      return;
    }

    try {
      setLoading(true);
      const payload: WasteInput = {
        material,
        condition,
        contamination,
        quantity: qNum,
        unit,
        additional_characteristics: additional,
      };

      const result = await api.analyzeWaste(payload);
      onAssessmentCompleted(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while evaluating waste.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FilePlus2 className="w-6 h-6 text-emerald-600" />
          <span>New Waste Assessment</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Specify physical condition and contamination attributes for ML-based recovery pathway evaluation.
        </p>
      </div>

      {/* Demo Quick-Fill Bar */}
      <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Try Demo Examples (Click to Auto-Populate)</span>
          </span>
          <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">
            Tested Academic Benchmarks
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              applyDemo({
                material: 'Concrete',
                condition: 'Damaged',
                contamination: 'None',
                quantity: 500,
                unit: 'kg',
                additional: { cracks: 'Moderate', structural_integrity: 'Compromised' },
              })
            }
            className="px-3 py-1.5 bg-white hover:bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 shadow-2xs transition active:scale-95 flex items-center gap-1.5"
          >
            <span>Demo 1 – Damaged Concrete (500 kg)</span>
            <span className="text-[10px] bg-emerald-200/80 px-1 rounded text-emerald-950 font-bold">Proposal</span>
          </button>

          <button
            type="button"
            onClick={() =>
              applyDemo({
                material: 'Brick',
                condition: 'Good',
                contamination: 'None',
                quantity: 300,
                unit: 'kg',
                additional: { broken_percentage: 5, mortar_attached: 'Cleanable' },
              })
            }
            className="px-3 py-1.5 bg-white hover:bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 shadow-2xs transition active:scale-95"
          >
            Demo 2 – Reusable Bricks (300 kg)
          </button>

          <button
            type="button"
            onClick={() =>
              applyDemo({
                material: 'Steel',
                condition: 'Damaged',
                contamination: 'Low',
                quantity: 250,
                unit: 'kg',
                additional: { rust_level: 'Moderate', structural_integrity: 'Deformed' },
              })
            }
            className="px-3 py-1.5 bg-white hover:bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 shadow-2xs transition active:scale-95"
          >
            Demo 3 – Recyclable Steel (250 kg)
          </button>

          <button
            type="button"
            onClick={() =>
              applyDemo({
                material: 'Soil',
                condition: 'Good',
                contamination: 'None',
                quantity: 800,
                unit: 'kg',
                additional: { tested_clean: 'Yes', foreign_debris: 'None' },
              })
            }
            className="px-3 py-1.5 bg-white hover:bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 shadow-2xs transition active:scale-95"
          >
            Demo 4 – Clean Soil (800 kg)
          </button>

          <button
            type="button"
            onClick={() =>
              applyDemo({
                material: 'Wood',
                condition: 'Good',
                contamination: 'None',
                quantity: 100,
                unit: 'kg',
                additional: { rot: 'No', paint_coating: 'Unpainted', moisture: 'Dry' },
              })
            }
            className="px-3 py-1.5 bg-white hover:bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 shadow-2xs transition active:scale-95"
          >
            Demo 5 – Reusable Timber (100 kg)
          </button>

          <button
            type="button"
            onClick={() =>
              applyDemo({
                material: 'Glass',
                condition: 'Damaged',
                contamination: 'None',
                quantity: 150,
                unit: 'kg',
                additional: { cracked: 'Yes', intact_percentage: 10 },
              })
            }
            className="px-3 py-1.5 bg-white hover:bg-emerald-100/70 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-900 shadow-2xs transition active:scale-95"
          >
            Demo 6 – Broken Glass (150 kg)
          </button>

          <button
            type="button"
            onClick={() =>
              applyDemo({
                material: 'Soil',
                condition: 'Good',
                contamination: 'Hazardous',
                quantity: 800,
                unit: 'kg',
                additional: { chemical_spill: 'Yes', tested_clean: 'No' },
              })
            }
            className="px-3 py-1.5 bg-white hover:bg-red-50 border border-red-300 rounded-lg text-xs font-semibold text-red-900 shadow-2xs transition active:scale-95"
          >
            Demo 7 – Contaminated Soil (Hazardous)
          </button>
        </div>
      </div>

      {/* Main Assessment Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* A. Material Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              A. Material Type <span className="text-red-500">*</span>
            </label>
            <select
              value={material}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {materialsList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Select the primary constituent waste stream.
            </p>
          </div>

          {/* B. Condition */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              B. Condition <span className="text-red-500">*</span>
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {conditionList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Physical & structural state of the material.
            </p>
          </div>

          {/* C. Contamination */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              C. Contamination Level <span className="text-red-500">*</span>
            </label>
            <select
              value={contamination}
              onChange={(e) => setContamination(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 ${
                contamination === 'Hazardous'
                  ? 'bg-red-50 border-red-300 text-red-900 focus:ring-red-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-emerald-500 focus:bg-white'
              }`}
            >
              {contaminationList.map((cont) => (
                <option key={cont} value={cont}>
                  {cont}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Presence of chemicals, sealants, paints, or toxic agents.
            </p>
          </div>

          {/* D & E. Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                D. Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                E. Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {unitsList.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* F. Dynamic Material-Specific Characteristics */}
        <div className="border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>F. Material-Specific Engineering Characteristics ({material})</span>
            </h4>
            <span className="text-[11px] text-slate-400">Optional refinement parameters</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {material === 'Concrete' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cracks Level</label>
                  <select
                    value={additional.cracks || 'None'}
                    onChange={(e) => handleAdditionalChange('cracks', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="None">None</option>
                    <option value="Minor">Minor Surface Cracks</option>
                    <option value="Moderate">Moderate Fractures</option>
                    <option value="Severe">Severe Fragmentation</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Structural Integrity</label>
                  <select
                    value={additional.structural_integrity || 'Sound'}
                    onChange={(e) => handleAdditionalChange('structural_integrity', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Sound">Sound (Load-bearing viable)</option>
                    <option value="Compromised">Compromised</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mixed with other materials?</label>
                  <select
                    value={additional.mixed_with_other || 'No'}
                    onChange={(e) => handleAdditionalChange('mixed_with_other', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="No">No (Segregated clean)</option>
                    <option value="Yes">Yes (Commingled)</option>
                  </select>
                </div>
              </>
            )}

            {material === 'Brick' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Broken Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={additional.broken_percentage ?? 0}
                    onChange={(e) => handleAdditionalChange('broken_percentage', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mortar Attached</label>
                  <select
                    value={additional.mortar_attached || 'Cleanable'}
                    onChange={(e) => handleAdditionalChange('mortar_attached', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="None">None (Clean face)</option>
                    <option value="Cleanable">Cleanable (Soft lime mortar)</option>
                    <option value="Tenacious">Tenacious (Hard cement mortar)</option>
                  </select>
                </div>
              </>
            )}

            {material === 'Steel' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rust Level</label>
                  <select
                    value={additional.rust_level || 'None'}
                    onChange={(e) => handleAdditionalChange('rust_level', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="None">None</option>
                    <option value="Surface">Surface Rust</option>
                    <option value="Moderate">Moderate Pitting</option>
                    <option value="Severe">Severe Corrosion</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Structural Integrity</label>
                  <select
                    value={additional.structural_integrity || 'Sound'}
                    onChange={(e) => handleAdditionalChange('structural_integrity', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Sound">Sound (Straight / intact)</option>
                    <option value="Deformed">Deformed / Bent</option>
                  </select>
                </div>
              </>
            )}

            {material === 'Wood' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rot / Fungal Attack</label>
                  <select
                    value={additional.rot || 'No'}
                    onChange={(e) => handleAdditionalChange('rot', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="No">No (Sound timber)</option>
                    <option value="Surface">Surface Rot</option>
                    <option value="Severe">Severe Dry/Wet Rot</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Paint / Preservative</label>
                  <select
                    value={additional.paint_coating || 'Unpainted'}
                    onChange={(e) => handleAdditionalChange('paint_coating', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Unpainted">Unpainted Natural</option>
                    <option value="Standard Paint">Non-toxic Water-based Paint</option>
                    <option value="Hazardous Lead/Creosote">Hazardous Creosote / CCA / Lead</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Moisture Condition</label>
                  <select
                    value={additional.moisture || 'Dry'}
                    onChange={(e) => handleAdditionalChange('moisture', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Dry">Dry (Suitable for storage)</option>
                    <option value="Damp">Damp</option>
                    <option value="Waterlogged">Waterlogged</option>
                  </select>
                </div>
              </>
            )}

            {material === 'Glass' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cracked / Broken?</label>
                  <select
                    value={additional.cracked || 'No'}
                    onChange={(e) => handleAdditionalChange('cracked', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="No">No (Whole intact pane)</option>
                    <option value="Yes">Yes (Cullet / shattered)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Intact Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={additional.intact_percentage ?? 100}
                    onChange={(e) => handleAdditionalChange('intact_percentage', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </>
            )}

            {material === 'Plastic' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Polymer Type</label>
                  <select
                    value={additional.polymer_type || 'Rigid PVC / HDPE'}
                    onChange={(e) => handleAdditionalChange('polymer_type', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Rigid PVC / HDPE">Rigid PVC / HDPE (Piping)</option>
                    <option value="EPS Foam">EPS / XPS Insulation Foam</option>
                    <option value="Mixed Polymers">Mixed / Unsorted Plastics</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dirt / Adhesives</label>
                  <select
                    value={additional.dirt_level || 'Low'}
                    onChange={(e) => handleAdditionalChange('dirt_level', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Low">Low / Clean</option>
                    <option value="Moderate">Moderate Dirt</option>
                    <option value="Heavy">Heavy Chemical Ingress</option>
                  </select>
                </div>
              </>
            )}

            {material === 'Gypsum' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Moisture / Dampness</label>
                  <select
                    value={additional.moisture || 'Dry'}
                    onChange={(e) => handleAdditionalChange('moisture', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Dry">Dry Core (Safe for calcining)</option>
                    <option value="Wet">Wet / Water-Damaged (H2S gas risk)</option>
                  </select>
                </div>
              </>
            )}

            {material === 'Soil' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tested Clean?</label>
                  <select
                    value={additional.tested_clean || 'Yes'}
                    onChange={(e) => handleAdditionalChange('tested_clean', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Yes">Yes (Certified clean fill)</option>
                    <option value="No">No / Untested</option>
                  </select>
                </div>
              </>
            )}

            {material === 'Mixed Construction Waste' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Separable on-site?</label>
                  <select
                    value={additional.separable_on_site || 'Yes'}
                    onChange={(e) => handleAdditionalChange('separable_on_site', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Yes">Yes (MRF sorting viable)</option>
                    <option value="No">No (Intimately mixed / bonded)</option>
                  </select>
                </div>
              </>
            )}

            {['Asphalt', 'Ceramic / Tiles'].includes(material) && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">General Quality</label>
                <select
                  value={additional.quality || 'Standard'}
                  onChange={(e) => handleAdditionalChange('quality', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                >
                  <option value="Standard">Standard demolition fraction</option>
                  <option value="Heritage / High Value">Heritage / High Value</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Features are vectorized into the ML classifier and screened against environmental safety guardrails.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {loading ? (
              <span>Running ML Model Inference...</span>
            ) : (
              <>
                <span>Generate ML Recovery Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
