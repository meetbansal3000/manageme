import React from 'react';
import { StudyIntelligenceEngineTab } from './StudyIntelligenceEngineTab';
import { UserTrackerData } from '../hooks/useFirestoreData';

export interface StudyEngineProps {
  userData: UserTrackerData;
  updateData?: (data: Partial<UserTrackerData>) => void;
}

/**
 * StudyEngine - Active AI Teaching, Testing & Real-Time Scoring Suite
 * Connects uploaded textbook notes and syllabus documents directly to
 * structured topic breakdowns ("Teach Me"), adaptive 5-question quizzes ("Test Me"),
 * and real-time score evaluations with weak points feedback ("Score & Feedback").
 */
export const StudyEngine: React.FC<StudyEngineProps> = ({ userData, updateData }) => {
  return <StudyIntelligenceEngineTab userData={userData} updateData={updateData} />;
};

export default StudyEngine;
