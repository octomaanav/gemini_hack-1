// Section listed in TOC (before full parsing)
export interface TOCSection {
  sectionId: string;
  title: string;
  page?: number;
}

// Basic chapter info from TOC with optional sections
export interface ChapterInfo {
  title: string;
  startPage: number;
  tocSections: TOCSection[] | null;
}

// Section within a unit/chapter (after full parsing)
export interface Section {
  sectionId: string;
  title: string;
  description: string;
  learningGoals: string[];
}

// Full parsed unit structure
export interface ParsedUnit {
  unitTitle: string;
  unitDescription: string;
  sections: Section[];
}

// API response types
export interface ChaptersResponse {
  chapters: ChapterInfo[];
}

export interface FullParseResponse {
  success: boolean;
  totalUnits: number;
  units: ParsedUnit[];
}
