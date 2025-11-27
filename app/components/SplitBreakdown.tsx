import React from 'react';

interface SplitBreakdownProps {
    people: { id: string; name: string }[];
    breakdown: Record<string, { itemTotal: number; share: number }>;
    total: number;
}

export default function SplitBreakdown({ people, breakdown, total }: SplitBreakdownProps) {
    const totalShare = Object.values(breakdown).reduce((sum, p) => sum + p.share, 0);
    const isMatch = Math.abs(total - totalShare) < 0.05; // Tolerance for floating point

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Breakdown</h2>
                {!isMatch && (
                    <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded-full">
                        Mismatch: ${(total - totalShare).toFixed(2)}
                    </span>
                )}
            </div>

            {people.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                    <p>Add people to see the split</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {people.map((person) => (
                        <div
                            key={person.id}
                            className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-sm shadow-sm">
                                    {person.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-zinc-900">{person.name}</p>
                                    <p className="text-xs text-zinc-500">
                                        Items: ${breakdown[person.name]?.itemTotal.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-zinc-900">
                                    ${breakdown[person.name]?.share.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
