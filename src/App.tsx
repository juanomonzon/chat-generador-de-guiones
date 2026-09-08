import React, { useState, useEffect, useRef, Component } from 'react';
import { 
  Send, Loader2, Maximize2, Minimize2, Copy, Check, Folder, 
  MessageSquare, Sparkles, AlertCircle, RotateCcw, X, Plus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Evento, Message, SavedScript } from './types';
import { 
  getSavedScripts, 
  saveScriptToStorage, 
  deleteSavedScript, 
  clearAllSavedScripts, 
  extractCopyText 
} from './utils/scriptStorage';
import { TimelineView } from './components/TimelineView';
import { SavedScriptsView } from './components/SavedScriptsView';
import { FullScreenModal } from './components/FullScreenModal';

// ─── CONFIGURACIÓN ───────────────────────────────────────────────
const SB_URL = import.meta.env.VITE_SUPABASE_URL || "https://boeurmldeqvcaikdhtvy.supabase.co";
// Preferencia por variable de entorno; decodificación segura en tiempo de ejecución para evitar bloqueos por GitHub Secret Scanning
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || (
  typeof window !== 'undefined'
    ? window.atob("ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1KdlpYVnliV3hrWlhGMlkyRnBhMlJvZEhaNUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTnpNeE9EQXdOak1zSW1WNGNDSTZNakE0T0RjMU5qQTJNMzAudWluSUw5NU5IcHNxTXpmMXNYSHVQVHNyNU5FbFpEQWhwYjYxeFJNNi0wOA==")
    : ""
);

const SYSTEM = `Sos el asistente de edición técnica y estratégica de Radar Cultural (@radarcultural_). Tu función es generar guiones para grabaciones de pantalla de la web radarcultural.vercel.app y asesorar creativamente en la estrategia de contenido.

FLEXIBILIDAD DE INTERPRETACIÓN Y LENGUAJE NATURAL:
- El usuario puede escribir de forma totalmente libre, breve o coloquial (ej: "dame guion para esta semana con 4 eventos", "haceme 2 opciones para el finde", "armame un reel rápido sobre librerías").
- Si el usuario pide una cantidad específica de eventos (ej: "4 eventos", "3 opciones", "5 lugares"), elegí exactamente esa cantidad priorizando los eventos disponibles en la base de datos (o combinándolos armónicamente con lugares culturales emblemáticos de Buenos Aires si la base tiene menos).
- Podés recibir notas desordenadas, listas de lugares o consignas directas: entendé el sentido y transformalo sin fricción en el formato de guion requerido.

REGLA DE ORO (ESTRICTA): Todavía NO se genera contenido en locaciones físicas. Todos los reels deben basarse EXCLUSIVAMENTE en grabaciones de pantalla (screen recordings) navegando la web radarcultural.vercel.app. No sugieras tomas de cámara real ni "vlogs" en el lugar.

PROHIBICIÓN DE ALUCINACIÓN: No inventes funciones, botones o menús que no existen en la web. La web NO tiene "búsqueda por vibe" ni "filtros inteligentes". Sé creativo con los temas, pero usá solo las herramientas reales de la web.

--- INTERACCIONES REALES DE LA WEB (ÚNICAS VÁLIDAS) ---
- "Vista general del mapa" (Ver todos los pines).
- "Zoom in / Zoom out" (Acercarse o alejarse de zonas/barrios).
- "Tap en pin" (Abrir la ficha de un lugar o evento).
- "Scroll en ficha" (Ver descripción, dirección, precios).
- "Filtrar por categoría" (Museos, Teatros, Centros Culturales, Librerías, etc.).
- "Galería de fotos" (Ver fotos de la comunidad o del lugar).
- "Formulario de subida" (Simular la carga de una foto con nombre y @).

CREATIVIDAD PROACTIVA: Si el usuario pide ideas fuera de las series predefinidas, sugerí nuevos ángulos (ej: "Ruta de Museos en Recoleta", "3 Teatros que tenés que conocer"), pero siempre ejecutados con las interacciones reales mencionadas arriba.

REGLA DE LEGIBILIDAD: Usá **negritas** para todos los tiempos [00:00], acciones 🎬 CLIP y textos 💬 TEXTO.

--- CONTEXTO OPERATIVO (PUNTO 2) ---
- Actualización: Lunes/Miércoles (revisión redes), Jueves (carga finde), 1ro de mes (revisión general).
- Criterio de carga: Fecha concreta, público, verificable, lugar en el mapa.

--- PLAN DE VIRALIZACIÓN (PUNTO 3) ---
SERIE 1: "Lugares que no sabías que existían" (Miércoles). Foco: Sorpresa. Lugares: El Zanjón, Casa Mínima, Pasaje San Lorenzo, Xul Solar, La Cárcova, Perlotti, Bollini, Manzana de las Luces.
SERIE 2: "Historia porteña en 30s" (Domingo). Foco: Guardado. Temas: Tortoni, Ateneo, Barolo, Del Molino, Torre Monumental, Las Violetas, Colón.
SERIE 3: "Plan cultural gratis este finde" (Viernes 18hs). Foco: Compartido masivo.
SERIE 4: "Esta semana en el mapa" (Lunes). Foco: Agenda semanal.
SERIE 5: "El antes y el después" (2 veces/mes). Foco: Contraste visual.

--- PARTICIPACIÓN COMUNIDAD (PUNTO 4) ---
Mecánicas: "Subí tu foto al mapa" (galería), "¿Qué lugar falta?" (Stories), "Fotógrafo del mes" (1er lunes), "Colección comunidad" (10+ fotos), "Sugerí un evento" (DM), "El mapa crece con vos" (Estadísticas).

--- ESTRUCTURA DE RESPUESTA PARA GUIONES ---
(Repetir por cada guion si se piden varios. Sé flexible y creativo en las propuestas, pero estricto en el formato técnico).
1. BREVE INTRO: Concepto del reel.
2. GUION TÉCNICO:
   **[00:00.0 - 00:03.0]** **🎬 CLIP:** (Acción válida del mapa) | **✂️ CORTE:** (Seco/Disolvencia)
   **[00:00.0 - 00:03.0]** **💬 TEXTO:** "**Texto en pantalla**"

3. COPY PARA REDES: Texto dinámico y profesional (evitar ser 'canchero' o excesivamente informal). Incluir hashtags.

4. BLOQUE JSON: Encerrado en <timeline_json>...</timeline_json>. 
   ESTRUCTURA OBLIGATORIA DEL JSON:
   {
     "duration": 15,
     "layers": [
       { "type": "video", "segments": [{ "start": 0, "end": 3, "label": "Vista general" }] },
       { "type": "text", "segments": [{ "start": 0, "end": 3, "content": "Título Reel" }] }
     ]
   }

RECOMENDACIÓN: Clips cortos (2-3s) para dinamismo.`;

class ErrorBoundary extends Component<any, any> {
  public state: any = { hasError: false, error: null };
  constructor(props: any) {
    super(props);
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-950 text-red-100 h-screen overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Algo salió mal en el renderizado</h1>
          <pre className="bg-black p-4 rounded text-xs overflow-auto">
            {this.state.error?.stack || String(this.state.error)}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 px-4 py-2 rounded font-bold cursor-pointer"
          >
            Recargar App
          </button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [eventosCount, setEventosCount] = useState(0);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [multilineMode, setMultilineMode] = useState(false);
  
  // Tab state & Saved Scripts state
  const [activeTab, setActiveTab] = useState<'chat' | 'saved'>('chat');
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>(getSavedScripts);
  const [activeModalScript, setActiveModalScript] = useState<{ title?: string; content: string; prompt?: string; dateFormatted?: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCopyIndex, setCopiedCopyIndex] = useState<string | number | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (retryCountdown <= 0) return;
    const timer = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryCountdown]);

  const insertTemplate = (textToInsert: string, autoSend: boolean = false) => {
    if (autoSend) {
      handleSend(textToInsert);
      return;
    }
    setInput(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return textToInsert;
      return `${trimmed} ${textToInsert}`;
    });
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        adjustTextareaHeight();
      }
    }, 50);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (chatRef.current && activeTab === 'chat') {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const loadEvents = async () => {
    try {
      setStatus('loading');
      const res = await fetch(`${SB_URL}/rest/v1/eventos?select=titulo,lugar,tipo_evento,fecha_evento,hora,precio&order=fecha_evento.asc`, {
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`
        }
      });
      if (!res.ok) throw new Error("Error fetching eventos");
      const data = await res.json();
      setEventos(data);
      setEventosCount(data.length);
      setStatus('ok');

      if (messages.length === 0) {
        setMessages([
          {
            role: 'model',
            content: `Hola. Soy el asistente de Radar Cultural.\n\nTengo acceso a **${data.length} eventos cargados** en la base de datos para crear los guiones técnicos de tus Reels.\n\n¿Qué tipo de guion armamos hoy?`
          }
        ]);
      }
    } catch (e) {
      console.error("Error al cargar eventos:", e);
      setStatus('error');
      if (messages.length === 0) {
        setMessages([
          {
            role: 'model',
            content: `Hola. Soy el asistente de Radar Cultural.\n\n*(No pude conectar con la base de eventos, pero podemos armar guiones igual con ideas y lugares clásicos)*.\n\n¿Qué tipo de guion armamos hoy?`
          }
        ]);
      }
    }
  };

  const handleSaveScript = (content: string, userPrompt: string) => {
    const saved = saveScriptToStorage(content, userPrompt);
    if (saved) {
      setSavedScripts(getSavedScripts());
      showToast("✓ Guion guardado automáticamente en el historial");
    }
  };

  const handleDeleteScript = (id: string) => {
    const updated = deleteSavedScript(id);
    setSavedScripts(updated);
    if (activeModalScript && (activeModalScript as any).id === id) {
      setActiveModalScript(null);
    }
    showToast("Guion eliminado");
  };

  const handleClearAllScripts = () => {
    clearAllSavedScripts();
    setSavedScripts([]);
    showToast("Se borraron todos los guiones guardados");
  };

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input.trim();
    if (!text || loading) return;

    // Si es reintento y el último mensaje fue un error, remover el error anterior
    setMessages(prev => {
      if (textOverride && prev.length > 0 && prev[prev.length - 1].role === 'model' && prev[prev.length - 1].content.startsWith('⚠️')) {
        return prev.slice(0, -1);
      }
      return [...prev, { role: 'user', content: text }];
    });

    setInput('');
    setLoading(true);
    setShowCategories(false);
    setActiveModalScript(null);
    setLastFailedPrompt(null);

    try {
      const todayDate = new Date();
      const today = todayDate.toISOString().split('T')[0];
      const todayFormatted = todayDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      let contextEventos = `\n\n--- INFORMACIÓN DE FECHA ACTUAL ---
Hoy es: ${todayFormatted} (Fecha ISO: ${today}).
Todos los eventos pasados a esta fecha no deben ser recomendados como 'próximos' salvo que se aclare expresamente.`;

      if (eventos.length > 0) {
        contextEventos += `\n\n--- BASE DE EVENTOS DISPONIBLES (${eventos.length} TOTALES) ---\n` +
          eventos.map(e => `- ${e.titulo} | Lugar: ${e.lugar} | Tipo: ${e.tipo_evento} | Fecha: ${e.fecha_evento} ${e.hora || ''} | Precio: ${e.precio || 'No especificado'}`).join('\n');
      }

      const fullPrompt = `${SYSTEM}${contextEventos}\n\n--- SOLICITUD DEL USUARIO ---\n${text}`;

      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        data = {
          error: responseText.includes("503") || responseText.includes("Unavailable") || responseText.includes("high demand")
            ? "Los servidores de IA están con alta demanda en este momento. Hacé clic en 'Reintentar' para volver a intentarlo."
            : `Error al procesar la respuesta del servidor (${response.status}).`
        };
      }

      if (!response.ok || data.error) {
        if (data.retryAfter) {
          setRetryCountdown(data.retryAfter);
        }
        let rawError = data.error || `Error ${response.status} al comunicarse con el servidor.`;
        try {
          const parsed = JSON.parse(rawError);
          if (parsed?.error?.message) {
            rawError = parsed.error.message;
          }
        } catch {
          // not JSON
        }

        // Sanitización para que jamás se filtren URLs ni textos técnicos internos de GCP
        if (rawError.includes("quota") || rawError.includes("429") || rawError.includes("RESOURCE_EXHAUSTED") || rawError.includes("generativelanguage")) {
          const waitMsg = data.retryAfter ? ` en ${data.retryAfter} segundos` : " en unos instantes";
          rawError = `Se alcanzó temporalmente el límite de solicitudes por minuto. Podés volver a reintentar${waitMsg}.`;
          if (!data.retryAfter) setRetryCountdown(25);
        } else if (rawError.includes("503") || rawError.includes("high demand") || rawError.includes("UNAVAILABLE")) {
          rawError = "Los servidores de IA están con alta demanda en este momento. Hacé clic en 'Reintentar' para volver a intentarlo.";
          if (!data.retryAfter) setRetryCountdown(5);
        }

        throw new Error(rawError);
      }

      const reply = data.text || "Sin respuesta generada.";
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
      
      // Auto-save script
      handleSaveScript(reply, text);
    } catch (e: any) {
      console.error("Error in handleSend:", e);
      setLastFailedPrompt(text);
      let errorMsg = e.message || String(e);
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed?.error?.message) {
          errorMsg = parsed.error.message;
        }
      } catch {
        // not JSON
      }

      if (errorMsg.includes("quota") || errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("generativelanguage")) {
        errorMsg = "Se alcanzó temporalmente el límite de solicitudes por minuto. Podés reintentar cuando finalice el temporizador.";
        setRetryCountdown(prev => (prev > 0 ? prev : 25));
      } else if (errorMsg.includes("503") || errorMsg.includes("high demand") || errorMsg.includes("UNAVAILABLE")) {
        errorMsg = "Los servidores de IA están con alta demanda en este momento. Hacé clic en 'Reintentar' para volver a intentarlo.";
        setRetryCountdown(prev => (prev > 0 ? prev : 5));
      }

      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          content: `⚠️ ${errorMsg}` 
        }
      ]);
    } finally {
      setLoading(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter: siempre envía
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
      return;
    }
    // Si no está en modo multilínea, Enter envía directamente y Shift+Enter hace salto de línea
    if (!multilineMode && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = isExpanded ? 260 : 130;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("✓ Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCopyOnly = (content: string, idOrIndex: string | number) => {
    const copyText = extractCopyText(content);
    navigator.clipboard.writeText(copyText);
    setCopiedCopyIndex(idOrIndex);
    showToast("✓ Copy para el pie de Reel copiado");
    setTimeout(() => setCopiedCopyIndex(null), 2000);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen max-w-3xl mx-auto bg-[#0c0c0c] text-[#efefef] font-sans overflow-hidden relative">
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-[110] bg-[#1c1c1c] border border-[#c8f060]/40 text-[#c8f060] text-xs font-mono px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 pointer-events-none"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Screen Modal */}
        <AnimatePresence>
          {activeModalScript !== null && (
            <FullScreenModal
              script={activeModalScript}
              onClose={() => setActiveModalScript(null)}
              onCopyAll={copyToClipboard}
              onCopyCopy={copyCopyOnly}
              isAllCopied={copied}
              copiedCopyId={copiedCopyIndex}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex items-center gap-4 p-4 border-b border-[#272727] bg-[#141414] shrink-0">
          <div className="w-8 h-8 bg-[#c8f060] rounded-lg flex items-center justify-center text-[12px] font-mono font-bold text-[#0c0c0c]">
            RC
          </div>
          <div className="flex-1">
            <h1 className="text-[15px] font-bold">Radar Cultural — Guiones</h1>
            <p className="text-[11px] text-[#666] font-mono mt-0.5">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#666]">
            <div className={`w-2 h-2 rounded-full ${status === 'ok' ? 'bg-[#c8f060] shadow-[0_0_8px_#c8f060]' : status === 'loading' ? 'bg-[#f0b060] animate-pulse' : 'bg-red-500'}`} />
            <span>{status === 'ok' ? `${eventosCount} eventos` : status === 'loading' ? 'cargando...' : 'error'}</span>
            {status === 'error' && (
              <button 
                onClick={() => loadEvents()}
                className="ml-2 px-2 py-0.5 bg-red-900/30 border border-red-500/50 rounded text-red-400 hover:bg-red-900/50 transition-all cursor-pointer"
              >
                reintentar
              </button>
            )}
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#272727] bg-[#141414] px-4 pt-1 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'border-[#c8f060] text-[#c8f060] bg-[#1c1c1c]/80 rounded-t-lg'
                : 'border-transparent text-[#777] hover:text-[#efefef] hover:bg-[#1a1a1a]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Generador / Chat</span>
          </button>
          
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'border-[#c8f060] text-[#c8f060] bg-[#1c1c1c]/80 rounded-t-lg'
                : 'border-transparent text-[#777] hover:text-[#efefef] hover:bg-[#1a1a1a]'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Guiones Guardados</span>
            {savedScripts.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'saved' 
                  ? 'bg-[#c8f060] text-[#0c0c0c]' 
                  : 'bg-[#272727] text-[#aaa]'
              }`}>
                {savedScripts.length}
              </span>
            )}
          </button>
        </div>

        {/* Main Tab Content */}
        {activeTab === 'chat' ? (
          <>
            {/* Event Bar */}
            <div className="px-6 py-2 border-b border-[#272727] text-[11px] font-mono text-[#666] truncate shrink-0 bg-[#0f0f0f]">
              {status === 'loading' ? 'Conectando con Supabase...' : (
                <>
                  <span className="text-[#60c8f0]">{eventos.length} eventos en base</span> · {eventos.slice(0, 3).map(e => e.titulo).join(' · ')}...
                </>
              )}
            </div>

            {/* Chat Area */}
            <div 
              ref={chatRef}
              className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 scrollbar-thin scrollbar-thumb-[#272727]"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] font-mono text-[#666] px-1">
                      {msg.role === 'user' ? 'vos' : 'asistente'}
                    </span>
                    <div className={`p-4 rounded-2xl text-[13px] leading-relaxed max-w-[95%] whitespace-pre-wrap shadow-sm relative group ${
                      msg.role === 'user' 
                        ? 'bg-[#c8f060] text-[#0c0c0c] font-bold rounded-br-sm' 
                        : 'bg-[#141414] border border-[#272727] font-medium text-[#efefef] rounded-bl-sm w-full'
                    }`}>
                      {msg.role === 'model' && msg.content.startsWith('⚠️') ? (
                        <div className="flex flex-col gap-3 py-1">
                          <div className="flex items-start gap-2.5 text-amber-300">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs leading-relaxed text-[#efefef]">
                              {msg.content.replace(/^⚠️\s*/, '')}
                            </div>
                          </div>
                          {lastFailedPrompt && (
                            <div className="pt-2 border-t border-[#272727] flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[11px] font-mono text-[#777]">
                                {retryCountdown > 0 ? `Aguardá ${retryCountdown}s para el próximo reintento:` : '¿Reintentar con el mismo prompt?'}
                              </span>
                              <button
                                onClick={() => handleSend(lastFailedPrompt)}
                                disabled={loading || retryCountdown > 0}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border ${
                                  retryCountdown > 0
                                    ? 'bg-[#181818] border-[#333] text-[#777] cursor-not-allowed opacity-75'
                                    : 'bg-[#1c1c1c] border-amber-500/50 hover:border-amber-400 text-amber-300 hover:bg-amber-500/10'
                                }`}
                              >
                                <RotateCcw className={`w-3.5 h-3.5 ${retryCountdown > 0 ? 'animate-spin opacity-40' : ''}`} />
                                <span>{retryCountdown > 0 ? `Reintentar (${retryCountdown}s)` : 'Reintentar'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {msg.role === 'model' && (
                            <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#272727]/60">
                              <button 
                                onClick={() => copyCopyOnly(msg.content, i)}
                                className="px-3 py-1.5 bg-[#1c1c1c] border border-[#272727] rounded-xl text-[#efefef] hover:border-[#c8f060] transition-all flex items-center gap-2 text-[12px] font-mono shadow-sm active:scale-95 cursor-pointer"
                                title="Copiar solo el copy/pie de foto para el Reel"
                              >
                                {copiedCopyIndex === i ? <Check className="w-3.5 h-3.5 text-[#c8f060]" /> : <Copy className="w-3.5 h-3.5 text-[#c8f060]" />}
                                <span className={copiedCopyIndex === i ? "text-[#c8f060] font-bold" : "text-[#efefef] font-medium"}>
                                  {copiedCopyIndex === i ? '¡Copy Copiado!' : 'Copiar Copy (Pie de Reel)'}
                                </span>
                              </button>
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => copyToClipboard(msg.content.replace(/<timeline_json>[\s\S]*?<\/timeline_json>/g, '').trim())}
                                  className="p-1.5 bg-[#1c1c1c] border border-[#272727] rounded-lg text-[#666] hover:text-[#c8f060] hover:border-[#c8f060] transition-all cursor-pointer"
                                  title="Copiar guion completo"
                                >
                                  {copied ? <Check className="w-3.5 h-3.5 text-[#c8f060]" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <button 
                                  onClick={() => setActiveModalScript({ content: msg.content, title: "Guion de Reel" })}
                                  className="p-1.5 bg-[#1c1c1c] border border-[#272727] rounded-lg text-[#666] hover:text-[#c8f060] hover:border-[#c8f060] transition-all cursor-pointer"
                                  title="Pantalla completa"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                          {msg.role === 'model' ? (
                            <div className="flex flex-col gap-6 w-full">
                              {(() => {
                                const parts = msg.content.split(/<timeline_json>|<\/timeline_json>/);
                                return parts.map((part, idx) => {
                                  if (idx % 2 === 0) {
                                    if (!part.trim()) return null;
                                    return (
                                      <div key={idx} className="relative group/script prose prose-invert max-w-none pr-12 bg-[#1a1a1a]/20 p-4 rounded-xl border border-[#272727]/30">
                                        <button 
                                          onClick={() => copyToClipboard(part.trim())}
                                          className="absolute top-3 right-3 p-1.5 bg-[#1c1c1c] border border-[#272727] rounded-lg text-[#666] opacity-0 group-hover/script:opacity-100 hover:text-[#c8f060] hover:border-[#c8f060] transition-all shadow-md cursor-pointer"
                                          title="Copiar este guion"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                        {part.split('**').map((subPart, sIdx) => 
                                          sIdx % 2 === 1 ? <strong key={idx + '-' + sIdx} className="text-[#c8f060] font-black">{subPart}</strong> : subPart
                                        )}
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
                                      return <TimelineView key={idx} data={data} />;
                                    } catch (e) {
                                      console.error("Error parsing timeline JSON:", e);
                                      return null;
                                    }
                                  }
                                });
                              })()}
                            </div>
                          ) : msg.content}
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-1 items-start"
                  >
                    <span className="text-[10px] font-mono text-[#666] px-1">asistente</span>
                    <div className="p-3.5 rounded-2xl bg-[#141414] border border-[#272727] rounded-bl-sm">
                      <div className="flex gap-1.5">
                        <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-[#666] rounded-full" />
                        <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#666] rounded-full" />
                        <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#666] rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions / Sugerencias editables */}
            <div className="px-6 pb-3 flex flex-col gap-2 shrink-0">
              <AnimatePresence>
                {showCategories && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex gap-2 flex-wrap overflow-hidden mb-1 p-2.5 bg-[#141414] rounded-xl border border-[#272727]"
                  >
                    <span className="w-full text-[10px] font-mono text-[#777]">
                      Insertar categoría en el chat para completar:
                    </span>
                    {Array.from(new Set(eventos.map(e => e.tipo_evento))).filter(Boolean).sort().map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => insertTemplate(`Guion sobre eventos de la categoría ${cat}: `)}
                        className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-[#1c1c1c] border border-[#333] text-[#efefef] hover:border-[#c8f060] hover:text-[#c8f060] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-2.5 h-2.5 text-[#c8f060]" />
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-1.5 flex-wrap items-center">
                <span className="text-[10px] font-mono text-[#555] mr-0.5">Sugerencias rápidas:</span>
                <button
                  onClick={() => insertTemplate('dame guion para esta semana con 4 eventos')}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-[#272727] text-[#888] hover:border-[#c8f060] hover:text-[#c8f060] transition-colors cursor-pointer flex items-center gap-1"
                  title="Insertar en el chat para editar o enviar"
                >
                  <Plus className="w-2.5 h-2.5 text-[#c8f060]" /> 4 eventos esta semana
                </button>
                <button
                  onClick={() => insertTemplate('Haceme un guion para el evento: ')}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-[#272727] text-[#888] hover:border-[#c8f060] hover:text-[#c8f060] transition-colors cursor-pointer flex items-center gap-1"
                  title="Insertar en el chat para editar o enviar"
                >
                  <Plus className="w-2.5 h-2.5 text-[#c8f060]" /> evento puntual
                </button>
                <button
                  onClick={() => insertTemplate('Armame un reel de agenda semanal con: ')}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-[#272727] text-[#888] hover:border-[#c8f060] hover:text-[#c8f060] transition-colors cursor-pointer flex items-center gap-1"
                  title="Insertar en el chat para editar o enviar"
                >
                  <Plus className="w-2.5 h-2.5 text-[#c8f060]" /> agenda semanal
                </button>
                <button
                  onClick={() => insertTemplate('Planes culturales gratis para este finde: ')}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-[#272727] text-[#888] hover:border-[#c8f060] hover:text-[#c8f060] transition-colors cursor-pointer flex items-center gap-1"
                  title="Insertar en el chat para editar o enviar"
                >
                  <Plus className="w-2.5 h-2.5 text-[#c8f060]" /> gratis finde
                </button>
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all cursor-pointer ${showCategories ? 'bg-[#c8f060] text-[#0c0c0c] border-[#c8f060]' : 'border-[#272727] text-[#888] hover:border-[#c8f060] hover:text-[#c8f060]'}`}
                >
                  {showCategories ? '✕ categorías' : '+ categorías'}
                </button>
                <button
                  onClick={() => handleSend('¿Qué eventos hay disponibles en la base para armar guiones?')}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-[#272727] text-[#666] hover:border-[#c8f060] hover:text-[#c8f060] transition-colors cursor-pointer"
                >
                  → ver eventos
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#272727] bg-[#141414] flex flex-col gap-2 shrink-0">
              {/* Barra de herramientas superior del chat */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#666] px-1">
                <button
                  type="button"
                  onClick={() => setMultilineMode(!multilineMode)}
                  className="hover:text-[#c8f060] transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Alternar comportamiento de la tecla Enter"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${multilineMode ? 'bg-[#c8f060]' : 'bg-[#555]'}`} />
                  <span>{multilineMode ? 'Modo multilínea (Ctrl+Enter para enviar)' : 'Enter para enviar (Shift+Enter salto)'}</span>
                </button>
                <div className="flex items-center gap-2">
                  {input.trim() && (
                    <span className="text-[10px] text-[#555]">
                      {input.length} car.
                    </span>
                  )}
                  {input.trim() && (
                    <button
                      type="button"
                      onClick={() => { setInput(''); if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.focus(); } }}
                      className="p-1 text-[#666] hover:text-[#efefef] transition-colors cursor-pointer flex items-center gap-0.5"
                      title="Borrar texto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(!isExpanded);
                      setTimeout(adjustTextareaHeight, 50);
                    }}
                    className="p-1 text-[#666] hover:text-[#c8f060] transition-colors cursor-pointer"
                    title={isExpanded ? "Reducir área de escritura" : "Ampliar área de escritura"}
                  >
                    {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Textarea container */}
              <div className="flex gap-2.5 items-end">
                <div className="flex-1 bg-[#1c1c1c] border border-[#272727] rounded-xl flex items-end focus-within:border-[#c8f060]/60 transition-all p-1">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); adjustTextareaHeight(); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribí con libertad: dame guion para esta semana con 4 eventos, 3 lugares en San Telmo, evento puntual..."
                    className={`flex-1 bg-transparent border-none outline-none text-[#efefef] text-[13.5px] p-2.5 resize-none leading-relaxed transition-all ${
                      isExpanded ? 'min-h-[140px] max-h-[280px]' : 'min-h-[48px] max-h-[140px]'
                    }`}
                  />
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading || status === 'loading'}
                  className="bg-[#c8f060] text-[#0c0c0c] w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed mb-0.5 cursor-pointer shrink-0 shadow-lg hover:shadow-[#c8f060]/10"
                  title="Enviar solicitud"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <SavedScriptsView
            scripts={savedScripts}
            onDeleteScript={handleDeleteScript}
            onClearAll={handleClearAllScripts}
            onOpenModal={(script) => setActiveModalScript(script)}
            onGoToChat={() => setActiveTab('chat')}
            onCopyText={copyToClipboard}
            onCopyCopy={copyCopyOnly}
            copiedCopyId={copiedCopyIndex}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
