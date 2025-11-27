import React from 'react';
import { Trash2, Plus } from 'lucide-react';

interface Person {
    id: string;
    name: string;
}

interface ParticipantListProps {
    people: Person[];
    onAddPerson: (name: string) => void;
    onRemovePerson: (id: string) => void;
}

export default function ParticipantList({ people, onAddPerson, onRemovePerson }: ParticipantListProps) {
    const [newPersonName, setNewPersonName] = React.useState('');

    const handleAdd = () => {
        if (newPersonName.trim()) {
            onAddPerson(newPersonName.trim());
            setNewPersonName('');
        }
    };

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900 mb-4 tracking-tight">Who's Splitting?</h2>

            <div className="flex flex-wrap gap-3 mb-6">
                {people.map((person) => (
                    <div
                        key={person.id}
                        className="group flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
                    >
                        <span className="font-medium text-zinc-700 text-sm">{person.name}</span>
                        <button
                            onClick={() => onRemovePerson(person.id)}
                            className="text-zinc-400 hover:text-red-500 transition-colors"
                            aria-label={`Remove ${person.name}`}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Add name..."
                    className="flex-1 bg-zinc-50 border-none rounded-2xl px-4 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newPersonName.trim()}
                    className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 rounded-2xl transition-all flex items-center justify-center"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );
}
