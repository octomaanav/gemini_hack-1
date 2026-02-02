/**
 * Command Executor Service
 * Handles execution of all voice commands/tool calls from Gemini
 */
import type { SubjectWithChapters } from '../types';

export interface CommandExecutorDependencies {
  navigate: (path: string) => void;
  user: any;
  availableSubjects: SubjectWithChapters[];
}

export class CommandExecutor {
  private deps: CommandExecutorDependencies;

  constructor(dependencies: CommandExecutorDependencies) {
    this.deps = dependencies;
    this.logDependencies();
  }

  /**
   * Debug: Log current dependencies state
   */
  private logDependencies() {
    console.log('[CommandExecutor] Dependencies:', {
      hasUser: !!this.deps.user,
      userId: this.deps.user?.id,
      userProfile: this.deps.user?.profile,
      subjectsCount: this.deps.availableSubjects.length,
      subjects: this.deps.availableSubjects.map(s => ({
        name: s.name,
        slug: s.slug,
        chaptersCount: s.chapters.length
      }))
    });
  }

  /**
   * Execute a tool call from Gemini
   */
  async executeToolCall(toolCall: any): Promise<any[]> {
    
    const calls = toolCall.functionCalls || [];
    const responses: any[] = [];
    
    for (const call of calls) {
      
      try {
        let success = false;
        let result: any = {};

        switch (call.name) {
          case 'navigate':
            success = await this.navigate(call.args.destination);
            result = { success, destination: call.args.destination };
            break;

          case 'openLesson':
            success = await this.openLesson(call.args.subject, call.args.chapterNumber);
            result = { success, subject: call.args.subject, chapterNumber: call.args.chapterNumber };
            break;

          case 'lessonControl':
            success = this.lessonControl(call.args.action);
            result = { success, action: call.args.action };
            break;

          case 'listSubjects':
            result = await this.listSubjects();
            success = true;
            break;

          case 'listChapters':
            result = await this.listChapters(call.args.subject);
            success = true;
            break;
          
          case 'toggleFocusMode':
            success = this.toggleFocusMode(call.args.enabled);
            result = { success, enabled: call.args.enabled };
            break;

          case 'openStoryMode':
            success = this.openStoryMode();
            result = { success };
            break;

          case 'openBraille':
            success = this.openBraille();
            result = { success };
            break;

          default:
            console.warn('[CommandExecutor] Unknown tool:', call.name);
            result = { success: false, error: 'Unknown tool' };
        }

        responses.push({
          id: call.id,
          name: call.name,
          response: result
        });

      } catch (error: any) {
        console.error('[CommandExecutor] Error executing tool:', call.name, error);
        responses.push({
          id: call.id,
          name: call.name,
          response: { success: false, error: error.message }
        });
      }
    }
    
    return responses;
  }

  private toggleFocusMode(enabled?: boolean): boolean {
    try {
      const event = new CustomEvent('focus-mode-toggle', { detail: { value: enabled } });
      window.dispatchEvent(event);
      return true;
    } catch (error) {
      console.error('[CommandExecutor] Failed to toggle focus mode:', error);
      return false;
    }
  }

  private openStoryMode(): boolean {
    try {
      const event = new CustomEvent('story-open');
      window.dispatchEvent(event);
      return true;
    } catch (error) {
      console.error('[CommandExecutor] Failed to open story mode:', error);
      return false;
    }
  }

  private openBraille(): boolean {
    try {
      const event = new CustomEvent('braille-open');
      window.dispatchEvent(event);
      return true;
    } catch (error) {
      console.error('[CommandExecutor] Failed to open braille:', error);
      return false;
    }
  }

  /**
   * Navigate to a page in the app
   */
  private async navigate(destination: string): Promise<boolean> {
    try {
      const routes: Record<string, string> = {
        dashboard: '/dashboard',
        home: '/',
        setup: '/setup',
        'accessibility-guide': '/accessibility-guide',
      };
      
      const normalizedDestination = destination?.toLowerCase().replace(/\s+/g, '-');
      const route = routes[destination] || routes[normalizedDestination];
      if (route) {
        this.deps.navigate(route);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[CommandExecutor] Navigation error:', error);
      return false;
    }
  }

  /**
   * Open a specific lesson by subject and chapter number
   */
  private async openLesson(subjectName: string, chapterNumber: number): Promise<boolean> {
    try {
      if (!this.deps.user?.profile?.classId) {
        console.error('[CommandExecutor] No user profile');
        return false;
      }

      // Find subject (case-insensitive partial match)
      const subject = this.deps.availableSubjects.find(s => 
        s.name.toLowerCase().includes(subjectName.toLowerCase())
      );

      if (!subject) {
        console.error('[CommandExecutor] Subject not found:', subjectName);
        return false;
      }

      // Find chapter by number (sorted by sortOrder)
      const sortedChapters = [...subject.chapters].sort((a, b) => 
        (a.sortOrder || 0) - (b.sortOrder || 0)
      );
      
      const chapter = sortedChapters[chapterNumber - 1];

      if (!chapter) {
        console.error('[CommandExecutor] Chapter not found at index:', chapterNumber - 1);
        return false;
      }

      // Build route: /:classId/:subjectSlug/:chapterSlug
      const route = `/${this.deps.user.profile.classId}/${subject.slug}/${chapter.slug}`;
      this.deps.navigate(route);
      
      return true;
    } catch (error) {
      console.error('[CommandExecutor] Open lesson error:', error);
      return false;
    }
  }

  /**
   * Control lesson playback via voice commands
   */
  private lessonControl(action: string): boolean {
    
    try {
      // Dispatch custom event that LessonViewer listens for
      const event = new CustomEvent('lesson-control', { 
        detail: { action } 
      });
      window.dispatchEvent(event);
      return true;
    } catch (error) {
      console.error('[CommandExecutor] Failed to dispatch event:', error);
      return false;
    }
  }

  /**
   * List available subjects
   */
  private async listSubjects(): Promise<any> {
    try {
      
      if (this.deps.availableSubjects.length === 0) {
        console.warn('[CommandExecutor] No subjects loaded!');
        return { 
          subjects: [], 
          error: 'No subjects available. Please log in and complete setup.' 
        };
      }
      
      const subjectNames = this.deps.availableSubjects.map(s => s.name);
      return { subjects: subjectNames };
    } catch (error) {
      console.error('[CommandExecutor] List subjects error:', error);
      return { subjects: [], error: 'Failed to load subjects' };
    }
  }

  /**
   * List available chapters
   */
  private async listChapters(subjectName?: string): Promise<any> {
    try {
      
      if (this.deps.availableSubjects.length === 0) {
        console.warn('[CommandExecutor] No subjects loaded!');
        return { 
          chapters: [], 
          error: 'No subjects available. Please log in and complete setup.' 
        };
      }
      
      if (subjectName) {
        
        const subject = this.deps.availableSubjects.find(s => 
          s.name.toLowerCase().includes(subjectName.toLowerCase())
        );
        
        if (subject) {
          if (subject.chapters.length === 0) {
            console.warn('[CommandExecutor] Subject has no chapters!');
            return { 
              chapters: [], 
              subject: subject.name,
              error: `${subject.name} has no chapters yet` 
            };
          }
          
          const chapterNames = subject.chapters.map(c => c.name);
          return { chapters: chapterNames, subject: subject.name };
        }
        
        console.error('[CommandExecutor] Subject not found:', subjectName);
        return { 
          chapters: [], 
          error: `Subject "${subjectName}" not found. Available: ${this.deps.availableSubjects.map(s => s.name).join(', ')}` 
        };
      } else {
        // List all chapters across all subjects
        const allChapters: string[] = [];
        let totalChapters = 0;
        
        this.deps.availableSubjects.forEach(subject => {
          subject.chapters.forEach(chapter => {
            allChapters.push(`${subject.name}: ${chapter.name}`);
            totalChapters++;
          });
        });
        
        if (totalChapters === 0) {
          console.warn('[CommandExecutor] ⚠️ No chapters in any subject!');
          return { 
            chapters: [], 
            error: 'No chapters available. Database may need seeding.' 
          };
        }
        
        return { chapters: allChapters };
      }
    } catch (error) {
      console.error('[CommandExecutor] List chapters error:', error);
      return { chapters: [], error: 'Failed to load chapters' };
    }
  }

  /**
   * Update dependencies (useful when subjects/user change)
   */
  updateDependencies(dependencies: Partial<CommandExecutorDependencies>) {
    this.deps = { ...this.deps, ...dependencies };
    this.logDependencies();
  }
}
