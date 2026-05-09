import { useState, useEffect } from 'react';
import { MapPin, Building2, Home, Layers, DollarSign, Users, Calendar, Phone, Edit, Save, X, Plus, Trash2, CheckCircle2, TrendingUp, Rocket, Star, Sparkles, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { TOTAL_LAND_COST, TARGET_SHAREHOLDERS, TOTAL_SHARE_AMOUNT, MAX_BOOKING_AMOUNT, INSTALLMENT_AMOUNT, INSTALLMENT_MONTHS, formatBdtBangla } from '@/types';
import { toast } from 'sonner';

const DEFAULTS: Record<string, any> = {
  hero: { title: '🏗️ Uttara Paradise', tagline: 'Your Future, Your Address', description: '' },
  location: { items: [] as string[] },
  overview: { items: [] as { label: string; value: string }[] },
  features: { items: [] as string[] },
  income: { current_title: '', current_text: '', future_title: '', future_text: '' },
  why: { items: [] as string[] },
  timeline: { items: [] as { emoji: string; text: string; color: string }[] },
};

function useSection<T = any>(section: string, content: Record<string, any>): T {
  return (content[section] ?? DEFAULTS[section]) as T;
}

export default function ProjectDetails() {
  const { settings, updateSetting, projectContent, updateProjectContent } = useApp();
  const { isAdmin } = useAuth();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const landPrice = Number(settings.land_price_total) || TOTAL_LAND_COST;
  const target = Number(settings.target_shareholders) || TARGET_SHAREHOLDERS;
  const sharePrice = Number(settings.share_price) || TOTAL_SHARE_AMOUNT;
  const bookingMax = Number(settings.booking_max) || MAX_BOOKING_AMOUNT;
  const instAmount = Number(settings.installment_amount) || INSTALLMENT_AMOUNT;
  const instMonths = Number(settings.installment_months) || INSTALLMENT_MONTHS;

  const hero = useSection<typeof DEFAULTS.hero>('hero', projectContent);
  const location = useSection<typeof DEFAULTS.location>('location', projectContent);
  const overview = useSection<typeof DEFAULTS.overview>('overview', projectContent);
  const features = useSection<typeof DEFAULTS.features>('features', projectContent);
  const income = useSection<typeof DEFAULTS.income>('income', projectContent);
  const why = useSection<typeof DEFAULTS.why>('why', projectContent);
  const timeline = useSection<typeof DEFAULTS.timeline>('timeline', projectContent);

  const [form, setForm] = useState({
    land_price_total: String(landPrice),
    target_shareholders: String(target),
    share_price: String(sharePrice),
    booking_max: String(bookingMax),
    installment_amount: String(instAmount),
    installment_months: String(instMonths),
  });

  const [draft, setDraft] = useState<any>(null);
  useEffect(() => {
    if (editingSection) {
      setDraft(JSON.parse(JSON.stringify(projectContent[editingSection] ?? DEFAULTS[editingSection])));
    } else {
      setDraft(null);
    }
  }, [editingSection, projectContent]);

  const openEdit = () => {
    setForm({
      land_price_total: String(landPrice),
      target_shareholders: String(target),
      share_price: String(sharePrice),
      booking_max: String(bookingMax),
      installment_amount: String(instAmount),
      installment_months: String(instMonths),
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(Object.entries(form).map(([k, v]) => updateSetting(k, v)));
      toast.success('Project settings updated!');
      setEditOpen(false);
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  const saveSection = async () => {
    if (!editingSection || !draft) return;
    setSaving(true);
    try {
      await updateProjectContent(editingSection, draft);
      toast.success(`${editingSection} updated!`);
      setEditingSection(null);
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const EditBtn = ({ section }: { section: string }) =>
    isAdmin ? (
      <Button
        onClick={() => setEditingSection(section)}
        variant="outline"
        size="sm"
        className="h-8 px-3 gap-1.5 border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-semibold rounded-full"
      >
        <Edit className="w-3.5 h-3.5" /> Edit
      </Button>
    ) : null;

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Hero */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 shadow-2xl p-6 lg:p-8 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-[100px] opacity-60 group-hover:opacity-80 transition-opacity duration-1000"></div>
        <div className="absolute -bottom-32 -left-32 w-[20rem] h-[20rem] bg-indigo-500/20 rounded-full blur-[80px] opacity-50"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
              <Star className="w-3 h-3" /> Exclusive Real Estate
            </div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-2">
              {hero.title.replace('Uttara Vilas', 'Uttara Paradise')}
            </h1>
            <p className="text-blue-200 text-lg lg:text-xl font-light tracking-wide mb-4">{hero.tagline}</p>
            {hero.description && (
              <p className="text-blue-100/70 text-sm leading-relaxed max-w-2xl whitespace-pre-line bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                {hero.description}
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <Button onClick={() => setEditingSection('hero')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-xl h-10 px-4 shadow-lg transition-all text-sm">
                <Edit className="w-4 h-4 mr-1.5" /> Edit Hero
              </Button>
              {!editOpen && (
                <Button onClick={openEdit} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/25 rounded-xl h-10 px-4 transition-all hover:scale-105 text-sm">
                  <Edit className="w-4 h-4 mr-1.5" /> Edit Numbers
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Numbers config edit panel */}
      {isAdmin && editOpen && (
        <Card className="shadow-2xl border-blue-500/30 bg-card/80 backdrop-blur-xl rounded-3xl animate-in fade-in slide-in-from-top-4 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 w-full"></div>
          <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-500"><Building2 className="w-5 h-5" /> Project Financial Configuration</CardTitle>
            <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors"><X className="w-5 h-5" /></button>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2"><Label className="text-foreground/80">জমির মোট মূল্য (৳)</Label><Input type="number" className="bg-background/50 h-11 text-lg font-bold" value={form.land_price_total} onChange={e => setForm(p => ({ ...p, land_price_total: e.target.value }))} /><p className="text-xs text-muted-foreground font-medium bg-muted/50 inline-block px-2 py-1 rounded">{formatBdtBangla(Number(form.land_price_total) || 0)}</p></div>
              <div className="space-y-2"><Label className="text-foreground/80">মোট শেয়ার সংখ্যা</Label><Input type="number" className="bg-background/50 h-11" value={form.target_shareholders} onChange={e => setForm(p => ({ ...p, target_shareholders: e.target.value }))} /></div>
              <div className="space-y-2"><Label className="text-foreground/80">প্রতি শেয়ারের মূল্য (৳)</Label><Input type="number" className="bg-background/50 h-11" value={form.share_price} onChange={e => setForm(p => ({ ...p, share_price: e.target.value }))} /></div>
              <div className="space-y-2"><Label className="text-foreground/80">বুকিং মানি (৳)</Label><Input type="number" className="bg-background/50 h-11 text-indigo-500 font-bold" value={form.booking_max} onChange={e => setForm(p => ({ ...p, booking_max: e.target.value }))} /></div>
              <div className="space-y-2"><Label className="text-foreground/80">মাসিক ইনস্টলমেন্ট (৳)</Label><Input type="number" className="bg-background/50 h-11 text-blue-500 font-bold" value={form.installment_amount} onChange={e => setForm(p => ({ ...p, installment_amount: e.target.value }))} /></div>
              <div className="space-y-2"><Label className="text-foreground/80">মোট মাস</Label><Input type="number" className="bg-background/50 h-11" value={form.installment_months} onChange={e => setForm(p => ({ ...p, installment_months: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white h-11 px-8 rounded-xl shadow-lg shadow-blue-500/25">
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
              <Button onClick={() => setEditOpen(false)} variant="outline" className="h-11 px-8 rounded-xl bg-background/50">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inline Section Editor */}
      {editingSection && draft && (
        <Card className="shadow-2xl border-primary/30 bg-card/80 backdrop-blur-xl rounded-3xl animate-in fade-in slide-in-from-top-4 overflow-hidden border-2 border-dashed">
          <div className="bg-primary/10 p-3 border-b border-primary/20 flex items-center justify-between">
            <p className="text-sm font-bold text-primary flex items-center gap-2"><Edit className="w-4 h-4" /> Live Editing: {editingSection.toUpperCase()}</p>
            <button onClick={() => setEditingSection(null)} className="p-1 rounded-md hover:bg-primary/20 text-primary transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <CardContent className="space-y-4 pt-6">
            {editingSection === 'hero' && (
              <div className="space-y-4">
                <div><Label>Title</Label><Input className="bg-background/50 mt-1" value={draft.title || ''} onChange={e => setDraft({ ...draft, title: e.target.value })} /></div>
                <div><Label>Tagline</Label><Input className="bg-background/50 mt-1" value={draft.tagline || ''} onChange={e => setDraft({ ...draft, tagline: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea className="bg-background/50 mt-1" rows={4} value={draft.description || ''} onChange={e => setDraft({ ...draft, description: e.target.value })} /></div>
              </div>
            )}
            {(editingSection === 'location' || editingSection === 'features' || editingSection === 'why') && (
              <div className="space-y-3">
                <Label className="text-sm font-bold">List Items</Label>
                <div className="space-y-2">
                  {(draft.items || []).map((item: string, i: number) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{i + 1}</div>
                      <Input className="bg-background/50" value={item} onChange={e => { const items = [...draft.items]; items[i] = e.target.value; setDraft({ ...draft, items }); }} />
                      <Button type="button" variant="destructive" size="icon" className="h-10 w-10 shrink-0 rounded-xl" onClick={() => { const items = draft.items.filter((_: any, x: number) => x !== i); setDraft({ ...draft, items }); }}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" className="w-full border-dashed mt-2" onClick={() => setDraft({ ...draft, items: [...(draft.items || []), ''] })}><Plus className="w-4 h-4 mr-2" /> Add New Item</Button>
              </div>
            )}
            {editingSection === 'overview' && (
              <div className="space-y-3">
                <Label className="text-sm font-bold">Specifications</Label>
                <div className="space-y-2">
                  {(draft.items || []).map((item: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="Label (e.g. Building Size)" className="bg-background/50" value={item.label} onChange={e => { const items = [...draft.items]; items[i] = { ...items[i], label: e.target.value }; setDraft({ ...draft, items }); }} />
                      <Input placeholder="Value (e.g. 5000 sqft)" className="bg-background/50" value={item.value} onChange={e => { const items = [...draft.items]; items[i] = { ...items[i], value: e.target.value }; setDraft({ ...draft, items }); }} />
                      <Button type="button" variant="destructive" size="icon" className="shrink-0" onClick={() => { const items = draft.items.filter((_: any, x: number) => x !== i); setDraft({ ...draft, items }); }}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" className="w-full border-dashed mt-2" onClick={() => setDraft({ ...draft, items: [...(draft.items || []), { label: '', value: '' }] })}><Plus className="w-4 h-4 mr-2" /> Add Specification</Button>
              </div>
            )}
            {editingSection === 'income' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="font-bold text-sm text-primary">Current Income Strategy</p>
                  <div><Label>Title</Label><Input className="bg-background/50 mt-1" value={draft.current_title || ''} onChange={e => setDraft({ ...draft, current_title: e.target.value })} /></div>
                  <div><Label>Description</Label><Textarea className="bg-background/50 mt-1" rows={4} value={draft.current_text || ''} onChange={e => setDraft({ ...draft, current_text: e.target.value })} /></div>
                </div>
                <div className="space-y-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="font-bold text-sm text-primary">Future Income Strategy</p>
                  <div><Label>Title</Label><Input className="bg-background/50 mt-1" value={draft.future_title || ''} onChange={e => setDraft({ ...draft, future_title: e.target.value })} /></div>
                  <div><Label>Description</Label><Textarea className="bg-background/50 mt-1" rows={4} value={draft.future_text || ''} onChange={e => setDraft({ ...draft, future_text: e.target.value })} /></div>
                </div>
              </div>
            )}
            {editingSection === 'timeline' && (
              <div className="space-y-3">
                <Label className="text-sm font-bold">Timeline Milestones</Label>
                <div className="space-y-2">
                  {(draft.items || []).map((item: any, i: number) => (
                    <div key={i} className="flex flex-wrap sm:flex-nowrap gap-2">
                      <Input placeholder="Emoji" className="bg-background/50 w-full sm:w-20 text-center" value={item.emoji} onChange={e => { const items = [...draft.items]; items[i] = { ...items[i], emoji: e.target.value }; setDraft({ ...draft, items }); }} />
                      <Input placeholder="Milestone description" className="bg-background/50 flex-1" value={item.text} onChange={e => { const items = [...draft.items]; items[i] = { ...items[i], text: e.target.value }; setDraft({ ...draft, items }); }} />
                      <Input placeholder="Color (e.g. primary)" className="bg-background/50 w-full sm:w-32" value={item.color} onChange={e => { const items = [...draft.items]; items[i] = { ...items[i], color: e.target.value }; setDraft({ ...draft, items }); }} />
                      <Button type="button" variant="destructive" size="icon" className="shrink-0" onClick={() => { const items = draft.items.filter((_: any, x: number) => x !== i); setDraft({ ...draft, items }); }}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" className="w-full border-dashed mt-2" onClick={() => setDraft({ ...draft, items: [...(draft.items || []), { emoji: '📌', text: '', color: 'primary' }] })}><Plus className="w-4 h-4 mr-2" /> Add Milestone</Button>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button onClick={saveSection} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 rounded-xl shadow-lg">
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Publish Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Location */}
        <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden group hover:bg-card/60 hover:border-white/10 transition-all duration-300">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Map className="w-6 h-6" /></div>
                <span>Location Highlights</span>
              </div>
              <EditBtn section="location" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {(location.items || []).map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0"><MapPin className="w-4 h-4" /></div>
                  <span className="text-sm font-medium text-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Why Uttara Paradise? */}
        <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden group hover:bg-card/60 hover:border-white/10 transition-all duration-300">
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-400 to-purple-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500"><Rocket className="w-6 h-6" /></div>
                <span>Why Uttara Paradise?</span>
              </div>
              <EditBtn section="why" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {(why.items || []).map((w, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-violet-500/10 text-violet-500 shrink-0"><Sparkles className="w-4 h-4" /></div>
                  <span className="text-sm font-medium text-foreground leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Overview & Specs */}
      <Card className="shadow-xl border-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-cyan-500"></div>
        <CardHeader className="pb-6">
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Layers className="w-6 h-6" /></div>
              <span>Project Specifications</span>
            </div>
            <EditBtn section="overview" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(overview.items || []).map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-background/50 border border-border/50 text-center hover:bg-muted/50 transition-colors">
                <Building2 className="w-6 h-6 text-blue-500 mx-auto mb-2 opacity-80" />
                <p className="text-lg font-bold text-foreground">{item.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-center shadow-inner">
              <Home className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{target} Units</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70 mt-1">Total Availability</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Features */}
      <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-400 to-pink-500"></div>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-500"><Star className="w-6 h-6" /></div>
              <span>Premium Features</span>
            </div>
            <EditBtn section="features" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {(features.items || []).map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-fuchsia-500 shrink-0" />
                <span className="text-sm font-medium text-foreground">{f}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Highlights */}
      <Card className="shadow-xl border-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden border-2 border-primary/20">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"></div>
        <CardHeader className="pb-6 bg-gradient-to-b from-primary/5 to-transparent">
          <CardTitle className="text-xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary"><DollarSign className="w-6 h-6" /></div>
            <span>Investment Highlights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-background/60 border border-border/50 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Land Value</p>
              <p className="text-2xl font-extrabold text-foreground">{formatBdtBangla(landPrice)}</p>
            </div>
            <div className="p-5 rounded-2xl bg-background/60 border border-border/50 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Shareholders</p>
              <p className="text-2xl font-extrabold text-foreground">{target} Members</p>
            </div>
            <div className="p-5 rounded-2xl bg-background/60 border border-border/50 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Price Per Share</p>
              <p className="text-2xl font-extrabold text-foreground">{formatBdtBangla(sharePrice)}</p>
            </div>
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Initial Booking Money</p>
              <p className="text-2xl font-extrabold text-primary">{formatBdtBangla(bookingMax)}</p>
            </div>
            <div className="p-5 rounded-2xl bg-background/60 border border-border/50 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Monthly Installment</p>
              <p className="text-2xl font-extrabold text-foreground">{formatBdtBangla(instAmount)} <span className="text-sm text-muted-foreground font-medium">× {instMonths} Months</span></p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Total Installment Potential</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatBdtBangla(instAmount * instMonths * target)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Opportunities */}
        <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-rose-400 to-orange-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500"><TrendingUp className="w-6 h-6" /></div>
                <span>Income Potential</span>
              </div>
              <EditBtn section="income" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-5 rounded-2xl bg-background/50 border border-border/50 hover:bg-muted/30 transition-colors">
              <p className="font-bold text-base text-foreground mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span>{income.current_title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-4">{income.current_text}</p>
            </div>
            <div className="p-5 rounded-2xl bg-background/50 border border-border/50 hover:bg-muted/30 transition-colors">
              <p className="font-bold text-base text-foreground mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span>{income.future_title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-4">{income.future_text}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 to-blue-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500"><Calendar className="w-6 h-6" /></div>
                <span>Project Timeline</span>
              </div>
              <EditBtn section="timeline" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
              {(timeline.items || []).map((t, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted text-xl shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                    {t.emoji}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/50 bg-background/50 shadow-sm group-hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-foreground leading-snug">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact CTA */}
      <Card className="shadow-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-transparent backdrop-blur-md rounded-3xl overflow-hidden text-center mt-8">
        <CardContent className="p-10 lg:p-14">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-6">
            <Phone className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to Join Us?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Contact our board of directors to learn more about availability, booking details, and securing your share.
          </p>
          <Link to="/directors">
            <Button className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/25 text-base font-semibold gap-2 transition-all hover:scale-105">
              <Users className="w-5 h-5" /> View Directors & Contact Info
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
