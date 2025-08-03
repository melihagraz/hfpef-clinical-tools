import React, { useState, useEffect } from 'react';
import { Calculator, Heart, Activity, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Custom Card components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const HFpEFClinicalDecisionTools = () => {
  const [activeTab, setActiveTab] = useState('diagnostic');
  const [diagnosticInputs, setDiagnosticInputs] = useState({
    age: '',
    bmi: '',
    hf2pef_score: '',
    e_e_medial: '',
    e_e_lateral: '',
    pasp: '',
    lv_mass: '',
    lv_ef: '',
    mean_ecv: '',
    lv_longitudinal_strain: '',
    diabetes: false,
    hypertension: false
  });
  
  const [prognosticInputs, setPrognosticInputs] = useState({
    age: '',
    bmi: '',
    mean_ecv: '',
    lv_strain: '',
    e_e_ratio: '',
    quality_of_life: '',
    diabetes: false,
    pasp: ''
  });

  const [treatmentInputs, setTreatmentInputs] = useState({
    baseline_ecv: '',
    baseline_pasp: '',
    baseline_e_e: '',
    current_medications: {
      ace_arb: false,
      beta_blocker: false,
      diuretic: false,
      mra: false
    },
    symptom_score: '',
    exercise_capacity: ''
  });

  // Diagnostic Risk Calculator
  const calculateDiagnosticRisk = () => {
    const inputs = diagnosticInputs;
    let score = 0;
    let maxScore = 100;
    
    // Clinical factors (40% weight)
    if (inputs.age) {
      score += Math.min((parseFloat(inputs.age) - 50) / 30 * 15, 15); // Age contribution
    }
    
    if (inputs.hf2pef_score) {
      score += parseFloat(inputs.hf2pef_score) / 9 * 20; // HF2PEF score normalized
    }
    
    if (inputs.bmi) {
      const bmi = parseFloat(inputs.bmi);
      if (bmi > 30) score += 5; // Obesity factor
    }
    
    // Comorbidities
    if (inputs.diabetes) score += 8;
    if (inputs.hypertension) score += 5;
    
    // Hemodynamic factors (35% weight)
    if (inputs.e_e_medial && inputs.e_e_lateral) {
      const mean_e_e = (parseFloat(inputs.e_e_medial) + parseFloat(inputs.e_e_lateral)) / 2;
      if (mean_e_e > 15) score += 15;
      else if (mean_e_e > 10) score += 10;
      else if (mean_e_e > 8) score += 5;
    }
    
    if (inputs.pasp) {
      const pasp = parseFloat(inputs.pasp);
      if (pasp > 40) score += 10;
      else if (pasp > 35) score += 5;
    }
    
    // Imaging factors (25% weight)
    if (inputs.mean_ecv) {
      const ecv = parseFloat(inputs.mean_ecv);
      if (ecv > 30) score += 15;
      else if (ecv > 27) score += 10;
      else if (ecv > 25) score += 5;
    }
    
    if (inputs.lv_longitudinal_strain) {
      const strain = Math.abs(parseFloat(inputs.lv_longitudinal_strain));
      if (strain < 15) score += 10;
      else if (strain < 18) score += 5;
    }
    
    return Math.min(score, 100);
  };

  // Prognostic Risk Calculator
  const calculatePrognosticRisk = () => {
    const inputs = prognosticInputs;
    let score = 0;
    
    // Age factor
    if (inputs.age) {
      score += Math.min((parseFloat(inputs.age) - 60) / 20 * 20, 20);
    }
    
    // Fibrosis burden (most important)
    if (inputs.mean_ecv) {
      const ecv = parseFloat(inputs.mean_ecv);
      if (ecv > 32) score += 25;
      else if (ecv > 28) score += 15;
      else if (ecv > 25) score += 8;
    }
    
    // Functional parameters
    if (inputs.lv_strain) {
      const strain = Math.abs(parseFloat(inputs.lv_strain));
      if (strain < 12) score += 20;
      else if (strain < 15) score += 10;
    }
    
    if (inputs.e_e_ratio) {
      const e_e = parseFloat(inputs.e_e_ratio);
      if (e_e > 20) score += 15;
      else if (e_e > 15) score += 8;
    }
    
    // Metabolic factors
    if (inputs.bmi) {
      const bmi = parseFloat(inputs.bmi);
      if (bmi > 35) score += 10;
      else if (bmi > 30) score += 5;
    }
    
    if (inputs.diabetes) score += 10;
    
    // Quality of life impact
    if (inputs.quality_of_life) {
      const qol = parseFloat(inputs.quality_of_life);
      if (qol < 50) score += 10;
      else if (qol < 70) score += 5;
    }
    
    return Math.min(score, 100);
  };

  const getRiskCategory = (score) => {
    if (score < 30) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
    if (score < 70) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getRecommendations = (score, type) => {
    const risk = getRiskCategory(score);
    
    if (type === 'diagnostic') {
      if (risk.level === 'Low') {
        return [
          "Consider alternative diagnoses",
          "Routine follow-up if symptoms persist",
          "Lifestyle counseling for cardiovascular health",
          "Annual assessment if risk factors present"
        ];
      } else if (risk.level === 'Moderate') {
        return [
          "Cardiology consultation recommended",
          "Advanced cardiac imaging (cardiac MRI with ECV)",
          "Comprehensive echocardiography with strain",
          "Exercise testing for functional assessment",
          "Consider cardiac catheterization if high suspicion"
        ];
      } else {
        return [
          "Urgent cardiology referral",
          "Comprehensive HFpEF evaluation protocol",
          "Cardiac MRI with tissue characterization",
          "Invasive hemodynamic assessment if indicated",
          "Initiate evidence-based HFpEF therapies",
          "Enroll in heart failure management program"
        ];
      }
    } else if (type === 'prognostic') {
      if (risk.level === 'Low') {
        return [
          "Standard heart failure management",
          "Annual follow-up with echo",
          "Lifestyle optimization focus",
          "Monitor for symptom progression"
        ];
      } else if (risk.level === 'Moderate') {
        return [
          "Enhanced surveillance (6-month follow-up)",
          "Optimize guideline-directed medical therapy",
          "Consider advanced therapies if symptoms progress",
          "Cardiac rehabilitation referral",
          "Monitor biomarkers and imaging parameters"
        ];
      } else {
        return [
          "Intensive heart failure management",
          "Frequent monitoring (3-month intervals)",
          "Consider advanced heart failure therapies",
          "Palliative care consultation if appropriate",
          "Clinical trial enrollment consideration",
          "Multidisciplinary team approach"
        ];
      }
    }
  };

  const getTreatmentRecommendations = () => {
    const inputs = treatmentInputs;
    const recommendations = [];
    
    // Medication optimization
    if (!inputs.current_medications.ace_arb) {
      recommendations.push({
        category: "RAAS Inhibition",
        recommendation: "Initiate ACE inhibitor or ARB",
        evidence: "Class I recommendation for HFpEF",
        monitoring: "Monitor renal function and potassium"
      });
    }
    
    if (parseFloat(inputs.baseline_pasp) > 40 && !inputs.current_medications.diuretic) {
      recommendations.push({
        category: "Volume Management",
        recommendation: "Consider loop diuretic therapy",
        evidence: "For symptomatic relief in volume overload",
        monitoring: "Monitor electrolytes and renal function"
      });
    }
    
    if (parseFloat(inputs.baseline_ecv) > 30 && !inputs.current_medications.mra) {
      recommendations.push({
        category: "Anti-fibrotic Therapy",
        recommendation: "Consider MRA (spironolactone/eplerenone)",
        evidence: "May benefit patients with elevated fibrosis burden",
        monitoring: "Monitor potassium and renal function closely"
      });
    }
    
    // Symptom-based recommendations
    if (parseFloat(inputs.symptom_score) > 70) {
      recommendations.push({
        category: "Symptom Management",
        recommendation: "Intensive symptom management program",
        evidence: "High symptom burden requires multimodal approach",
        monitoring: "Regular symptom assessment and QOL evaluation"
      });
    }
    
    if (parseFloat(inputs.exercise_capacity) < 300) {
      recommendations.push({
        category: "Exercise Training",
        recommendation: "Supervised cardiac rehabilitation",
        evidence: "Improves exercise capacity and quality of life",
        monitoring: "Exercise tolerance and functional capacity"
      });
    }
    
    return recommendations;
  };

  const diagnosticScore = calculateDiagnosticRisk();
  const prognosticScore = calculatePrognosticRisk();
  const diagnosticRisk = getRiskCategory(diagnosticScore);
  const prognosticRisk = getRiskCategory(prognosticScore);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          HFpEF Clinical Decision Support Tools
        </h1>
        <p className="text-gray-600">
          Evidence-based tools for HFpEF diagnosis, prognosis, and treatment optimization
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'diagnostic', label: 'Diagnostic Calculator', icon: Calculator },
          { id: 'prognostic', label: 'Prognostic Assessment', icon: TrendingUp },
          { id: 'treatment', label: 'Treatment Optimizer', icon: Heart }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Diagnostic Calculator */}
      {activeTab === 'diagnostic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>HFpEF Diagnostic Calculator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={diagnosticInputs.age}
                    onChange={(e) => setDiagnosticInputs({...diagnosticInputs, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="65"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BMI (kg/m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagnosticInputs.bmi}
                    onChange={(e) => setDiagnosticInputs({...diagnosticInputs, bmi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="28.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HF2PEF Score
                  </label>
                  <input
                    type="number"
                    value={diagnosticInputs.hf2pef_score}
                    onChange={(e) => setDiagnosticInputs({...diagnosticInputs, hf2pef_score: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="6"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E/e' Medial
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagnosticInputs.e_e_medial}
                    onChange={(e) => setDiagnosticInputs({...diagnosticInputs, e_e_medial: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="15.2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E/e' Lateral
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagnosticInputs.e_e_lateral}
                    onChange={(e) => setDiagnosticInputs({...diagnosticInputs, e_e_lateral: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12.8"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PASP (mmHg)
                  </label>
                  <input
                    type="number"
                    value={diagnosticInputs.pasp}
                    onChange={(e) => setDiagnosticInputs({...diagnosticInputs, pasp: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="42"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mean ECV (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagnosticInputs.mean_ecv}
                    onChange={(e) => setDiagnosticInputs({...diagnosticInputs, mean_ecv: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="28.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LV Longitudinal Strain (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={diagnosticInputs.lv_longitudinal_strain}
                    onChange={(e) => setDiagnosticInputs({...diagnosticInputs, lv_longitudinal_strain: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="-16.2"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={diagnosticInputs.diabetes}
                    onChange={(e) => setDiagnosticInputs({...diagnosticInputs, diabetes: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Diabetes Mellitus</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={diagnosticInputs.hypertension}
                    onChange={(e) => setDiagnosticInputs({...diagnosticInputs, hypertension: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Hypertension</span>
                </label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg ${diagnosticRisk.bg} mb-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">Risk Score</span>
                  <span className={`text-2xl font-bold ${diagnosticRisk.color}`}>
                    {diagnosticScore.toFixed(0)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${
                      diagnosticRisk.level === 'Low' ? 'bg-green-500' :
                      diagnosticRisk.level === 'Moderate' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${diagnosticScore}%` }}
                  ></div>
                </div>
                <div className={`text-center text-lg font-medium ${diagnosticRisk.color}`}>
                  {diagnosticRisk.level} Risk
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Clinical Recommendations:</h4>
                <ul className="space-y-1">
                  {getRecommendations(diagnosticScore, 'diagnostic').map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prognostic Assessment */}
      {activeTab === 'prognostic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Prognostic Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    value={prognosticInputs.age}
                    onChange={(e) => setPrognosticInputs({...prognosticInputs, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BMI (kg/m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={prognosticInputs.bmi}
                    onChange={(e) => setPrognosticInputs({...prognosticInputs, bmi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mean ECV (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={prognosticInputs.mean_ecv}
                    onChange={(e) => setPrognosticInputs({...prognosticInputs, mean_ecv: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LV Strain (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={prognosticInputs.lv_strain}
                    onChange={(e) => setPrognosticInputs({...prognosticInputs, lv_strain: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mean E/e'
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={prognosticInputs.e_e_ratio}
                    onChange={(e) =>
