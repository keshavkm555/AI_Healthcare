import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Flame,
  Activity,
  Droplets,
  Bone
} from 'lucide-react';

const FIRST_AID_TOPICS = [
  {
    id: 'cpr',
    title: 'Cardiac Arrest & Hands-Only CPR',
    urgency: 'CRITICAL EMERGENCY',
    symptoms: 'Person suddenly collapses, becomes unresponsive, and is not breathing normally.',
    steps: [
      'Check responsiveness: Tap shoulder firmly and shout "Are you okay?".',
      'Call 108 or 112 immediately or instruct a bystander to call.',
      'Place heel of one hand in the center of the chest, interlock other hand on top.',
      'Push hard and fast: 100 to 120 compressions per minute to a depth of 2 inches (5 cm).',
      'Allow full chest recoil between compressions. Do not stop until paramedics arrive or victim recovers.'
    ],
    dos: ['Start compressions without delay', 'Use an Automated External Defibrillator (AED) as soon as available'],
    donts: ['Do not waste time checking pulse if untrained', 'Do not stop compressions unless victim moves']
  },
  {
    id: 'bleeding',
    title: 'Heavy Bleeding (Hemorrhage)',
    urgency: 'HIGH URGENCY',
    symptoms: 'Pulsing or continuous heavy blood flow from a laceration or wound.',
    steps: [
      'Call emergency 108 if blood is spurting or won’t stop after direct pressure.',
      'Apply firm, continuous direct pressure over the wound using a clean cloth or sterile gauze.',
      'Elevate the injured limb above the level of the heart if no bone fracture is suspected.',
      'If blood soaks through, add another cloth on top; do NOT remove the original dressing.',
      'Maintain continuous pressure until emergency medical responders take over.'
    ],
    dos: ['Keep patient warm and lying down to prevent shock', 'Apply firm pressure directly on wound'],
    donts: ['Do not remove embedded sharp objects (knife/glass)', 'Do not apply improvised tourniquet unless trained']
  },
  {
    id: 'choking',
    title: 'Choking (Airway Obstruction)',
    urgency: 'HIGH URGENCY',
    symptoms: 'Person cannot speak, cough, or breathe; clutching throat with hands (universal distress sign).',
    steps: [
      'Ask: "Are you choking?" If victim cannot speak or cough, act immediately.',
      'Stand behind the person, wrap your arms around their waist, and lean them slightly forward.',
      'Make a fist with one hand and place the thumb side just above the navel and below the ribcage.',
      'Grasp your fist with your other hand and deliver quick, inward and upward abdominal thrusts.',
      'Repeat until object is expelled or call 108 if the person becomes unconscious.'
    ],
    dos: ['Encourage coughing if victim can cough or speak', 'Perform abdominal thrusts firmly'],
    donts: ['Do not perform blind finger sweeps in the mouth', 'Do not slap victim on back while upright']
  },
  {
    id: 'burns',
    title: 'Thermal & Scald Burns',
    urgency: 'URGENT',
    symptoms: 'Redness, severe pain, blistering, or charred skin tissue from heat/fire/hot liquid.',
    steps: [
      'Remove person from heat source and ensure personal safety.',
      'Cool the burn immediately under cool (not freezing) running water for 10 to 20 minutes.',
      'Gently remove rings, watches, or tight clothing around burned area before swelling starts.',
      'Cover the burned area loosely with clean, non-stick sterile gauze or clean plastic wrap.',
      'Seek emergency hospital care for burns larger than palm size or involving face, hands, or joints.'
    ],
    dos: ['Cool with running water for 15+ minutes', 'Keep victim calm and hydrated'],
    donts: ['Never apply ice or ice water directly', 'Never apply butter, toothpaste, oil, or turmeric', 'Do not pop blisters']
  },
  {
    id: 'fainting',
    title: 'Fainting (Syncope)',
    urgency: 'MODERATE URGENCY',
    symptoms: 'Temporary loss of consciousness accompanied by pale skin and dizziness before falling.',
    steps: [
      'Lay the person flat on their back on the floor or ground.',
      'Elevate their legs approximately 12 inches (30 cm) to restore cerebral blood flow.',
      'Loosen any restrictive collars, ties, belts, or tight clothing.',
      'Ensure plenty of fresh air circulation around the victim.',
      'If the person does not regain consciousness within 1 minute, call 108 immediately.'
    ],
    dos: ['Elevate legs 12 inches above heart', 'Keep patient resting after waking up'],
    donts: ['Do not give food or liquids until fully alert', 'Do not splash cold water on face']
  },
  {
    id: 'snakebite',
    title: 'Suspected Snake Bite',
    urgency: 'CRITICAL EMERGENCY',
    symptoms: 'Fang puncture marks, localized intense swelling, burning pain, blurred vision, or drowsiness.',
    steps: [
      'Call emergency ambulance (108) immediately for anti-venom administration.',
      'Keep the victim calm and strictly still. Movement accelerates venom absorption.',
      'Immobilize the bitten limb using a splint at or below heart level.',
      'Remove tight rings, bracelets, or restrictive clothes before limb swells.',
      'Transport immediately to the nearest tertiary emergency hospital.'
    ],
    dos: ['Keep victim immobilized and calm', 'Note time of bite and snake appearance if safe'],
    donts: ['Never cut the bite wound with blades', 'Never attempt to suck venom out', 'Never apply a tourniquet or ice']
  },
  {
    id: 'fractures',
    title: 'Suspected Bone Fractures',
    urgency: 'HIGH URGENCY',
    symptoms: 'Severe pain, deformity, swelling, bruising, or inability to bear weight after trauma/fall.',
    steps: [
      'Stop any external bleeding first with gentle direct pressure around wound.',
      'Do not move the injured body part. Keep the joint above and below the injury immobilized.',
      'Apply an improvised splint (rolled magazine, rigid board) cushioned with cloth.',
      'Apply a cold ice pack wrapped in a towel for 15 minutes to reduce acute swelling.',
      'Seek immediate orthopedic trauma emergency care for formal X-rays.'
    ],
    dos: ['Immobilize limb in the position found', 'Support with soft padding'],
    donts: ['Never attempt to straighten a bent bone', 'Do not massage fractured joint']
  }
];

export default function FirstAidPage() {
  const [selectedTopic, setSelectedTopic] = useState(FIRST_AID_TOPICS[0]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            Emergency Medicine Guidance
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">First Aid Emergency Protocols</h1>
          <p className="text-sm text-slate-500 mt-1">
            Standard clinical life-saving guidelines for acute accidents, injuries, and sudden collapse.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:108"
            className="btn-danger text-xs sm:text-sm py-2 px-4 shadow-xs"
          >
            <PhoneCall className="w-4 h-4" />
            Ambulance (108)
          </a>
          <Link to="/emergency" className="btn-secondary text-xs sm:text-sm py-2 px-4">
            Emergency SOS Hub
          </Link>
        </div>
      </div>

      {/* Main Grid: Topic Selector & Procedure Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Topic List */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-2">
            Emergency Procedures
          </span>
          {FIRST_AID_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                selectedTopic.id === topic.id
                  ? 'bg-teal-50/80 border-[#087f8c] shadow-xs text-slate-900'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>
                <p className="font-bold text-sm">{topic.title}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                  topic.urgency === 'CRITICAL EMERGENCY'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {topic.urgency}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Right Procedure Card */}
        <div className="lg:col-span-2 card-health p-6 sm:p-8 space-y-6 border-teal-200">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-2xl font-black text-slate-800">{selectedTopic.title}</h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-red-100 text-red-800">
                {selectedTopic.urgency}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <strong>Identifying Signs:</strong> {selectedTopic.symptoms}
            </p>
          </div>

          {/* Action Steps */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
              Step-by-Step Action Plan:
            </h3>
            <ol className="space-y-3 text-sm text-slate-700">
              {selectedTopic.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-[#087f8c] font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Do's & Don'ts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                DO:
              </span>
              <ul className="space-y-1 list-disc list-inside">
                {selectedTopic.dos.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 text-xs text-red-900 space-y-2">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-red-800">
                <XCircle className="w-4 h-4 text-red-600" />
                DO NOT:
              </span>
              <ul className="space-y-1 list-disc list-inside">
                {selectedTopic.donts.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Emergency Dial Prompt */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-sm">Need Paramedic Assistance Right Now?</p>
              <p className="text-slate-400">Call national ambulance emergency dispatch.</p>
            </div>
            <a
              href="tel:108"
              className="btn-danger py-2 px-4 text-xs font-bold"
            >
              <PhoneCall className="w-4 h-4" />
              Dial 108 (Toll Free)
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
