/**
 * Session-Wide Question History Tracker
 * Prevents questions from repeating within the same browser / practice / diagnostic session.
 */

const SESSION_STORAGE_KEY = 'iready_diagnostic_session_seen_qids_v1';

class SessionQuestionHistory {
  private seenIds: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.seenIds = new Set(parsed);
          }
        }
      }
    } catch {
      // Fallback to in-memory set if sessionStorage is unavailable
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify(Array.from(this.seenIds))
        );
      }
    } catch {
      // Silently ignore storage quota or disabled storage
    }
  }

  /**
   * Mark a question ID as seen in the current session
   */
  public markSeen(questionId: string): void {
    if (!questionId) return;
    this.seenIds.add(questionId);
    this.saveToStorage();
  }

  /**
   * Mark multiple question IDs as seen
   */
  public markMultipleSeen(questionIds: string[]): void {
    questionIds.forEach((id) => this.seenIds.add(id));
    this.saveToStorage();
  }

  /**
   * Check if a question has been asked or practiced in the current session
   */
  public hasSeen(questionId: string): boolean {
    return this.seenIds.has(questionId);
  }

  /**
   * Get all question IDs seen in this session
   */
  public getSeenIds(): Set<string> {
    return new Set(this.seenIds);
  }

  /**
   * Get count of unique questions seen in this session
   */
  public getSeenCount(): number {
    return this.seenIds.size;
  }

  /**
   * Clear / Reset session history (for a clean slate)
   */
  public clear(): void {
    this.resetSession();
  }

  /**
   * Reset session history (for a clean slate)
   */
  public resetSession(): void {
    this.seenIds.clear();
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }
}

export const sessionHistory = new SessionQuestionHistory();
