const { pool } = require('../config/db');
const { assessSymptoms } = require('../services/aiService');

// Perform Symptom Assessment
const checkSymptoms = async (req, res, next) => {
  try {
    const {
      symptoms,
      duration = 'A few days',
      severity = 'Mild',
      age,
      medicalHistory,
      allergies,
      saveToRecords = false
    } = req.body;

    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please describe the symptoms you are experiencing.'
      });
    }

    // Call clinical AI service
    const assessmentResult = await assessSymptoms({
      symptoms: symptoms.trim(),
      duration,
      severity,
      age: age || 30,
      medicalHistory,
      allergies
    });

    let savedAssessmentId = null;

    // If authenticated user requested to save or logged in
    if (req.user && (saveToRecords || req.body.autoSave)) {
      const [insertResult] = await pool.query(
        `INSERT INTO health_assessments (
          user_id, symptoms, duration, severity, age, medical_history, allergies,
          possible_conditions, recommended_specialist, self_care_advice,
          emergency_alert, emergency_guidance, ai_model_used
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          symptoms.trim(),
          duration,
          severity,
          age || null,
          medicalHistory || null,
          allergies || null,
          JSON.stringify(assessmentResult.possible_conditions || []),
          assessmentResult.recommended_specialist,
          JSON.stringify(assessmentResult.self_care_advice || []),
          assessmentResult.emergency_alert ? 1 : 0,
          assessmentResult.emergency_guidance ? JSON.stringify(assessmentResult.emergency_guidance) : null,
          assessmentResult.ai_model_used
        ]
      );

      savedAssessmentId = insertResult.insertId;

      // Also create an entry in medical_records timeline
      await pool.query(
        `INSERT INTO medical_records (user_id, record_type, title, description, reference_id, doctor_or_facility, record_date)
         VALUES (?, 'Health Assessment', ?, ?, ?, 'HealthAI Clinical Engine', CURRENT_DATE())`,
        [
          req.user.id,
          `AI Assessment: ${assessmentResult.recommended_specialist} Consultation Recommended`,
          assessmentResult.summary,
          `ASM-${savedAssessmentId}`
        ]
      );
    }

    return res.json({
      success: true,
      assessment: {
        ...assessmentResult,
        id: savedAssessmentId
      }
    });
  } catch (error) {
    next(error);
  }
};

// Save an assessment explicitly
const saveAssessment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      symptoms,
      duration,
      severity,
      age,
      medical_history,
      allergies,
      possible_conditions,
      recommended_specialist,
      self_care_advice,
      emergency_alert,
      ai_model_used
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO health_assessments (
        user_id, symptoms, duration, severity, age, medical_history, allergies,
        possible_conditions, recommended_specialist, self_care_advice, emergency_alert, ai_model_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        symptoms,
        duration || null,
        severity || 'Mild',
        age || null,
        medical_history || null,
        allergies || null,
        JSON.stringify(possible_conditions || []),
        recommended_specialist,
        JSON.stringify(self_care_advice || []),
        emergency_alert ? 1 : 0,
        ai_model_used || 'HealthAI Clinical Engine'
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Assessment saved to your medical records.',
      assessmentId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

// Get User's Assessment History
const getMyAssessments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [assessments] = await pool.query(
      `SELECT * FROM health_assessments WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    // Parse JSON fields
    const parsed = assessments.map(item => ({
      ...item,
      possible_conditions: typeof item.possible_conditions === 'string' 
        ? JSON.parse(item.possible_conditions) 
        : item.possible_conditions,
      self_care_advice: typeof item.self_care_advice === 'string'
        ? JSON.parse(item.self_care_advice)
        : item.self_care_advice,
      emergency_guidance: typeof item.emergency_guidance === 'string'
        ? JSON.parse(item.emergency_guidance)
        : item.emergency_guidance
    }));

    return res.json({
      success: true,
      assessments: parsed
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Assessment
const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM health_assessments WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assessment record not found.' });
    }

    // Ownership check
    if (req.user.role === 'patient' && rows[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const item = rows[0];
    item.possible_conditions = typeof item.possible_conditions === 'string' ? JSON.parse(item.possible_conditions) : item.possible_conditions;
    item.self_care_advice = typeof item.self_care_advice === 'string' ? JSON.parse(item.self_care_advice) : item.self_care_advice;
    item.emergency_guidance = typeof item.emergency_guidance === 'string' ? JSON.parse(item.emergency_guidance) : item.emergency_guidance;

    return res.json({
      success: true,
      assessment: item
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkSymptoms,
  saveAssessment,
  getMyAssessments,
  getAssessmentById
};
