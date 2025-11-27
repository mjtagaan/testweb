import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

interface LineItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    assignedTo: string[];
}

interface Person {
    id: string;
    name: string;
}

interface ItemListProps {
    items: LineItem[];
    people: Person[];
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
    onUpdateItem: (id: string, updates: Partial<LineItem>) => void;
    onTogglePerson: (itemId: string, personName: string) => void;
    onClearItems: () => void;
}

export default function ItemList({
    items,
    people,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
    onTogglePerson,
    onClearItems,
}: ItemListProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">The Bill</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full">{items.length} items</span>
                    {items.length > 0 && (
                        <button
                            onClick={onClearItems}
                            className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded-full hover:bg-red-50 transition-all"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="relative group bg-white rounded-3xl p-5 shadow-sm border border-zinc-100 hover:border-zinc-200 hover:shadow-md transition-all"
                    >
                        {/* Top Row: Name and Price */}
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                                    placeholder="Item name"
                                    className="w-full bg-transparent border-none p-0 text-base font-semibold text-zinc-900 placeholder:text-zinc-300 focus:ring-0 focus:outline-none"
                                />
                            </div>
                            <div className="w-24">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.price === 0 ? '' : item.price}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            onUpdateItem(item.id, { price: val === '' ? 0 : parseFloat(val) });
                                        }}
                                        placeholder="0.00"
                                        className="w-full bg-zinc-50 border-none rounded-xl py-2 pl-6 pr-3 text-right text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Quantity and Total */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1 bg-zinc-50 rounded-xl p-1">
                                <button
                                    onClick={() => onUpdateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-white hover:shadow-sm transition-all"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold text-zinc-700">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateItem(item.id, { quantity: item.quantity + 1 })}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-white hover:shadow-sm transition-all"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="text-sm font-medium text-zinc-500">
                                Total: <span className="text-zinc-900 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Bottom Row: Assignment */}
                        <div className="pt-4 border-t border-zinc-50">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Split Between</p>
                            <div className="flex flex-wrap gap-2">
                                {people.length === 0 ? (
                                    <span className="text-xs text-zinc-400 italic">Add people first</span>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                // If all assigned, unassign all. Else, assign all.
                                                const allAssigned = people.every(p => item.assignedTo.includes(p.name));
                                                onUpdateItem(item.id, { assignedTo: allAssigned ? [] : people.map(p => p.name) });
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${item.assignedTo.length === people.length && people.length > 0
                                                ? 'bg-zinc-900 text-white border-zinc-900'
                                                : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                                                }`}
                                        >
                                            All
                                        </button>
                                        {people.map((person) => {
                                            const isAssigned = item.assignedTo.includes(person.name);
                                            return (
                                                <button
                                                    key={person.id}
                                                    onClick={() => onTogglePerson(item.id, person.name)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${isAssigned
                                                        ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/20'
                                                        : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                                                        }`}
                                                >
                                                    {person.name}
                                                </button>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => onRemoveItem(item.id)}
                            className="absolute bottom-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                            aria-label="Remove item"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={onAddItem}
                className="w-full py-4 rounded-3xl border-2 border-dashed border-zinc-200 text-zinc-400 font-semibold hover:border-zinc-300 hover:text-zinc-600 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                Add Item
            </button>
        </div>
    );
}
