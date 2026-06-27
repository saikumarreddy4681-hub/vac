import React from 'react';

const StatCard = ({ title, value, icon, glowColor }) => {
    // Determine glow color classes
    const glowClasses = {
        blue: {
            bg: 'bg-blue-500/10',
            text: 'text-blue-400',
            glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)] border-blue-500/40'
        },
        purple: {
            bg: 'bg-purple-500/10',
            text: 'text-purple-400',
            glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)] border-purple-500/40'
        },
        green: {
            bg: 'bg-green-500/10',
            text: 'text-green-400',
            glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)] border-green-500/40'
        },
        red: {
            bg: 'bg-red-500/10',
            text: 'text-red-400',
            glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-500/40'
        },
        yellow: {
            bg: 'bg-amber-500/10',
            text: 'text-amber-400',
            glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)] border-amber-500/40'
        }
    }[glowColor] || {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        glow: 'shadow-[0_0_15px_rgba(99,102,241,0.4)] border-indigo-500/40'
    };

    return (
        <div className="relative overflow-hidden bg-gradient-to-b from-[#182538] to-[#0f1824] border border-white/[0.08] rounded-[18px] p-6 flex items-center shadow-[0_15px_35px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[15px] transition-all duration-300 hover:scale-[1.02] hover:border-white/[0.15] group">
            {/* Rivet/Screw Graphics in Corners */}
            <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700/60 shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.4)] flex items-center justify-center opacity-75">
                <div className="w-[0.5px] h-[4px] bg-gray-900 rotate-45"></div>
            </div>
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700/60 shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.4)] flex items-center justify-center opacity-75">
                <div className="w-[0.5px] h-[4px] bg-gray-900 -rotate-45"></div>
            </div>
            <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700/60 shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.4)] flex items-center justify-center opacity-75">
                <div className="w-[0.5px] h-[4px] bg-gray-900 -rotate-45"></div>
            </div>
            <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border border-gray-700/60 shadow-[inset_0_0.5px_0.5px_rgba(255,255,255,0.4)] flex items-center justify-center opacity-75">
                <div className="w-[0.5px] h-[4px] bg-gray-900 rotate-45"></div>
            </div>

            {/* Icon Container with Neon Glow */}
            <div className={`relative flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full border ${glowClasses.glow} ${glowClasses.bg} ${glowClasses.text} mr-5 transition-transform duration-300 group-hover:scale-105`}>
                {icon}
            </div>

            <div className="z-10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
                <div className="flex items-baseline gap-1.5">
                    <h3 className="text-3xl font-black text-white font-mono tracking-tight leading-none">{value}</h3>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
