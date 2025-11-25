'use client';

import React, { useState, useMemo } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

interface LineItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo: string[]; // array of person names
}

interface Person {
  id: string;
  name: string;
}

interface BillState {
  items: LineItem[];
  people: Person[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  serviceChargeRate: number;
  serviceChargeAmount: number;
  tipAmount: number;
  total: number;
}

export default function BillSplitter() {
  const [items, setItems] = useState<LineItem[]>([
    {
      id: '1',
      name: 'Grilled Salmon',
      price: 28.5,
      quantity: 1,
      assignedTo: ['Alice'],
    },
    {
      id: '2',
      name: 'Caesar Salad',
      price: 12.0,
      quantity: 1,
      assignedTo: ['Bob'],
    },
  ]);

  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ]);

  const [newPersonName, setNewPersonName] = useState('');
  const [vatRate, setVatRate] = useState(15); // 15%
  const [serviceChargeRate, setServiceChargeRate] = useState(10); // 10%
  const [tipAmount, setTipAmount] = useState(0);

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const vatAmount = useMemo(() => {
    return parseFloat((subtotal * (vatRate / 100)).toFixed(2));
  }, [subtotal, vatRate]);

  const serviceChargeAmount = useMemo(() => {
    return parseFloat(((subtotal + vatAmount) * (serviceChargeRate / 100)).toFixed(2));
  }, [subtotal, vatAmount, serviceChargeRate]);

  const total = useMemo(() => {
    return parseFloat((subtotal + vatAmount + serviceChargeAmount + tipAmount).toFixed(2));
  }, [subtotal, vatAmount, serviceChargeAmount, tipAmount]);

  // Calculate per-person breakdown
  const personBreakdown = useMemo(() => {
    const breakdown: Record<string, { itemTotal: number; share: number }> = {};

    people.forEach((person) => {
      breakdown[person.name] = { itemTotal: 0, share: 0 };
    });

    // Calculate item totals per person
    items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      if (item.assignedTo.length === 0) {
        // Split equally among all people
        const perPerson = itemTotal / people.length;
        people.forEach((person) => {
          breakdown[person.name].itemTotal += perPerson;
        });
      } else {
        // Split among assigned people
        const perPerson = itemTotal / item.assignedTo.length;
        item.assignedTo.forEach((personName) => {
          breakdown[personName].itemTotal += perPerson;
        });
      }
    });

    // Calculate percentage share and apply charges
    Object.keys(breakdown).forEach((personName) => {
      const personItemTotal = breakdown[personName].itemTotal;
      const personPercentage = subtotal > 0 ? personItemTotal / subtotal : 0;
      const personShare =
        personItemTotal +
        vatAmount * personPercentage +
        serviceChargeAmount * personPercentage;
      breakdown[personName].share = parseFloat(personShare.toFixed(2));
    });

    return breakdown;
  }, [items, people, subtotal, vatAmount, serviceChargeAmount]);

  // Handlers
  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([
        ...people,
        { id: Date.now().toString(), name: newPersonName.trim() },
      ]);
      setNewPersonName('');
    }
  };

  const removePerson = (id: string) => {
    setPeople(people.filter((p) => p.id !== id));
    // Remove this person from all items
    setItems(
      items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter(
          (name) => name !== people.find((p) => p.id === id)?.name
        ),
      }))
    );
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: 'New Item',
      price: 0,
      quantity: 1,
      assignedTo: [],
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const togglePersonForItem = (itemId: string, personName: string) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const isAssigned = item.assignedTo.includes(personName);
          return {
            ...item,
            assignedTo: isAssigned
              ? item.assignedTo.filter((name) => name !== personName)
              : [...item.assignedTo, personName],
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12 font-serif">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Receipt Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-4 border-amber-900 p-8 text-center">
              <h1 className="text-4xl font-bold text-amber-900 tracking-tight mb-2">
                BILL SPLITTER
              </h1>
              <p className="text-amber-700 text-sm tracking-widest">
                SMART EXPENSE DIVIDER
              </p>
              <div className="mt-4 text-xs text-amber-600">
                {new Date().toLocaleDateString()} •{' '}
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* People Section */}
            <div className="p-8 border-b-2 border-amber-100">
              <h2 className="text-xl font-bold text-amber-900 mb-4 tracking-wide">
                PARTICIPANTS
              </h2>
              <div className="space-y-3 mb-4">
                {people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between bg-amber-50 p-3 rounded-lg border border-amber-200"
                  >
                    <span className="font-semibold text-zinc-950">
                      {person.name}
                    </span>
                    <button
                      onClick={() => removePerson(person.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                      title="Remove person"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                  placeholder="Add person name..."
                  className="flex-1 px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-zinc-950"
                />
                <button
                  onClick={addPerson}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>

            {/* Items Section */}
            <div className="p-8 border-b-2 border-amber-100">
              <h2 className="text-xl font-bold text-amber-900 mb-6 tracking-wide">
                ITEMS
              </h2>

              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 p-6 rounded-lg border-2 border-amber-100"
                  >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-amber-700 mb-1 tracking-wider">
                          ITEM NAME
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(item.id, { name: e.target.value })
                          }
                          className="text-zinc-950 w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-amber-700 mb-1 tracking-wider">
                          PRICE
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(item.id, {
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="text-zinc-950 w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-amber-700 mb-1 tracking-wider">
                          QUANTITY
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateItem(item.id, {
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, {
                                quantity: Math.max(1, parseInt(e.target.value)),
                              })
                            }
                            className="w-16 px-3 py-2 border border-amber-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={() =>
                              updateItem(item.id, {
                                quantity: item.quantity + 1,
                              })
                            }
                            className="bg-green-100 hover:bg-green-200 text-green-600 p-2 rounded transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="self-end text-red-500 hover:text-red-700 transition-colors p-2"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Assign to people */}
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-amber-700 mb-2 tracking-wider">
                        ASSIGN TO
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {people.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            Add people to assign items
                          </p>
                        ) : (
                          people.map((person) => (
                            <button
                              key={person.id}
                              onClick={() =>
                                togglePersonForItem(item.id, person.name)
                              }
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                item.assignedTo.includes(person.name)
                                  ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                            >
                              {person.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="text-right pt-3 border-t border-amber-200">
                      <p className="text-sm text-slate-600">
                        Subtotal:{' '}
                        <span className="font-bold text-amber-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addItem}
                className="mt-6 w-full bg-amber-100 hover:bg-amber-200 text-amber-900 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold border-2 border-dashed border-amber-400"
              >
                <Plus size={20} /> Add Item
              </button>
            </div>

            {/* Charges Section */}
            <div className="p-8 border-b-2 border-amber-100">
              <h2 className="text-xl font-bold text-amber-900 mb-6 tracking-wide">
                CHARGES & ADJUSTMENTS
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-700 mb-2 tracking-wider">
                      VAT RATE (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={vatRate}
                        onChange={(e) => setVatRate(parseFloat(e.target.value))}
                        className="flex-1 px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-sm font-semibold text-slate-600">%</span>
                    </div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded border border-amber-200 flex flex-col justify-end">
                    <p className="text-xs text-amber-700 mb-1 font-bold">
                      VAT AMOUNT
                    </p>
                    <p className="text-2xl font-bold text-amber-900">
                      ${vatAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-700 mb-2 tracking-wider">
                      SERVICE CHARGE (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={serviceChargeRate}
                        onChange={(e) =>
                          setServiceChargeRate(parseFloat(e.target.value))
                        }
                        className="flex-1 px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-sm font-semibold text-slate-600">%</span>
                    </div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded border border-amber-200 flex flex-col justify-end">
                    <p className="text-xs text-amber-700 mb-1 font-bold">
                      SERVICE CHARGE
                    </p>
                    <p className="text-2xl font-bold text-amber-900">
                      ${serviceChargeAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-700 mb-2 tracking-wider">
                    TIP AMOUNT
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 border-t-4 border-amber-900">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {vatAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">
                      VAT ({vatRate}%):
                    </span>
                    <span className="font-semibold text-slate-900">
                      ${vatAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {serviceChargeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">
                      Service Charge ({serviceChargeRate}%):
                    </span>
                    <span className="font-semibold text-slate-900">
                      ${serviceChargeAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">Tip:</span>
                    <span className="font-semibold text-slate-900">
                      ${tipAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-amber-900 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-amber-900 tracking-wider">
                    TOTAL
                  </span>
                  <span className="text-4xl font-bold text-amber-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Split Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden sticky top-6">
            {/* Sidebar Header */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-4 border-green-700 p-6 text-center">
              <h2 className="text-2xl font-bold text-green-900 tracking-tight">
                SPLIT BREAKDOWN
              </h2>
              <p className="text-green-700 text-xs tracking-widest mt-1">
                PER PERSON
              </p>
            </div>

            {/* Split Details */}
            <div className="p-6">
              {people.length === 0 ? (
                <p className="text-center text-slate-500 py-8 italic">
                  Add people to see split breakdown
                </p>
              ) : (
                <div className="space-y-4">
                  {people.map((person) => (
                    <div
                      key={person.id}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200 hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-bold text-green-900 mb-2">
                        {person.name}
                      </p>
                      <div className="space-y-1 text-xs text-slate-700 mb-3">
                        <div className="flex justify-between">
                          <span>Items:</span>
                          <span className="font-semibold">
                            ${personBreakdown[person.name]?.itemTotal.toFixed(2)}
                          </span>
                        </div>
                        {vatAmount > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span className="text-xs">
                              VAT share:
                            </span>
                            <span className="font-semibold">
                              ${(vatAmount * (personBreakdown[person.name]?.itemTotal / subtotal || 0)).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {serviceChargeAmount > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span className="text-xs">
                              Service:
                            </span>
                            <span className="font-semibold">
                              ${(serviceChargeAmount * (personBreakdown[person.name]?.itemTotal / subtotal || 0)).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="bg-white p-3 rounded border-2 border-green-300">
                        <p className="text-xs text-green-700 font-bold mb-1">
                          OWES
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          ${personBreakdown[person.name]?.share.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Quick Summary */}
                  <div className="mt-6 pt-6 border-t-2 border-slate-200">
                    <p className="text-xs font-bold text-slate-600 mb-2 tracking-wider">
                      VERIFICATION
                    </p>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                      <div className="flex justify-between mb-2">
                        <span>Total Bill:</span>
                        <span className="font-bold">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-green-700 font-semibold border-t pt-2">
                        <span>Sum of Splits:</span>
                        <span>
                          ${Object.values(personBreakdown)
                            .reduce((sum, p) => sum + p.share, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
