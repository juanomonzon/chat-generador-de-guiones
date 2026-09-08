import React from 'react';
import { Film, Copy, Check, Minimize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { TimelineView } from './TimelineView';

interface FullScreenModalProps {
  script: {
    title?: string;
    content: string;
    prompt?: string;
    dateFormatted?: string;
  } | null;
  onClose: () => void;
  onCopyAll: (text: string) => void;
  onCopyCopy: (content: string, id: string) => void;
  isAllCopied: boolean;
  copiedCopyId: string | number | null;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
  script,
  onClose,
  onCopyAll,
  onCopyCopy,
  isAllCopied,
  copiedCopyId,
}) => {
  if (!script) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-[#0c0c0c]/95 backdrop-blur-md flex flex-col p-4 md:p-8"
    >
      <div className="flex justify-between items-center pb-4 border-b border-[#272727] gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c8f060] rounded-xl flex items-center justify-center shadow-lg">
            <Film className="text-[#0c0c0c] w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {script.title || "Visualización de Guion"}
            </h2>
            <p className="text-[10px] text-[#666] font-mono uppercase tracking-widest">
              {script.dateFormatted ? `Generado el ${script.dateFormatted}` : "Modo Pantalla Completa"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => onCopyCopy(script.content, 'modal')}
            className="bg-[#1c1c1c] border border-[#272727] text-[#efefef] px-3.5 py-2 rounded-xl flex items-center gap-2 hover:border-[#c8f060] transition-all active:scale-95 cursor-pointer"
            title="Copiar solo el copy para el pie del Reel"
          >
            {copiedCopyId === 'modal' ? <Check className="w-4 h-4 text-[#c8f060]" /> : <Copy className="w-4 h-4 text-[#c8f060]" />}
            <span className="text-sm font-medium">{copiedCopyId === 'modal' ? '¡Copy Copiado!' : 'Copiar Copy'}</span>
          </button>
          <button 
            onClick={() => onCopyAll(script.content.replace(/<timeline_json>[\s\S]*?<\/timeline_json>/g, '').trim())}
            className="bg-[#1c1c1c] border border-[#272727] text-[#efefef] px-3.5 py-2 rounded-xl flex items-center gap-2 hover:border-[#c8f060] transition-all active:scale-95 cursor-pointer"
            title="Copiar guion completo"
          >
            {isAllCopied ? <Check className="w-4 h-4 text-[#c8f060]" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm font-medium">{isAllCopied ? 'Guion Copiado' : 'Copiar Guion'}</span>
          </button>
          <button 
            onClick={onClose}
            className="bg-[#c8f060] text-[#0c0c0c] px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:scale-105 transition-all active:scale-95 cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="text-sm">Cerrar</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#141414] border border-[#272727] rounded-2xl p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[#272727] shadow-inner mt-4">
        <div className="flex flex-col gap-8">
          {(() => {
            const parts = script.content.split(/<timeline_json>|<\/timeline_json>/);
            return parts.map((part, idx) => {
              if (idx % 2 === 0) {
                if (!part.trim()) return null;
                return (
                  <div key={idx} className="prose prose-invert max-w-none text-[15px] leading-relaxed text-[#efefef] bg-[#1a1a1a]/40 p-6 rounded-xl border border-[#272727]">
                    {part.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className="my-1.5 whitespace-pre-wrap">
                        {line.split('**').map((subPart, sIdx) => 
                          sIdx % 2 === 1 ? <strong key={sIdx} className="text-[#c8f060] font-black">{subPart}</strong> : subPart
                        )}
                      </p>
                    ))}
                  </div>
                );
              } else {
                try {
                  let jsonStr = part.trim();
                  if (jsonStr.includes('{')) {
                    jsonStr = jsonStr.substring(jsonStr.indexOf('{'));
                  }
                  if (jsonStr.lastIndexOf('}') !== -1) {
                    jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf('}') + 1);
                  }
                  jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
                  const data = JSON.parse(jsonStr);
                  return (
                    <div key={idx} className="h-80 flex flex-col">
                      <TimelineView data={data} isFullScreen={true} />
                    </div>
                  );
                } catch (e) {
                  console.error("Error parsing timeline in modal:", e);
                  return null;
                }
              }
            });
          })()}
        </div>
      </div>
    </motion.div>
  );
};
