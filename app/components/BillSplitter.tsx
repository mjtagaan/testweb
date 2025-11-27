'use client';

import React, { useState, useMemo } from 'react';
import ParticipantList from './ParticipantList';
import ItemList from './ItemList';
import BillSummary from './BillSummary';
import SplitBreakdown from './SplitBreakdown';

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
        // Split equally among all people if no one assigned? 
        // Or maybe unassigned items go to no one? 
        // Let's stick to "Split equally among all" as a fallback, or just 0.
        // The original code split equally. Let's keep that behavior for now but maybe it's better to force assignment.
        // Actually, let's split equally if empty, it's a safe default.
        if (people.length > 0) {
          const perPerson = itemTotal / people.length;
          people.forEach((person) => {
            breakdown[person.name].itemTotal += perPerson;
          });
        }
      } else {
        // Split among assigned people
        const perPerson = itemTotal / item.assignedTo.length;
        item.assignedTo.forEach((personName) => {
          if (breakdown[personName]) {
            breakdown[personName].itemTotal += perPerson;
          }
        });
      }
    });

    // Calculate percentage share and apply charges
    Object.keys(breakdown).forEach((personName) => {
      const personItemTotal = breakdown[personName].itemTotal;
      const personPercentage = subtotal > 0 ? personItemTotal / subtotal : 0;

      // Distribute all extras based on the share of the subtotal
      const personShare =
        personItemTotal +
        vatAmount * personPercentage +
        serviceChargeAmount * personPercentage +
        tipAmount * personPercentage; // FIXED: Added tip distribution

      breakdown[personName].share = parseFloat(personShare.toFixed(2));
    });

    return breakdown;
  }, [items, people, subtotal, vatAmount, serviceChargeAmount, tipAmount]);

  // Handlers
  const addPerson = (name: string) => {
    if (!people.some(p => p.name === name)) {
      setPeople([...people, { id: Date.now().toString(), name }]);
    }
  };

  const removePerson = (id: string) => {
    const personToRemove = people.find(p => p.id === id);
    setPeople(people.filter((p) => p.id !== id));
    if (personToRemove) {
      setItems(
        items.map((item) => ({
          ...item,
          assignedTo: item.assignedTo.filter((name) => name !== personToRemove.name),
        }))
      );
    }
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
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">
            KK<span className="text-blue-600">Bill</span>
          </h1>
          <p className="text-zinc-500 font-medium">Split bills without the headache.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input (Items & People) */}
          <div className="lg:col-span-7 space-y-8">
            <ParticipantList
              people={people}
              onAddPerson={addPerson}
              onRemovePerson={removePerson}
            />
            <ItemList
              items={items}
              people={people}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
              onTogglePerson={togglePersonForItem}
            />
          </div>

          {/* Right Column: Summary & Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-8 space-y-6">
              <BillSummary
                subtotal={subtotal}
                vatRate={vatRate}
                vatAmount={vatAmount}
                serviceChargeRate={serviceChargeRate}
                serviceChargeAmount={serviceChargeAmount}
                tipAmount={tipAmount}
                total={total}
                onVatRateChange={setVatRate}
                onServiceChargeRateChange={setServiceChargeRate}
                onTipAmountChange={setTipAmount}
              />
              <SplitBreakdown
                people={people}
                breakdown={personBreakdown}
                total={total}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
