// Curriculum data - fetched from API
// This file provides helper functions

import type { 
  CurriculumWithGrades, 
  GradeEntity, 
  SubjectWithChapters
} from '../types';

import { apiUrl } from '../utils/api';

const API_BASE = apiUrl('/api');

// =============================================================================
// API FETCHING FUNCTIONS
// =============================================================================

/**
 * Fetch all curricula with their grades
 */
export async function fetchCurricula(lang?: string): Promise<CurriculumWithGrades[]> {
  const response = await fetch(`${API_BASE}/curriculum${lang ? `?lang=${lang}` : ''}`);
  if (!response.ok) {
    throw new Error('Failed to fetch curricula');
  }
  return response.json();
}

/**
 * Fetch a single curriculum by ID
 */
export async function fetchCurriculumById(id: string, lang?: string): Promise<CurriculumWithGrades | null> {
  const response = await fetch(`${API_BASE}/curriculum/${id}${lang ? `?lang=${lang}` : ''}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error('Failed to fetch curriculum');
  }
  return response.json();
}

/**
 * Fetch a single curriculum by slug (cbse, icse, ib, state)
 */
export async function fetchCurriculumBySlug(slug: string, lang?: string): Promise<CurriculumWithGrades | null> {
  const response = await fetch(`${API_BASE}/curriculum/by-slug/${slug}${lang ? `?lang=${lang}` : ''}`);
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
  classId: string,
  lang?: string
): Promise<SubjectWithChapters[]> {
  const response = await fetch(
    `${API_BASE}/curriculum/${curriculumId}/grades/${classId}/subjects${lang ? `?lang=${lang}` : ''}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch subjects');
  }
  return response.json();
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get grades from a curriculum response
 */
export function getGradesFromCurriculum(curriculum: CurriculumWithGrades | null): GradeEntity[] {
  return curriculum?.grades || [];
}
