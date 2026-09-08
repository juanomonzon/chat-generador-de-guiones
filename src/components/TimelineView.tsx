import React, { useState, useRef } from 'react';
import { Type, Music, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { TimelineData } from '../types';

interface TimelineViewProps {
  data: TimelineData | null | any;
  isFullScreen?: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ data, isFullScreen = false }) => {
  if (!data || !data.layers || !Array.isArray(data.layers)) {
    return (
      <div className="mt-4 p-4 bg-[#141414] border border-[#272727] rounded-xl text-[10px] text-[#666] font-mono italic">
        [!] No se pudo generar la vista previa del timeline.
      </div>
    );
  }

  const duration = data.duration || 15;
  const pixelsPerSecond = isFullScreen ? 100 : 60; 
  const totalWidth = duration * pixelsPerSecond;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      setCurrentTime(scrollLeft / pixelsPerSecond);
    }
  };

  const getLayerColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-[#a855f7]';
      case 'audio': return 'bg-[#ec4899]';
      case 'video': return 'bg-[#3b82f6]';
      default: return 'bg-[#272727]';
    }
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-3 h-3" />;
      case 'audio': return <Music className="w-3 h-3" />;
      case 'video': return <MapPin className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className={`mt-4 bg-[#0c0c0c] border border-[#272727] rounded-xl overflow-hidden flex flex-col shadow-2xl relative ${isFullScreen ? 'flex-1' : ''}`}>
      <div className="bg-[#141414] px-4 py-2 border-b border-[#272727] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#c8f060] animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-white">
            TIEMPO: {currentTime.toFixed(1)}s / {duration}s
          </span>
        </div>
        <span className="text-[9px] text-[#666] font-mono uppercase tracking-widest">Timeline de Edición</span>
      </div>

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto scrollbar-none relative bg-[#0f0f0f]"
        style={{ height: isFullScreen ? '100%' : '240px' }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#c8f060] z-30 pointer-events-none shadow-[0_0_10px_rgba(200,240,96,0.5)]" />

        <div className="relative" style={{ width: totalWidth + 200, paddingLeft: '2px' }}>
          <div className="h-8 border-b border-[#272727] flex items-end pb-1 bg-[#141414]/50">
            {Array.from({ length: Math.ceil(duration) * 2 + 1 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center shrink-0" style={{ width: pixelsPerSecond / 2 }}>
                <div className={`w-[1px] bg-[#333] ${i % 2 === 0 ? 'h-3' : 'h-1.5'}`} />
                {i % 2 === 0 && (
                  <span className="text-[8px] text-[#666] mt-1 font-mono">{(i / 2)}s</span>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 flex flex-col gap-4">
            {data.layers.map((layer: any, lIdx: number) => (
              <div key={lIdx} className="h-12 relative flex items-center border-b border-[#272727]/30 last:border-0">
                <div className="sticky left-0 z-20 w-8 h-8 rounded bg-[#1c1c1c] border border-[#272727] flex items-center justify-center text-[#666] shadow-md mr-4">
                  {getLayerIcon(layer.type)}
                </div>
                
                <div className="flex-1 relative h-full">
                  {layer.segments.map((seg: any, sIdx: number) => (
                    <motion.div
                      key={sIdx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`absolute h-9 rounded-md ${getLayerColor(layer.type)} border border-white/10 flex flex-col justify-center px-2 overflow-hidden shadow-sm group hover:brightness-110 transition-all cursor-default`}
                      style={{
                        left: seg.start * pixelsPerSecond,
                        width: Math.max(20, (seg.end - seg.start) * pixelsPerSecond),
                      }}
                    >
                      <span className="text-[9px] font-bold text-white truncate leading-none">
                        {seg.content || seg.label}
                      </span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[7px] text-white/80 font-mono">
                          {seg.start}s
                        </span>
                        <span className="text-[7px] text-white/80 font-mono">
                          {seg.end}s
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-[#272727] bg-[#141414] flex justify-around items-center">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /><span className="text-[9px] font-bold text-[#666]">VIDEO</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#a855f7]" /><span className="text-[9px] font-bold text-[#666]">TEXTO</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ec4899]" /><span className="text-[9px] font-bold text-[#666]">AUDIO</span></div>
      </div>
    </div>
  );
};
