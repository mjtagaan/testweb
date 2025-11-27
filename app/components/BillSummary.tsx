import React from 'react';

interface BillSummaryProps {
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    serviceChargeRate: number;
    serviceChargeAmount: number;
    tipAmount: number;
    total: number;
    onVatRateChange: (rate: number) => void;
    onServiceChargeRateChange: (rate: number) => void;
    onTipAmountChange: (amount: number) => void;
}

export default function BillSummary({
    subtotal,
    vatRate,
    vatAmount,
    serviceChargeRate,
    serviceChargeAmount,
    tipAmount,
    total,
    onVatRateChange,
    onServiceChargeRateChange,
    onTipAmountChange,
}: BillSummaryProps) {
    return (
        <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-xl shadow-zinc-900/10">
            <h2 className="text-lg font-bold mb-6 tracking-tight">Summary</h2>

            <div className="space-y-4">
                <div className="flex justify-between items-center text-zinc-400 text-sm">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                </div>

                {/* VAT */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm">VAT</span>
                        <div className="flex items-center bg-zinc-800 rounded-lg px-2 py-1">
                            <input
                                type="number"
                                value={vatRate === 0 ? '' : vatRate}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onVatRateChange(val === '' ? 0 : parseFloat(val));
                                }}
                                placeholder="0"
                                className="w-8 bg-transparent border-none p-0 text-xs text-center text-white focus:ring-0"
                            />
                            <span className="text-zinc-500 text-xs">%</span>
                        </div>
                    </div>
                    <span className="text-white font-medium text-sm">${vatAmount.toFixed(2)}</span>
                </div>

                {/* Service Charge */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-sm">Service</span>
                        <div className="flex items-center bg-zinc-800 rounded-lg px-2 py-1">
                            <input
                                type="number"
                                value={serviceChargeRate === 0 ? '' : serviceChargeRate}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onServiceChargeRateChange(val === '' ? 0 : parseFloat(val));
                                }}
                                placeholder="0"
                                className="w-8 bg-transparent border-none p-0 text-xs text-center text-white focus:ring-0"
                            />
                            <span className="text-zinc-500 text-xs">%</span>
                        </div>
                    </div>
                    <span className="text-white font-medium text-sm">${serviceChargeAmount.toFixed(2)}</span>
                </div>

                {/* Tip */}
                <div className="flex justify-between items-center pt-2">
                    <span className="text-zinc-400 text-sm">Tip</span>
                    <div className="flex items-center bg-zinc-800 rounded-lg px-3 py-1.5 w-24">
                        <span className="text-zinc-500 text-sm mr-1">$</span>
                        <input
                            type="number"
                            value={tipAmount === 0 ? '' : tipAmount}
                            onChange={(e) => {
                                const val = e.target.value;
                                onTipAmountChange(val === '' ? 0 : parseFloat(val));
                            }}
                            placeholder="0.00"
                            className="w-full bg-transparent border-none p-0 text-sm text-right text-white focus:ring-0"
                        />
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 mt-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-zinc-400 font-medium">Total</span>
                        <span className="text-3xl font-bold tracking-tight">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
