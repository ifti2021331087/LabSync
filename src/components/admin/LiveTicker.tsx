import { getLiveTickerEventsAction } from "@/actions/adminActions";
import { Check, Clock, AlertTriangle, Package, Info } from "lucide-react";

export default async function LiveTicker() {
    const events = await getLiveTickerEventsAction();

    if (!events || events.length === 0) return null;

    const getEventIcon = (type: string) => {
        switch (type) {
            case "success": return <Check className="w-3.5 h-3.5 text-emerald-500" />;
            case "pending": return <Clock className="w-3.5 h-3.5 text-amber-500" />;
            case "danger": return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
            case "return": return <Package className="w-3.5 h-3.5 text-teal-400" />;
            default: return <Info className="w-3.5 h-3.5 text-blue-400" />;
        }
    };

    return (
        <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-xl py-2.5 px-4 flex items-center gap-4 overflow-hidden shadow-sm mb-6 border border-zinc-800">
            
            {/* Left Badge: LIVE */}
            <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-zinc-700/50 z-10 bg-zinc-900 dark:bg-zinc-950">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                <span className="text-[11px] font-mono text-zinc-400 font-semibold tracking-widest uppercase">
                    Live
                </span>
            </div>

            {/* Scrolling Area Wrapper */}
            <div 
                className="flex flex-1 overflow-hidden relative ticker-wrapper" 
                style={{ maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)' }}
            >
                {/* TRACK 1 */}
                <div className="flex shrink-0 animate-ticker gap-10 pr-10 w-max">
                    {events.map((event, index) => (
                        <div key={`t1-${event.id}-${index}`} className="flex items-center gap-2 text-xs text-zinc-200">
                            {getEventIcon(event.type)}
                            <span className="font-medium">{event.text}</span>
                            <span className="font-mono text-[10px] text-zinc-500 ml-1">
                                {event.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>

                {/* TRACK 2 (Exact Duplicate for Seamless Loop) */}
                <div aria-hidden="true" className="flex shrink-0 animate-ticker gap-10 pr-10 w-max">
                    {events.map((event, index) => (
                        <div key={`t2-${event.id}-${index}`} className="flex items-center gap-2 text-xs text-zinc-200">
                            {getEventIcon(event.type)}
                            <span className="font-medium">{event.text}</span>
                            <span className="font-mono text-[10px] text-zinc-500 ml-1">
                                {event.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}