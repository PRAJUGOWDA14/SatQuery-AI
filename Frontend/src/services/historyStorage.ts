import { HistoryItem, FinalAnalysisResult } from '../types';
import opticalImg from '../assets/images/multimodal_satellite_optical_1790235611853.jpg';
import { API_BASE_URL } from './api';

const STORAGE_KEY = 'satquery_analysis_history';

/**
 * Fetch analysis history.
 * Attempts to load from backend API if available, falling back to local storage.
 * If local storage has never been initialized, seeds one initial test item so the card UI can be viewed immediately.
 * If all items are deleted, it stays empty.
 */
export async function getAnalysisHistory(): Promise<HistoryItem[]> {
  // 1. Check if backend API has an active history endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch {
    // Backend endpoint not active; continue with local storage
  }

  // 2. Load from localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    return [];
  } catch (err) {
    console.warn('[SatQuery History] Local storage access error:', err);
    return [];
  }
}

/**
 * Save completed analysis into history
 */
export async function saveAnalysisToHistory(result: FinalAnalysisResult): Promise<HistoryItem> {
  const now = new Date();
  const dateFormatted = `${now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC`;

  const newItem: HistoryItem = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    filename: result.image?.filename || 'satellite_scene.tif',
    thumbnailUrl: result.overlayUrl || result.image?.previewUrl || opticalImg,
    query: result.query || 'Unspecified Query',
    analysisType: result.analysisType || 'Visual Analysis',
    date: dateFormatted,
    status: 'Completed',
    result: {
      ...result,
      // Ensure the image object is serializable by cloning metadata
      image: {
        ...result.image,
        file: undefined as any, // File objects cannot be serialized to JSON
      },
    },
  };

  // Attempt to persist to backend
  try {
    fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch(() => {});
  } catch {}

  // Persist to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const list: HistoryItem[] = stored ? JSON.parse(stored) : [];
    // Prepend newest first
    const updated = [newItem, ...list.filter((item) => item.id !== newItem.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[SatQuery History] Failed to write to localStorage:', err);
  }

  return newItem;
}

/**
 * Delete single analysis record from history
 */
export async function deleteAnalysisFromHistory(id: string): Promise<HistoryItem[]> {
  // Attempt to delete on backend
  try {
    fetch(`${API_BASE_URL}/history/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  } catch {}

  // Update localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const list: HistoryItem[] = stored ? JSON.parse(stored) : [];
    const updated = list.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('[SatQuery History] Failed to delete from localStorage:', err);
    return [];
  }
}

/**
 * Clear all history records (shows empty state)
 */
export function clearAllAnalysisHistory(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.warn('[SatQuery History] Failed to clear history:', err);
  }
}
