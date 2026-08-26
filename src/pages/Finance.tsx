import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { DollarSign, CreditCard, TrendingUp, TrendingDown, Download, Plus, X, UploadCloud, FileText, Trash2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { name: 'First Term', revenue: 45000000, expenses: 12000000 },
  { name: 'Second Term', revenue: 38000000, expenses: 14000000 },
  { name: 'Third Term', revenue: 52000000, expenses: 15000000 },
];

const initialTransactions = [
  { id: "TRX-1029", date: "2026-07-21", description: "School Fees - John Doe (JSS1)", amount: 45000, type: "income", status: "Completed" },
  { id: "TRX-1028", date: "2026-07-20", description: "Lab Equipment Purchase", amount: 150000, type: "expense", status: "Completed" },
  { id: "TRX-1027", date: "2026-07-19", description: "School Fees - Jane Smith (SSS3)", amount: 65000, type: "income", status: "Completed" },
  { id: "TRX-1026", date: "2026-07-18", description: "Staff Salary Payment", amount: 2500000, type: "expense", status: "Pending" },
  { id: "TRX-1025", date: "2026-07-18", description: "Hostel Fee - Michael Obi (JSS2)", amount: 30000, type: "income", status: "Completed" },
];

export default function Finance() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "income",
    date: new Date().toISOString().split('T')[0]
  });

  // Fee Breakdown State
  const [feeBreakdownFile, setFeeBreakdownFile] = useState<{ name: string, url: string, size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ess_fee_breakdown");
    if (stored) {
      try {
        setFeeBreakdownFile(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse fee breakdown", e);
      }
    }
  }, []);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `TRX-${1030 + transactions.length}`;
    setTransactions([{
      id,
      date: newTransaction.date,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount) || 0,
      type: newTransaction.type,
      status: "Completed"
    }, ...transactions]);
    setIsRecordModalOpen(false);
    setNewTransaction({ description: "", amount: "", type: "income", date: new Date().toISOString().split('T')[0] });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const fileData = {
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          url: dataUrl
        };
        setFeeBreakdownFile(fileData);
        localStorage.setItem("ess_fee_breakdown", JSON.stringify(fileData));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFeeBreakdown = () => {
    setFeeBreakdownFile(null);
    localStorage.removeItem("ess_fee_breakdown");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">Financial Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Manage school fees, expenses, and financial reports.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-white" onClick={() => window.print()}>
            <Download size={16} />
            Export Report
          </Button>
          <Button variant="brand" className="gap-2" onClick={() => setIsRecordModalOpen(true)}>
            <Plus size={16} />
            Record Payment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
                <h4 className="text-2xl font-bold font-heading text-slate-900">₦135.0M</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 font-medium">+12.5%</span>
              <span className="text-slate-400 ml-2">vs last session</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Expenses</p>
                <h4 className="text-2xl font-bold font-heading text-slate-900">₦41.0M</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600">
                <TrendingDown size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-rose-600 font-medium">+5.2%</span>
              <span className="text-slate-400 ml-2">vs last session</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Pending Fees</p>
                <h4 className="text-2xl font-bold font-heading text-slate-900">₦12.5M</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
                <CreditCard size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 font-medium">-2.1%</span>
              <span className="text-slate-400 ml-2">vs last session</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Net Balance</p>
                <h4 className="text-2xl font-bold font-heading text-slate-900">₦94.0M</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-50 text-brand-600">
                <DollarSign size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 font-medium">+15.3%</span>
              <span className="text-slate-400 ml-2">vs last session</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="col-span-1 lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle>Income vs Expenses Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, undefined]}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Transactions & Breakdown */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Recent Transactions */}
          <Card className="border-0 shadow-sm flex-1">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[250px]">
              <div className="divide-y divide-slate-100">
                {transactions.map((trx) => (
                  <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">{trx.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{trx.date} &middot; {trx.id}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${trx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {trx.type === 'income' ? '+' : '-'}₦{trx.amount.toLocaleString()}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        trx.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {trx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t border-slate-100">
              <Button variant="ghost" className="w-full text-sm text-brand-600">View All Transactions ({transactions.length})</Button>
            </div>
          </Card>

          {/* School Fee Breakdown Upload */}
          <Card className="border-0 shadow-sm shrink-0">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle>School Fee Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {feeBreakdownFile ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 truncate">{feeBreakdownFile.name}</p>
                      <p className="text-xs text-slate-500">{feeBreakdownFile.size} &middot; Uploaded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <a 
                      href={feeBreakdownFile.url} 
                      download={feeBreakdownFile.name}
                      className="flex-1 inline-flex justify-center items-center gap-2 h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 text-brand-600 transition-colors"
                    >
                      <Download size={14} /> Download
                    </a>
                    <button 
                      onClick={removeFeeBreakdown}
                      className="h-9 px-3 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center"
                      title="Remove Breakdown"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.jpg,.png,.csv,.xlsx" 
                    onChange={handleFileUpload} 
                  />
                  <UploadCloud size={32} className="mx-auto text-slate-400 group-hover:text-brand-500 mb-3 transition-colors" />
                  <p className="text-sm font-bold text-slate-900 mb-1">Upload Fee Breakdown</p>
                  <p className="text-xs text-slate-500">PDF, Excel, or Word (Max 5MB)</p>
                  <Button size="sm" variant="outline" className="mt-4 rounded-full bg-white font-medium text-xs">
                    Browse Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle>Record Financial Payment</CardTitle>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trx-desc">Description / Particulars</Label>
                  <Input 
                    id="trx-desc" 
                    required 
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder="e.g. School Fees - Samuel John (SSS1)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trx-type">Transaction Type</Label>
                    <select 
                      id="trx-type" 
                      required
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                    >
                      <option value="income">Income / Fee</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trx-amount">Amount (₦)</Label>
                    <Input 
                      id="trx-amount" 
                      type="number"
                      required 
                      min="1"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      placeholder="e.g. 50000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trx-date">Date</Label>
                  <Input 
                    id="trx-date" 
                    type="date"
                    required 
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" className="w-full" onClick={() => setIsRecordModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="brand" className="w-full">
                    Record Transaction
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
