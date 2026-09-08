import React, { useState } from 'react';
import { 
  Search, Trash2, Folder, Clock, Copy, Check, Eye, Maximize2, 
  Film, Sparkles, Download, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedScript } from '../types';
import { exportScriptsToJsonFile } from '../utils/scriptStorage';

interface SavedScriptsViewProps {
  scripts: SavedScript[];
  onDeleteScript: (id: string) => void;
  onClearAll: () => void;
  onOpenModal: (script: SavedScript) => void;
  onGoToChat: () => void;
  onCopyText: (text: string) => void;
  onCopyCopy: (content: string, id: string) => void;
  copiedCopyId: string | number | null;
}

export const SavedScriptsView: React.FC<SavedScriptsViewProps> = ({
  scripts,
  onDeleteScript,
  onClearAll,
  onOpenModal,
  onGoToChat,
  onCopyText,
  onCopyCopy,
  copiedCopyId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [deleteSingleId, setDeleteSingleId] = useState<string | null>(null);

  const filteredScripts = scripts.filter((script) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      script.title.toLowerCase().includes(q) ||
      script.prompt.toLowerCase().includes(q) ||
      script.content.toLowerCase().includes(q) ||
      script.dateFormatted.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c0c]">
      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-[#272727] p-6 rounded-2xl max-w-sm w-full shadow-2xl flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-white mb-1">¿Borrar todos los guiones?</h3>
                <p className="text-xs text-[#888] leading-relaxed">
                  Se eliminarán definitivamente los <strong>{scripts.length}</strong> guiones guardados en tu historial local.
                </p>
              </div>
              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#1c1c1c] border border-[#272727] text-xs font-medium text-[#efefef] hover:bg-[#252525] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowClearModal(false);
                    onClearAll();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Sí, borrar todos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Single Confirmation Modal */}
      <AnimatePresence>
        {deleteSingleId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-[#272727] p-6 rounded-2xl max-w-sm w-full shadow-2xl flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-white mb-1">¿Borrar este guion?</h3>
                <p className="text-xs text-[#888]">
                  Esta acción eliminará el guion seleccionado permanentemente.
                </p>
              </div>
              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => setDeleteSingleId(null)}
                  className="flex-1 py-2 px-4 rounded-xl bg-[#1c1c1c] border border-[#272727] text-xs font-medium text-[#efefef] hover:bg-[#252525] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const id = deleteSingleId;
                    setDeleteSingleId(null);
                    onDeleteScript(id);
                  }}
                  className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Borrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Toolbar in Saved Scripts */}
      <div className="p-4 border-b border-[#272727] flex flex-wrap gap-3 items-center justify-between bg-[#141414] shrink-0">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            type="text"
            placeholder="Buscar por título, texto, fecha o prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1c1c1c] border border-[#272727] rounded-xl pl-9 pr-8 py-2 text-xs text-[#efefef] placeholder-[#666] focus:border-[#c8f060]/50 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#efefef] text-xs font-mono cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#777] mr-1">
            {filteredScripts.length} {filteredScripts.length === 1 ? 'guion' : 'guiones'}
          </span>
          
          {scripts.length > 0 && (
            <>
              <button
                onClick={exportScriptsToJsonFile}
                className="px-3 py-2 bg-[#1c1c1c] border border-[#272727] text-[#efefef] hover:border-[#c8f060] rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Exportar copia de seguridad en JSON"
              >
                <Download className="w-3.5 h-3.5 text-[#c8f060]" />
                <span className="hidden sm:inline">Exportar JSON</span>
              </button>

              <button
                onClick={() => setShowClearModal(true)}
                className="px-3 py-2 bg-red-950/30 border border-red-800/40 text-red-400 hover:bg-red-900/50 hover:border-red-600 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Borrar todos los guiones guardados"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar todos</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* List of Saved Scripts */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-[#272727]">
        {scripts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#272727] rounded-2xl my-8 bg-[#141414]/30">
            <div className="w-14 h-14 rounded-2xl bg-[#1c1c1c] border border-[#272727] flex items-center justify-center text-[#666] mb-4 shadow-inner">
              <Folder className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">No tenés guiones guardados todavía</h3>
            <p className="text-xs text-[#777] max-w-md leading-relaxed mb-6">
              Cada vez que generes un guion en el generador con Gemini, se guardará automáticamente en este apartado para que puedas consultarlo, copiarlo o borrarlo en cualquier momento.
            </p>
            <button
              onClick={onGoToChat}
              className="px-5 py-2.5 bg-[#c8f060] text-[#0c0c0c] text-xs font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ir al Generador de Guiones</span>
            </button>
          </div>
        ) : filteredScripts.length === 0 ? (
          <div className="text-center py-12 border border-[#272727] rounded-2xl bg-[#141414]/30">
            <p className="text-xs text-[#888] font-mono">No se encontraron guiones que coincidan con "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs text-[#c8f060] hover:underline font-mono cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          filteredScripts.map((script) => (
            <motion.div
              key={script.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#141414] border border-[#272727] hover:border-[#383838] transition-all rounded-2xl p-5 shadow-sm flex flex-col gap-4 group"
            >
              {/* Header of Card */}
              <div className="flex items-start justify-between gap-3 border-b border-[#272727]/80 pb-3.5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-[#333] text-[#999] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-[#c8f060]" />
                      {script.dateFormatted}
                    </span>
                    {script.prompt && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#242424] text-[#c8f060] truncate max-w-[240px]">
                        → {script.prompt}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#c8f060] transition-colors leading-snug">
                    {script.title}
                  </h3>
                </div>

                {/* Action buttons on card header */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onOpenModal(script)}
                    className="p-2 bg-[#1c1c1c] border border-[#272727] hover:border-[#c8f060] hover:text-[#c8f060] text-[#888] rounded-xl transition-all cursor-pointer"
                    title="Ver en Pantalla Completa y Timeline interactivo"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    onClick={() => setDeleteSingleId(script.id)}
                    className="p-2 bg-[#1c1c1c] border border-[#272727] hover:bg-red-950/40 hover:border-red-700/60 text-[#888] hover:text-red-400 rounded-xl transition-all cursor-pointer"
                    title="Borrar este guion"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Copy Box (Highlighted caption) */}
              {script.copy && (
                <div className="bg-[#1c1c1c]/90 border border-[#2a2a2a] rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#c8f060] uppercase tracking-wider flex items-center gap-1.5">
                      <span>📱 Copy para pie de Reel</span>
                    </span>
                    <button
                      onClick={() => onCopyCopy(script.content, script.id)}
                      className="px-2.5 py-1 bg-[#252525] border border-[#333] hover:border-[#c8f060] text-[#efefef] rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      {copiedCopyId === script.id ? <Check className="w-3 h-3 text-[#c8f060]" /> : <Copy className="w-3 h-3 text-[#c8f060]" />}
                      <span className={copiedCopyId === script.id ? "text-[#c8f060] font-bold" : ""}>
                        {copiedCopyId === script.id ? '¡Copiado!' : 'Copiar'}
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-[#ddd] leading-relaxed whitespace-pre-wrap line-clamp-3 font-sans">
                    {script.copy}
                  </p>
                </div>
              )}

              {/* Preview of technical script */}
              <div className="text-xs text-[#aaa] bg-[#111] p-3.5 rounded-xl border border-[#222] line-clamp-4 font-mono leading-relaxed whitespace-pre-wrap">
                {script.content.replace(/<timeline_json>[\s\S]*?<\/timeline_json>/g, '').trim()}
              </div>

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {script.timelineData && (
                    <span className="text-[10px] font-mono text-[#666] flex items-center gap-1">
                      <Film className="w-3 h-3 text-[#3b82f6]" />
                      {script.timelineData.duration || 15}s duración
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCopyText(script.content.replace(/<timeline_json>[\s\S]*?<\/timeline_json>/g, '').trim())}
                    className="px-3 py-1.5 bg-[#1c1c1c] border border-[#272727] hover:border-[#c8f060] hover:text-[#c8f060] text-[#efefef] rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar Guion</span>
                  </button>
                  
                  <button
                    onClick={() => onOpenModal(script)}
                    className="px-3 py-1.5 bg-[#c8f060] text-[#0c0c0c] hover:bg-[#b8e050] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Ver Detalle</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
