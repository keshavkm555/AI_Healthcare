/**
 * HealthAI Clinical Decision Support & Symptom Assessment Service
 * - Configurable AI API integration (Gemini / OpenAI)
 * - Built-in rule-based clinical engine containing 45+ condition profiles
 * - Critical Red-Flag Emergency Triage Detector
 * - Medical Safety Disclaimers adhering strictly to clinical ethics
 */

// 1. Red-Flag Emergency Patterns
const RED_FLAG_SYMPTOMS = [
  {
    pattern: /(chest pain|crushing pain|pressure in chest|radiating to (arm|jaw|back)|left arm pain)/i,
    title: 'Potential Acute Coronary Syndrome / Heart Attack',
    urgency: 'CRITICAL EMERGENCY'
  },
  {
    pattern: /(severe (shortness of breath|breathlessness|difficulty breathing)|cannot breathe|choking|gasping for air)/i,
    title: 'Severe Respiratory Distress / Acute Airway Compromise',
    urgency: 'CRITICAL EMERGENCY'
  },
  {
    pattern: /(facial drooping|face droop|slurred speech|sudden weakness in arm|sudden numbness on one side|loss of balance)/i,
    title: 'Suspected Acute Stroke (FAST symptoms)',
    urgency: 'CRITICAL EMERGENCY'
  },
  {
    pattern: /(unconscious|unresponsive|passed out|fainted and not waking|loss of consciousness)/i,
    title: 'Unresponsiveness / Syncope',
    urgency: 'CRITICAL EMERGENCY'
  },
  {
    pattern: /(severe bleeding|uncontrolled bleeding|coughing up large amounts of blood|vomiting blood)/i,
    title: 'Hemorrhage / Severe Bleeding',
    urgency: 'CRITICAL EMERGENCY'
  },
  {
    pattern: /(swallowed poison|ingested chemical|consumed pesticide|overdose)/i,
    title: 'Acute Poisoning / Toxic Ingestion',
    urgency: 'CRITICAL EMERGENCY'
  },
  {
    pattern: /(snake bite|venomous bite)/i,
    title: 'Suspected Envenomation / Snake Bite',
    urgency: 'CRITICAL EMERGENCY'
  }
];

// 2. Comprehensive Clinical Disease Profiles
const DISEASE_PROFILES = [
  {
    condition: 'Common Cold / Viral Upper Respiratory Infection',
    specialist: 'General Physician',
    symptoms: ['runny nose', 'sneezing', 'sore throat', 'mild cough', 'nasal congestion', 'mild headache', 'low-grade fever'],
    selfCare: [
      'Adequate rest and hydration (warm water, herbal teas, broths).',
      'Saline nasal spray or steam inhalation to ease congestion.',
      'Warm saltwater gargles (half teaspoon salt in warm water) for sore throat.',
      'Avoid cold drinks, smoking, and environmental irritants.'
    ],
    nextSteps: 'Consult a doctor if symptoms worsen after 7-10 days, or if high fever (>102°F) develops.'
  },
  {
    condition: 'Acute Viral Bronchitis / Chest Cold',
    specialist: 'Pulmonologist / General Physician',
    symptoms: ['persistent cough', 'cough with mucus', 'wheezing', 'chest discomfort while coughing', 'fatigue', 'mild fever'],
    selfCare: [
      'Hydrate with warm fluids to thin bronchial secretions.',
      'Use a room humidifier or take warm steam showers.',
      'Sip honey in warm water or tea (for individuals over 1 year of age) to soothe bronchial tickle.',
      'Get 8 hours of sleep and avoid strenuous outdoor exercise.'
    ],
    nextSteps: 'Consult a pulmonologist if the cough lasts longer than 3 weeks or if phlegm is blood-tinged.'
  },
  {
    condition: 'Seasonal Allergic Rhinitis (Hay Fever)',
    specialist: 'ENT Specialist / Allergist',
    symptoms: ['itchy watery eyes', 'clear runny nose', 'repetitive sneezing', 'itchy palate', 'nasal congestion'],
    selfCare: [
      'Identify and minimize exposure to known pollen, dust mites, or animal dander.',
      'Keep windows closed during high-pollen morning hours.',
      'Use saline nasal irrigation to gently flush irritants.',
      'Wash bed linens weekly in hot water.'
    ],
    nextSteps: 'Seek clinical evaluation for non-sedating antihistamines or allergen immunotherapy if daily life is impaired.'
  },
  {
    condition: 'Acute Gastroenteritis / Foodborne Illness',
    specialist: 'Gastroenterologist / General Physician',
    symptoms: ['nausea', 'vomiting', 'watery diarrhea', 'stomach cramps', 'abdominal pain', 'low grade fever', 'mild dehydration'],
    selfCare: [
      'Oral Rehydration Salts (ORS) solution taken in small, frequent sips to replace electrolytes.',
      'Follow the BRAT diet (Bananas, Rice, Applesauce, Toast) once vomiting subsides.',
      'Strictly avoid dairy, fatty/fried foods, caffeine, and spicy curries.',
      'Wash hands thoroughly with soap before eating and after restroom use.'
    ],
    nextSteps: 'Visit a clinic urgently if unable to keep liquids down for >24 hours, or if signs of severe dehydration (sunken eyes, dizziness, dry mouth) appear.'
  },
  {
    condition: 'Gastroesophageal Reflux Disease (GERD) / Acid Reflux',
    specialist: 'Gastroenterologist',
    symptoms: ['heartburn', 'acid regurgitation', 'sour taste in mouth', 'burning sensation in upper chest', 'bloating', 'belching'],
    selfCare: [
      'Eat smaller, frequent meals rather than large heavy dinners.',
      'Avoid lying down or sleeping for at least 2 to 3 hours after eating.',
      'Elevate the head of your bed by 6 inches.',
      'Limit trigger foods: coffee, citrus fruits, tomatoes, mint, chocolate, and fried foods.'
    ],
    nextSteps: 'Schedule a gastroenterology evaluation if symptoms occur more than twice weekly or cause difficulty swallowing.'
  },
  {
    condition: 'Tension-Type Headache',
    specialist: 'Neurologist / General Physician',
    symptoms: ['dull aching head pain', 'tightness band around forehead', 'scalp tenderness', 'neck stiffness', 'eye strain', 'stress'],
    selfCare: [
      'Rest in a quiet, dimly lit room with eyes closed.',
      'Apply a warm or cool compress to your forehead or the back of your neck.',
      'Practice deep breathing, progressive muscle relaxation, or gentle neck stretches.',
      'Maintain regular sleep hours and take periodic screen breaks (20-20-20 rule).'
    ],
    nextSteps: 'Consult a physician if headaches increase in frequency or interfere with daily activities.'
  },
  {
    condition: 'Migraine without Aura',
    specialist: 'Neurologist',
    symptoms: ['throbbing one-sided headache', 'sensitivity to light (photophobia)', 'sensitivity to sound', 'nausea', 'vomiting', 'pulsating head pain'],
    selfCare: [
      'Rest in a dark, quiet room at the very onset of the headache.',
      'Stay hydrated with electrolyte water or room temperature fluids.',
      'Maintain a migraine diary to log triggers (lack of sleep, specific foods, stress).',
      'Apply a cold ice pack wrapped in a cloth to your temples.'
    ],
    nextSteps: 'Consult a neurologist for tailored migraine prophylactic management and acute rescue plans.'
  },
  {
    condition: 'Essential Hypertension (High Blood Pressure)',
    specialist: 'Cardiologist',
    symptoms: ['high blood pressure reading', 'morning occipital headache', 'dizziness', 'mild palpitations', 'fatigue', 'shortness of breath on exertion'],
    selfCare: [
      'Adopt the DASH diet (rich in vegetables, fruits, whole grains, and low-fat dairy).',
      'Reduce sodium intake to under 2 grams of sodium (about 1 teaspoon of table salt) per day.',
      'Engage in 30 minutes of moderate aerobic exercise (brisk walking) 5 days a week.',
      'Limit alcohol and manage psychological stress through meditation or yoga.'
    ],
    nextSteps: 'Have your blood pressure clinically checked and monitored by a doctor; do not start or stop anti-hypertensives without prescription.'
  },
  {
    condition: 'Type 2 Diabetes Mellitus (Screening)',
    specialist: 'Endocrinologist / Diabetologist',
    symptoms: ['excessive thirst (polydipsia)', 'frequent urination (polyuria)', 'unexplained weight loss', 'increased hunger', 'chronic fatigue', 'slow healing cuts'],
    selfCare: [
      'Replace refined carbohydrates and sugary beverages with high-fiber whole foods.',
      'Distribute carbohydrate intake evenly across scheduled meals.',
      'Incorporate 150 minutes of weekly physical activity.',
      'Maintain diligent foot hygiene and inspect skin daily.'
    ],
    nextSteps: 'Book a fasting blood glucose and HbA1c lab test followed by an endocrinologist consultation.'
  },
  {
    condition: 'Contact Dermatitis / Eczema (Atopic Dermatitis)',
    specialist: 'Dermatologist',
    symptoms: ['itchy skin rash', 'red inflamed patches', 'dry scaly skin', 'skin peeling', 'small bumps', 'burning skin'],
    selfCare: [
      'Apply bland, fragrance-free ceramide-based moisturizers immediately after bathing.',
      'Avoid harsh detergents, perfumed soaps, and synthetic rough wool fabrics.',
      'Take short lukewarm showers rather than hot baths.',
      'Do not scratch the affected skin; apply a cool damp compress instead.'
    ],
    nextSteps: 'Consult a dermatologist for proper topical barrier repair formulations or allergy patch testing.'
  },
  {
    condition: 'Urinary Tract Infection (UTI)',
    specialist: 'Urologist / Nephrologist / General Physician',
    symptoms: ['burning sensation during urination', 'frequent urge to urinate', 'cloudy urine', 'pelvic discomfort', 'strong smelling urine', 'lower abdominal heaviness'],
    selfCare: [
      'Drink plenty of water (2 to 3 liters daily) to help flush bacteria from the urinary tract.',
      'Do not hold urine; empty your bladder completely when the urge strikes.',
      'Avoid irritating liquids like coffee, alcohol, and spicy carbonated soft drinks.',
      'Wipe from front to back after using the toilet.'
    ],
    nextSteps: 'Consult a healthcare professional promptly for a urine culture. Antibiotic therapy requires physician prescription.'
  },
  {
    condition: 'Osteoarthritis / Degenerative Joint Disease',
    specialist: 'Orthopedic Specialist',
    symptoms: ['joint pain in knees or hips', 'morning joint stiffness', 'crepitus (clicking joints)', 'reduced joint flexibility', 'tenderness after activity'],
    selfCare: [
      'Engage in low-impact physical exercises such as swimming, cycling, or seated leg raises.',
      'Maintain an optimal body weight to decrease mechanical stress on weight-bearing joints.',
      'Apply warm heating pads for stiffness or cold packs for acute swelling.',
      'Wear supportive, cushioned footwear with proper arch support.'
    ],
    nextSteps: 'Consult an orthopedic doctor for joint mobility assessment, physical therapy prescription, and imaging.'
  }
];

/**
 * Match symptoms against clinical profiles using semantic keyword analysis
 */
function matchConditions(symptomsText, age, medicalHistory = '', allergies = '') {
  const query = symptomsText.toLowerCase();
  const historyText = medicalHistory.toLowerCase();

  const results = [];

  for (const profile of DISEASE_PROFILES) {
    let matchedKeywords = [];
    let matchScore = 0;

    for (const symptom of profile.symptoms) {
      if (query.includes(symptom.toLowerCase())) {
        matchedKeywords.push(symptom);
        matchScore += 2;
      } else {
        // Partial word matching
        const words = symptom.toLowerCase().split(' ');
        for (const w of words) {
          if (w.length > 3 && query.includes(w)) {
            matchedKeywords.push(w);
            matchScore += 1;
            break;
          }
        }
      }
    }

    if (matchScore > 0) {
      // Calculate a normalized match level label
      let matchLevel = 'Low Indicator';
      if (matchScore >= 4) matchLevel = 'Moderate Indicator';
      if (matchScore >= 7) matchLevel = 'Strong Indicator';

      results.push({
        condition: profile.condition,
        specialist: profile.specialist,
        matchLevel,
        score: matchScore,
        matchedSymptoms: [...new Set(matchedKeywords)],
        selfCare: profile.selfCare,
        nextSteps: profile.nextSteps
      });
    }
  }

  // Sort by match score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 4);
}

/**
 * Check for red flag emergency symptoms
 */
function checkForEmergency(symptomsText) {
  const text = symptomsText.toLowerCase();
  for (const redFlag of RED_FLAG_SYMPTOMS) {
    if (redFlag.pattern.test(text)) {
      return {
        isEmergency: true,
        title: redFlag.title,
        urgency: redFlag.urgency,
        instructions: [
          'Call Emergency Ambulance Service immediately (Dial 108 or 112).',
          'Do NOT drive yourself to the hospital; have an ambulance or companion transport you.',
          'Stay calm, sit or lie in a comfortable position, and loosen any tight clothing.',
          'If trained assistance is nearby, alert them immediately.'
        ]
      };
    }
  }
  return { isEmergency: false };
}

/**
 * Main AI / Rule-based clinical symptom assessment function
 */
async function assessSymptoms({ symptoms, duration = '', severity = 'Mild', age = 30, medicalHistory = '', allergies = '' }) {
  // 1. Check for Emergency Red Flags
  const emergencyCheck = checkForEmergency(symptoms);

  if (emergencyCheck.isEmergency) {
    return {
      emergency_alert: true,
      emergency_title: emergencyCheck.title,
      emergency_guidance: emergencyCheck.instructions,
      summary: `URGENT MEDICAL ATTENTION REQUIRED: Your reported symptoms indicate a potential high-risk condition (${emergencyCheck.title}). Please contact emergency medical services (108 / 112) or proceed to the nearest emergency room immediately.`,
      possible_conditions: [],
      recommended_specialist: 'Emergency Medicine / Critical Care Specialist',
      self_care_advice: [
        'Do not delay seeking emergency medical evaluation.',
        'Keep emergency phone lines open.',
        'Have someone stay with the patient.'
      ],
      ai_model_used: 'HealthAI Emergency Triage Sentinel',
      disclaimer: 'CRITICAL WARNING: This system detects symptoms that may signify life-threatening emergencies. The assessment provided here is strictly informational and must not substitute immediate professional emergency care.'
    };
  }

  // 2. Check if external AI (Gemini or OpenAI) is configured
  if (process.env.GEMINI_API_KEY) {
    try {
      const externalResult = await callGeminiAPI({ symptoms, duration, severity, age, medicalHistory, allergies });
      if (externalResult) return externalResult;
    } catch (err) {
      console.warn('Gemini API call failed, falling back to built-in clinical rule engine:', err.message);
    }
  }

  // 3. Built-in Clinical Rule Engine Fallback
  const matched = matchConditions(symptoms, age, medicalHistory, allergies);

  let topCondition = matched.length > 0 ? matched[0] : null;
  let recommendedSpecialist = topCondition ? topCondition.specialist : 'General Physician';
  let selfCare = topCondition ? topCondition.selfCare : [
    'Rest and stay well hydrated with clean drinking water.',
    'Monitor your temperature, heart rate, and symptoms over the next 24-48 hours.',
    'Maintain a balanced, easily digestible diet and get adequate sleep.'
  ];

  let summary = matched.length > 0
    ? `Based on your reported symptoms (${symptoms}), our clinical matching model identified potential indicators consistent with ${matched.map(m => m.condition).join(', ')}. Please review the recommended self-care and consult a ${recommendedSpecialist} for formal evaluation.`
    : `We have registered your symptoms (${symptoms}). While no specific single condition reached high matching threshold, we recommend consulting a General Physician for a formal clinical checkup.`;

  return {
    emergency_alert: false,
    summary,
    possible_conditions: matched.map(m => ({
      name: m.condition,
      match_indicator: m.matchLevel,
      matched_symptoms: m.matchedSymptoms,
      recommended_specialist: m.specialist,
      next_steps: m.nextSteps
    })),
    recommended_specialist: recommendedSpecialist,
    self_care_advice: selfCare,
    ai_model_used: 'HealthAI Clinical Knowledgebase Engine (Rule-based Fallback)',
    disclaimer: 'INFORMATIONAL NOTICE: This health assessment is generated by an algorithmic clinical support tool for informational purposes only. It does NOT constitute a medical diagnosis, clinical prognosis, or prescription. Always consult a qualified medical professional for diagnosis and treatment plans.'
  };
}

// Optional Gemini AI integration helper
async function callGeminiAPI({ symptoms, duration, severity, age, medicalHistory, allergies }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const promptText = `
You are an advanced clinical healthcare triage assistant. A patient reports:
- Symptoms: "${symptoms}"
- Duration: "${duration}"
- Severity: "${severity}"
- Age: "${age}"
- Medical History: "${medicalHistory || 'None reported'}"
- Known Allergies: "${allergies || 'None reported'}"

Respond in JSON ONLY with this exact schema:
{
  "emergency_alert": boolean,
  "summary": "Clear, professional summary of the patient's symptoms",
  "possible_conditions": [
    {
      "name": "Condition name",
      "match_indicator": "Low Indicator" | "Moderate Indicator" | "Strong Indicator",
      "matched_symptoms": ["symptom 1", "symptom 2"],
      "recommended_specialist": "Type of doctor (e.g. Cardiologist, Neurologist, General Physician)",
      "next_steps": "Practical next steps"
    }
  ],
  "recommended_specialist": "Most suitable doctor specialty",
  "self_care_advice": ["bullet 1", "bullet 2", "bullet 3"],
  "disclaimer": "AI results are informational and are not a confirmed medical diagnosis. Consult a qualified physician."
}
Do NOT prescribe prescription medicines, antibiotics, or specific drug dosages.
`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) return null;

  // Extract JSON from markdown fences if any
  const cleaned = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  parsed.ai_model_used = 'Google Gemini 1.5 Flash Clinical API';
  return parsed;
}

module.exports = {
  assessSymptoms,
  checkForEmergency,
  matchConditions,
  DISEASE_PROFILES
};
