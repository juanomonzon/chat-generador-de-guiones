import { SavedScript, TimelineData } from '../types';

export const STORAGE_KEY = 'radarcultural_saved_scripts_v1';

export const extractCopyText = (content: string): string => {
  const clean = content.replace(/<timeline_json>[\s\S]*?<\/timeline_json>/g, '').trim();
  const regex = /(?:(?:\d+\.\s*)?\*{0,2}COPY(?: PARA REDES)?\*{0,2}\s*:?\s*\n?)([\s\S]*?)(?=(?:\d+\.\s*)?\*{0,2}(?:BLOQUE JSON|GUION TÉCNICO|BREVE INTRO)\*{0,2}|<timeline_json>|$)/i;
  const match = clean.match(regex);
  if (match && match[1] && match[1].trim()) {
    return match[1].trim();
  }
  return clean;
};

export const extractTimelineData = (content: string): TimelineData | null => {
  try {
    const parts = content.split(/<timeline_json>|<\/timeline_json>/);
    for (let i = 1; i < parts.length; i += 2) {
      let jsonStr = parts[i].trim();
      if (jsonStr.includes('{')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('{'));
      }
      if (jsonStr.lastIndexOf('}') !== -1) {
        jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf('}') + 1);
      }
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.layers) return parsed as TimelineData;
    }
  } catch (e) {
    console.error("Error parsing timeline JSON:", e);
  }
  return null;
};

export const extractScriptTitle = (content: string, fallbackPrompt: string): string => {
  const clean = content.replace(/<timeline_json>[\s\S]*?<\/timeline_json>/g, '').trim();
  const introMatch = clean.match(/(?:(?:\d+\.\s*)?\*{0,2}(?:BREVE INTRO|CONCEPTO|TÍTULO)\*{0,2}\s*:?\s*\n?)([^\n\r*]+)/i);
  if (introMatch && introMatch[1] && introMatch[1].trim().length > 3) {
    return introMatch[1].trim().replace(/^["']|["']$/g, '');
  }
  const firstLine = clean.split('\n').find(line => line.trim().length > 5 && !line.includes('1.') && !line.includes('🎬'));
  if (firstLine && firstLine.trim().length < 80) {
    return firstLine.replace(/[*#_`]/g, '').trim();
  }
  return fallbackPrompt || 'Guion de Reel';
};

export const getSavedScripts = (): SavedScript[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error loading saved scripts from localStorage", e);
  }
  return [];
};

export const saveScriptToStorage = (content: string, userPrompt: string): SavedScript | null => {
  const isScript = content.includes('🎬') || content.includes('CLIP:') || content.includes('timeline_json') || content.includes('COPY') || content.includes('GUION');
  if (!isScript) return null;

  const newScript: SavedScript = {
    id: 'script_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    dateFormatted: new Date().toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    prompt: userPrompt,
    title: extractScriptTitle(content, userPrompt),
    content: content,
    copy: extractCopyText(content),
    timelineData: extractTimelineData(content),
  };

  try {
    const current = getSavedScripts();
    const updated = [newScript, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newScript;
  } catch (e) {
    console.error("Failed to save script to localStorage:", e);
    return null;
  }
};

export const deleteSavedScript = (id: string): SavedScript[] => {
  try {
    const current = getSavedScripts();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to delete script:", e);
    return getSavedScripts();
  }
};

export const clearAllSavedScripts = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear scripts:", e);
  }
};

export const exportScriptsToJsonFile = (): void => {
  const scripts = getSavedScripts();
  const blob = new Blob([JSON.stringify(scripts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `radar-cultural-guiones-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
