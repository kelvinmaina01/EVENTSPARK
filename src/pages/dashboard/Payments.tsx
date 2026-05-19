import React, { useState } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  Plus,
  Coins,
  Receipt,
  Percent,
  Download,
  AlertCircle,
  Check,
  Building,
  Info,
  DollarSign,
  Undo2,
  Trash2,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  code: string;
  discount: string;
  limit: string;
  usedCount: number;
}

interface Transaction {
  id: string;
  date: string;
  event: string;
  buyer: string;
  amount: number;
  status: "succeeded" | "refunded" | "processing";
}

export default function Payments() {
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  
  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponLimit, setCouponLimit] = useState("");

  // Payment Methods
  const [cryptoVerified, setCryptoVerified] = useState(false);
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [localMethods, setLocalMethods] = useState({
    ideal: true,
    bancontact: false,
    konbini: false,
    paynow: false,
    przelewy24: false,
    pix: false,
    fpx: false,
    twint: false,
    zip: false,
  });

  // Invoicing State
  const [invoicing, setInvoicing] = useState({
    sellerName: "Kelvin Gichinga",
    address: "",
    memo: "",
  });
  const [showEditInvoicing, setShowEditInvoicing] = useState(false);
  const [tempInvoicing, setTempInvoicing] = useState({ ...invoicing });

  // Tax State
  const [showTaxPlusModal, setShowTaxPlusModal] = useState(false);

  // Refund Policy State
  const [refundPolicy, setRefundPolicy] = useState("");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [tempRefund, setTempRefund] = useState("");

  // Mock Sales State
  const [sales, setSales] = useState<Transaction[]>([]);
  
  // Onboarding Stripe simulation
  const handleStripeConnect = () => {
    setStripeLoading(true);
    toast.loading("Connecting to Stripe...", { id: "stripe" });
    setTimeout(() => {
      setStripeConnected(true);
      setStripeLoading(false);
      toast.success("Stripe account connected successfully!", {
        id: "stripe",
        description: "You can now start accepting ticket payments.",
      });
      // Generate some high-fidelity mock sales history when Stripe connects
      setSales([
        { id: "ch_3Mv8sK", date: "2026-05-18", event: "Vibe Coding Summit", buyer: "Sarah Jenkins", amount: 49.00, status: "succeeded" },
        { id: "ch_2Nv9xJ", date: "2026-05-17", event: "AI & Security Community AMA", buyer: "David Chen", amount: 19.99, status: "succeeded" },
        { id: "ch_1Pv2zL", date: "2026-05-15", event: "Nairobi Tech Mixer", buyer: "Anita Desai", amount: 25.00, status: "succeeded" },
      ]);
    }, 2000);
  };

  const handleDisconnectStripe = () => {
    setStripeConnected(false);
    setSales([]);
    toast.info("Stripe account disconnected");
  };

  // Coupons Operations
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount) return;
    
    const newCoupon: Coupon = {
      code: couponCode.toUpperCase().trim(),
      discount: couponDiscount.includes("%") || couponDiscount.includes("$") ? couponDiscount : `${couponDiscount}%`,
      limit: couponLimit || "Unlimited",
      usedCount: 0
    };

    setCoupons([...coupons, newCoupon]);
    setCouponCode("");
    setCouponDiscount("");
    setCouponLimit("");
    setShowCreateCoupon(false);
    toast.success(`Coupon ${newCoupon.code} created!`);
  };

  const handleDeleteCoupon = (code: string) => {
    setCoupons(coupons.filter(c => c.code !== code));
    toast.success("Coupon removed");
  };

  // Verify Solana Identity Simulation
  const handleVerifySolana = () => {
    setCryptoLoading(true);
    toast.loading("Initiating identity verification via Stripe Identity...", { id: "crypto" });
    setTimeout(() => {
      setCryptoVerified(true);
      setCryptoLoading(false);
      toast.success("Identity verified! Solana (crypto) payments enabled.", { id: "crypto" });
    }, 2500);
  };

  // Local Method Toggle Helper
  const handleToggleLocal = (key: keyof typeof localMethods) => {
    setLocalMethods(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success(`${key.toUpperCase()} payment method updated.`);
      return updated;
    });
  };

  // Invoice Save
  const handleSaveInvoicing = (e: React.FormEvent) => {
    e.preventDefault();
    setInvoicing(tempInvoicing);
    setShowEditInvoicing(false);
    toast.success("Seller invoicing details updated.");
  };

  // Refund Policy Save
  const handleSaveRefundPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setRefundPolicy(tempRefund);
    setShowRefundModal(false);
    toast.success("Refund policy updated.");
  };

  // CSV download simulation
  const handleDownloadCSV = () => {
    if (sales.length === 0) {
      toast.info("No transaction data to export");
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Transaction ID,Date,Event,Buyer,Amount,Status\n"
      + sales.map(s => `${s.id},${s.date},${s.event},${s.buyer},$${s.amount.toFixed(2)},${s.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eventspark_sales_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Payments</h1>
        <p className="text-muted-foreground">Manage ticket sales, coupons, invoicing, and local payment gateways.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main settings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Ticket Sales */}
          <Card className="border border-[#FF758F]/10 overflow-hidden shadow-sm">
            <CardHeader className="bg-gradient-to-r from-pink-500/5 to-transparent pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950/30 flex items-center justify-center text-pink-500">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ticket Sales</CardTitle>
                  <CardDescription>Start selling tickets to your events</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {stripeConnected ? (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="font-semibold text-sm text-foreground">Stripe Account Connected</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Seller: {invoicing.sellerName} (Active)</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDisconnectStripe} className="text-destructive hover:bg-destructive/5 hover:text-destructive text-xs rounded-full">
                    Disconnect Stripe
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Start Selling Tickets</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Start selling tickets to your events by creating a Stripe account. It usually takes less than 5 minutes to set up.
                    </p>
                  </div>
                  <Button
                    onClick={handleStripeConnect}
                    disabled={stripeLoading}
                    className="rounded-full bg-[#19192E] text-white hover:bg-[#19192E]/90 dark:bg-primary dark:hover:bg-primary/90 font-semibold"
                  >
                    {stripeLoading ? "Loading Setup..." : "Get Started"}
                  </Button>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2 border-t border-border/40">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    Stripe is a secure payment processor with low fees that handles all of EventSpark's sales.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coupons Section */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Coupons</CardTitle>
                <CardDescription>Manage discounts for ticket checkouts</CardDescription>
              </div>
              <Button size="sm" className="rounded-full" onClick={() => setShowCreateCoupon(true)}>
                <Plus className="w-4 h-4 mr-1" /> Create
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create coupons that can be applied to any event managed by your calendar.
              </p>

              {coupons.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border/40 rounded-xl">
                  <Percent className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground/80">No Coupons</p>
                  <p className="text-xs text-muted-foreground">You have not set up any coupons.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {coupons.map((coupon) => (
                    <div key={coupon.code} className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/30 hover:border-border/60 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono font-bold tracking-wider text-primary">
                            {coupon.code}
                          </Badge>
                          <span className="text-xs font-semibold text-foreground">{coupon.discount} Off</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Limit: {coupon.limit} (Used: {coupon.usedCount})</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={() => handleDeleteCoupon(coupon.code)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Payment Methods</CardTitle>
              <CardDescription>Choose accepted payment methods for your events and memberships.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Credit/Debit Cards */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/20">
                <div className="space-y-1 pr-4">
                  <p className="font-semibold text-sm">Cards</p>
                  <p className="text-xs text-muted-foreground">Major credit and debit cards, Apple Pay and Google Pay are always accepted.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-emerald-500">On</span>
                  <Switch checked disabled className="data-[state=checked]:bg-emerald-500" />
                </div>
              </div>

              {/* Solana */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/40 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-purple-500" />
                    <p className="font-semibold text-sm">Solana</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cryptoVerified 
                      ? "Crypto payments are enabled on Solana. Guests can checkout using SOL or USDC." 
                      : "Please verify your identity to accept crypto payments."}
                  </p>
                </div>
                {cryptoVerified ? (
                  <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 px-3.5 py-1 text-xs rounded-full font-semibold">
                    Verified & Enabled
                  </Badge>
                ) : (
                  <Button size="sm" onClick={handleVerifySolana} disabled={cryptoLoading} className="rounded-full bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold shrink-0">
                    {cryptoLoading ? "Verifying..." : "Verify"}
                  </Button>
                )}
              </div>

              {/* Local Payment Methods List */}
              <div className="space-y-3 pt-3 border-t border-border/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Local Payment Gateways</h4>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* iDEAL */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/20">
                    <div>
                      <p className="text-sm font-semibold">iDEAL</p>
                      <p className="text-[11px] text-muted-foreground">Netherlands</p>
                    </div>
                    <Switch checked={localMethods.ideal} onCheckedChange={() => handleToggleLocal("ideal")} />
                  </div>

                  {/* Bancontact */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/20">
                    <div>
                      <p className="text-sm font-semibold">Bancontact</p>
                      <p className="text-[11px] text-muted-foreground">Belgium</p>
                    </div>
                    <Switch checked={localMethods.bancontact} onCheckedChange={() => handleToggleLocal("bancontact")} />
                  </div>

                  {/* Konbini */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/20">
                    <div>
                      <p className="text-sm font-semibold">Konbini</p>
                      <p className="text-[11px] text-muted-foreground">Japan</p>
                    </div>
                    <Switch checked={localMethods.konbini} onCheckedChange={() => handleToggleLocal("konbini")} />
                  </div>

                  {/* PayNow */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/20">
                    <div>
                      <p className="text-sm font-semibold">PayNow</p>
                      <p className="text-[11px] text-muted-foreground">Singapore</p>
                    </div>
                    <Switch checked={localMethods.paynow} onCheckedChange={() => handleToggleLocal("paynow")} />
                  </div>

                  {/* Przelewy24 */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/20">
                    <div>
                      <p className="text-sm font-semibold">Przelewy24</p>
                      <p className="text-[11px] text-muted-foreground">Poland</p>
                    </div>
                    <Switch checked={localMethods.przelewy24} onCheckedChange={() => handleToggleLocal("przelewy24")} />
                  </div>

                  {/* Pix */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/20">
                    <div>
                      <p className="text-sm font-semibold">Pix</p>
                      <p className="text-[11px] text-muted-foreground">Brazil</p>
                    </div>
                    <Switch checked={localMethods.pix} onCheckedChange={() => handleToggleLocal("pix")} />
                  </div>

                  {/* FPX */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/20">
                    <div>
                      <p className="text-sm font-semibold">FPX</p>
                      <p className="text-[11px] text-muted-foreground">Malaysia</p>
                    </div>
                    <Switch checked={localMethods.fpx} onCheckedChange={() => handleToggleLocal("fpx")} />
                  </div>

                  {/* TWINT */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/20">
                    <div>
                      <p className="text-sm font-semibold">TWINT</p>
                      <p className="text-[11px] text-muted-foreground">Switzerland</p>
                    </div>
                    <Switch checked={localMethods.twint} onCheckedChange={() => handleToggleLocal("twint")} />
                  </div>

                  {/* Zip */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/20 col-span-1 sm:col-span-2">
                    <div>
                      <p className="text-sm font-semibold">Zip</p>
                      <p className="text-[11px] text-muted-foreground">Australia</p>
                    </div>
                    <Switch checked={localMethods.zip} onCheckedChange={() => handleToggleLocal("zip")} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Sidebar & Payouts */}
        <div className="space-y-8">
          
          {/* Invoicing Info */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Invoicing</CardTitle>
                <CardDescription>Guest receipt specifications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                setTempInvoicing({ ...invoicing });
                setShowEditInvoicing(true);
              }} className="text-primary hover:text-primary/95 text-xs font-semibold rounded-full px-3 h-8">
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Your seller information shown on guest invoices.</p>
              
              <div className="space-y-3 pt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Seller Name</span>
                  <p className="text-sm font-medium text-foreground">{invoicing.sellerName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Address</span>
                  <p className="text-sm text-foreground">{invoicing.address || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Memo</span>
                  <p className="text-sm text-foreground">{invoicing.memo || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Tax</CardTitle>
              <CardDescription>Calculate and add taxes on tickets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Calculate and add taxes on top of ticket prices. Upgrade to EventSpark Plus to collect taxes.
              </p>
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold rounded-full" onClick={() => setShowTaxPlusModal(true)}>
                Learn More
              </Button>
            </CardContent>
          </Card>

          {/* Refund Policy */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg">Refund Policy</CardTitle>
                <CardDescription>Displayed on public event checkouts</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                setTempRefund(refundPolicy);
                setShowRefundModal(true);
              }} className="text-primary hover:text-primary/95 text-xs font-semibold rounded-full px-3 h-8">
                {refundPolicy ? "Edit" : "Add"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {refundPolicy ? (
                <div className="p-3 bg-muted/40 rounded-xl border border-border/40 flex items-start gap-2">
                  <Undo2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground font-medium leading-normal">{refundPolicy}</p>
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed border-border/40 rounded-xl">
                  <p className="text-xs font-semibold text-foreground/80 mb-0.5">No Refund Policy</p>
                  <p className="text-[11px] text-muted-foreground px-2">Let guests know what your refund policy is.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sales and Payouts History Section */}
      <div className="space-y-6 pt-6 border-t border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold">Sales & Payouts</h2>
            <p className="text-sm text-muted-foreground">Monitor transaction logs and calendar payouts.</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold ml-auto" onClick={handleDownloadCSV}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download as CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sales History */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-semibold">Sales History</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {sales.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-full bg-muted grid place-items-center mx-auto mb-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground/80">No Transactions</h4>
                  <p className="text-xs text-muted-foreground">You have not made any sales.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Event</TableHead>
                        <TableHead className="text-xs">Buyer</TableHead>
                        <TableHead className="text-xs text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((txn) => (
                        <TableRow key={txn.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="py-2.5">
                            <p className="text-xs font-medium text-foreground truncate max-w-[150px]">{txn.event}</p>
                            <p className="text-[10px] text-muted-foreground">{txn.date}</p>
                          </TableCell>
                          <TableCell className="text-xs py-2.5">{txn.buyer}</TableCell>
                          <TableCell className="text-xs text-right font-medium text-foreground py-2.5">${txn.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-semibold">Payout History</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full bg-muted grid place-items-center mx-auto mb-3">
                  <Building className="w-5 h-5 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-sm text-foreground/80">No Payouts</h4>
                <p className="text-xs text-muted-foreground">There are no payouts associated with this calendar.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog: Create Coupon */}
      <Dialog open={showCreateCoupon} onOpenChange={setShowCreateCoupon}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateCoupon}>
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
              <DialogDescription>
                Add a new discount code for your tickets.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code" className="text-xs font-bold uppercase text-muted-foreground">Coupon Code</Label>
                <Input
                  id="code"
                  placeholder="E.g. EARLYBIRD20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount" className="text-xs font-bold uppercase text-muted-foreground">Discount Value</Label>
                <Input
                  id="discount"
                  placeholder="E.g. 20% or $10"
                  value={couponDiscount}
                  onChange={(e) => setCouponDiscount(e.target.value)}
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limit" className="text-xs font-bold uppercase text-muted-foreground">Usage Limit (Optional)</Label>
                <Input
                  id="limit"
                  placeholder="E.g. 50"
                  type="number"
                  value={couponLimit}
                  onChange={(e) => setCouponLimit(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-full text-xs font-semibold" onClick={() => setShowCreateCoupon(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                Create Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Invoicing */}
      <Dialog open={showEditInvoicing} onOpenChange={setShowEditInvoicing}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveInvoicing}>
            <DialogHeader>
              <DialogTitle>Edit Seller Details</DialogTitle>
              <DialogDescription>
                Update the invoicing info displayed on client receipts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sellerName" className="text-xs font-bold uppercase text-muted-foreground">Seller Name</Label>
                <Input
                  id="sellerName"
                  value={tempInvoicing.sellerName}
                  onChange={(e) => setTempInvoicing({ ...tempInvoicing, sellerName: e.target.value })}
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-xs font-bold uppercase text-muted-foreground">Seller Address</Label>
                <Input
                  id="address"
                  placeholder="Street, City, Zip, Country"
                  value={tempInvoicing.address}
                  onChange={(e) => setTempInvoicing({ ...tempInvoicing, address: e.target.value })}
                  className="rounded-xl h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="memo" className="text-xs font-bold uppercase text-muted-foreground">Memo/Tax ID</Label>
                <Input
                  id="memo"
                  placeholder="E.g. Tax ID or business note"
                  value={tempInvoicing.memo}
                  onChange={(e) => setTempInvoicing({ ...tempInvoicing, memo: e.target.value })}
                  className="rounded-xl h-10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-full text-xs font-semibold" onClick={() => setShowEditInvoicing(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full text-xs font-semibold">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Tax Plus Upgrade */}
      <Dialog open={showTaxPlusModal} onOpenChange={setShowTaxPlusModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-950/20 text-pink-500 flex items-center justify-center mx-auto mb-2 text-xl">
              ✨
            </div>
            <DialogTitle className="text-center font-display font-bold">Upgrade to EventSpark Plus</DialogTitle>
            <DialogDescription className="text-center text-xs leading-relaxed">
              Collecting taxes from guests requires an active subscription to EventSpark Plus. Automate tax rates calculation for over 40+ countries.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2.5">
            <div className="flex items-center gap-2 text-xs">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Automatic VAT/GST & local sales tax collection</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Customizable tax invoices with PDF downloads</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full accounting exports for tax seasons</span>
            </div>
          </div>
          <DialogFooter className="sm:justify-center pt-2">
            <Button className="rounded-full w-full bg-[#19192E] text-white hover:bg-[#19192E]/90 dark:bg-primary dark:hover:bg-primary/90 font-semibold" onClick={() => setShowTaxPlusModal(false)}>
              Upgrade Now for $19/mo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Add Refund Policy */}
      <Dialog open={showRefundModal} onOpenChange={setShowRefundModal}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveRefundPolicy}>
            <DialogHeader>
              <DialogTitle>Update Refund Policy</DialogTitle>
              <DialogDescription>
                Define the refund criteria shown to guests before registration.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="refund" className="text-xs font-bold uppercase text-muted-foreground">Refund Policy Text</Label>
                <Input
                  id="refund"
                  placeholder="E.g. Free cancellation up to 48 hours before the event."
                  value={tempRefund}
                  onChange={(e) => setTempRefund(e.target.value)}
                  className="rounded-xl h-10"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-full text-xs font-semibold" onClick={() => setShowRefundModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full text-xs font-semibold">
                Save Policy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
