// Curriculum data - fetched from API
// This file provides helper functions and static accessibility options

import type { 
  CurriculumWithGrades, 
  GradeEntity, 
  SubjectWithChapters,
  AccessibilityOption 
} from '../types';

const API_BASE = 'http://localhost:8000/api';

// =============================================================================
// API FETCHING FUNCTIONS
// =============================================================================

/**
 * Fetch all curricula with their grades
 */
export async function fetchCurricula(): Promise<CurriculumWithGrades[]> {
  const response = await fetch(`${API_BASE}/curriculum`);
  if (!response.ok) {
    throw new Error('Failed to fetch curricula');
  }
  return response.json();
}

/**
 * Fetch a single curriculum by ID
 */
export async function fetchCurriculumById(id: string): Promise<CurriculumWithGrades | null> {
  const response = await fetch(`${API_BASE}/curriculum/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error('Failed to fetch curriculum');
  }
  return response.json();
}

/**
 * Fetch a single curriculum by slug (cbse, icse, ib, state)
 */
export async function fetchCurriculumBySlug(slug: string): Promise<CurriculumWithGrades | null> {
  const response = await fetch(`${API_BASE}/curriculum/by-slug/${slug}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error('Failed to fetch curriculum');
  }
  return response.json();
}

/**
 * Fetch subjects with chapters for a specific class
 */
export async function fetchSubjectsWithChapters(
  curriculumId: string, 
  classId: string
): Promise<SubjectWithChapters[]> {
  const response = await fetch(
    `${API_BASE}/curriculum/${curriculumId}/grades/${classId}/subjects`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch subjects');
  }
  return response.json();
}

// =============================================================================
// ACCESSIBILITY OPTIONS (Static - doesn't need DB)
// =============================================================================

export const accessibilityOptions: AccessibilityOption[] = [
  { 
    id: 'blind', 
    name: 'Visual Impairment', 
    icon: '👁️', 
    description: 'Screen reader support, Braille output, audio descriptions' 
  },
  { 
    id: 'deaf', 
    name: 'Hearing Impairment', 
    icon: '👂', 
    description: 'Visual-focused content, captions, sign language support' 
  },
  { 
    id: 'neurodivergent', 
    name: 'Neurodivergent', 
    icon: '🧠', 
    description: 'ADHD, Autism, Dyslexia - simplified layouts, step-by-step learning' 
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get grades from a curriculum response
 */
export function getGradesFromCurriculum(curriculum: CurriculumWithGrades | null): GradeEntity[] {
  return curriculum?.grades || [];
}
