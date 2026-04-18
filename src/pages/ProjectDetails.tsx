import { useState, useEffect } from 'react';
import { MapPin, Building2, Home, Layers, DollarSign, Users, Calendar, Phone, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
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
  hero: { title: '🏗️ Uttara Vilas', tagline: 'Your Future, Your Address', description: '' },
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
      <Button onClick={() => setEditingSection(section)} variant="ghost" size="sm" className="h-7 px-2 gap-1">
        <Edit className="w-3 h-3" /> Edit
      </Button>
    ) : null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="gradient-primary rounded-xl p-6 text-primary-foreground relative">
        <h1 className="text-2xl lg:text-3xl font-bold">{hero.title}</h1>
        <p className="text-primary-foreground/80 text-lg mt-1">{hero.tagline}</p>
        <p className="text-primary-foreground/70 text-sm mt-2 whitespace-pre-line">{hero.description}</p>
        {isAdmin && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button onClick={() => setEditingSection('hero')} variant="secondary" size="sm" className="gap-2"><Edit className="w-3.5 h-3.5" /> Hero</Button>
            {!editOpen && <Button onClick={openEdit} variant="secondary" size="sm" className="gap-2"><Edit className="w-3.5 h-3.5" /> Numbers</Button>}
          </div>
        )}
      </div>

      {/* Numbers edit */}
      {isAdmin && editOpen && (
        <Card className="shadow-card border-primary">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">⚙️ Project Numbers</CardTitle>
            <button onClick={() => setEditOpen(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>জমির মোট মূল্য (৳)</Label><Input type="number" value={form.land_price_total} onChange={e => setForm(p => ({ ...p, land_price_total: e.target.value }))} /><p className="text-xs text-muted-foreground mt-1">{formatBdtBangla(Number(form.land_price_total) || 0)}</p></div>
              <div><Label>মোট শেয়ার সংখ্যা</Label><Input type="number" value={form.target_shareholders} onChange={e => setForm(p => ({ ...p, target_shareholders: e.target.value }))} /></div>
              <div><Label>প্রতি শেয়ারের মূল্য (৳)</Label><Input type="number" value={form.share_price} onChange={e => setForm(p => ({ ...p, share_price: e.target.value }))} /></div>
              <div><Label>বুকিং মানি (৳)</Label><Input type="number" value={form.booking_max} onChange={e => setForm(p => ({ ...p, booking_max: e.target.value }))} /></div>
              <div><Label>মাসিক ইনস্টলমেন্ট (৳)</Label><Input type="number" value={form.installment_amount} onChange={e => setForm(p => ({ ...p, installment_amount: e.target.value }))} /></div>
              <div><Label>মোট মাস</Label><Input type="number" value={form.installment_months} onChange={e => setForm(p => ({ ...p, installment_months: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</Button>
              <Button onClick={() => setEditOpen(false)} variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section editor (inline below the section being edited) */}
      {editingSection && draft && (
        <Card className="shadow-card border-primary">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">✏️ Editing: {editingSection}</CardTitle>
            <button onClick={() => setEditingSection(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
          </CardHeader>
          <CardContent className="space-y-3">
            {editingSection === 'hero' && (
              <>
                <div><Label>Title</Label><Input value={draft.title || ''} onChange={e => setDraft({ ...draft, title: e.target.value })} /></div>
                <div><Label>Tagline</Label><Input value={draft.tagline || ''} onChange={e => setDraft({ ...draft, tagline: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea rows={3} value={draft.description || ''} onChange={e => setDraft({ ...draft, description: e.target.value })} /></div>
              </>
            )}
            {(editingSection === 'location' || editingSection === 'features' || editingSection === 'why') && (
              <div className="space-y-2">
                <Label>Items</Label>
                {(draft.items || []).map((item: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input value={item} onChange={e => { const items = [...draft.items]; items[i] = e.target.value; setDraft({ ...draft, items }); }} />
                    <Button type="button" variant="outline" size="icon" onClick={() => { const items = draft.items.filter((_: any, x: number) => x !== i); setDraft({ ...draft, items }); }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setDraft({ ...draft, items: [...(draft.items || []), ''] })} className="gap-1"><Plus className="w-3 h-3" /> Add item</Button>
              </div>
            )}
            {editingSection === 'overview' && (
              <div className="space-y-2">
                <Label>Specs (label / value)</Label>
                {(draft.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Label" value={item.label} onChange={e => { const items = [...draft.items]; items[i] = { ...items[i], label: e.target.value }; setDraft({ ...draft, items }); }} />
                    <Input placeholder="Value" value={item.value} onChange={e => { const items = [...draft.items]; items[i] = { ...items[i], value: e.target.value }; setDraft({ ...draft, items }); }} />
                    <Button type="button" variant="outline" size="icon" onClick={() => { const items = draft.items.filter((_: any, x: number) => x !== i); setDraft({ ...draft, items }); }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setDraft({ ...draft, items: [...(draft.items || []), { label: '', value: '' }] })} className="gap-1"><Plus className="w-3 h-3" /> Add spec</Button>
              </div>
            )}
            {editingSection === 'income' && (
              <>
                <div><Label>Current Title</Label><Input value={draft.current_title || ''} onChange={e => setDraft({ ...draft, current_title: e.target.value })} /></div>
                <div><Label>Current Text</Label><Textarea rows={3} value={draft.current_text || ''} onChange={e => setDraft({ ...draft, current_text: e.target.value })} /></div>
                <div><Label>Future Title</Label><Input value={draft.future_title || ''} onChange={e => setDraft({ ...draft, future_title: e.target.value })} /></div>
                <div><Label>Future Text</Label><Textarea rows={3} value={draft.future_text || ''} onChange={e => setDraft({ ...draft, future_text: e.target.value })} /></div>
              </>
            )}
            {editingSection === 'timeline' && (
              <div className="space-y-2">
                <Label>Timeline events</Label>
                {(draft.items || []).map((item: any, i: number) => (
                  <div key={i} className="grid grid-cols-[60px_1fr_100px_44px] gap-2">
                    <Input placeholder="emoji" value={item.emoji} onChange={e => { const items = [...draft.items]; items[i] = { ...items[i], emoji: e.target.value }; setDraft({ ...draft, items }); }} />
                    <Input placeholder="Text" value={item.text} onChange={e => { const items = [...draft.items]; items[i] = { ...items[i], text: e.target.value }; setDraft({ ...draft, items }); }} />
                    <Input placeholder="primary/warning/success" value={item.color} onChange={e => { const items = [...draft.items]; items[i] = { ...items[i], color: e.target.value }; setDraft({ ...draft, items }); }} />
                    <Button type="button" variant="outline" size="icon" onClick={() => { const items = draft.items.filter((_: any, x: number) => x !== i); setDraft({ ...draft, items }); }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setDraft({ ...draft, items: [...(draft.items || []), { emoji: '📌', text: '', color: 'primary' }] })} className="gap-1"><Plus className="w-3 h-3" /> Add event</Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={saveSection} disabled={saving} className="gradient-primary text-primary-foreground gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</Button>
              <Button onClick={() => setEditingSection(null)} variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> লোকেশন হাইলাইটস</CardTitle>
          <EditBtn section="location" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(location.items || []).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-card-foreground"><span className="text-primary mt-0.5">📍</span> {item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Overview */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Layers className="w-5 h-5 text-primary" /> প্রকল্প ওভারভিউ</CardTitle>
          <EditBtn section="overview" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {(overview.items || []).map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted text-center">
                <Building2 className="w-5 h-5 text-primary mx-auto mb-1.5" />
                <p className="text-base font-bold text-card-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
            <div className="p-3 rounded-lg bg-muted text-center">
              <Home className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="text-base font-bold text-card-foreground">{target}টি</p>
              <p className="text-xs text-muted-foreground">মোট ইউনিট</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">🌟 স্পেশাল ফিচারস</CardTitle>
          <EditBtn section="features" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(features.items || []).map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-card-foreground"><span className="text-primary">✔️</span> {f}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Highlights — driven by settings */}
      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> ইনভেস্টমেন্ট হাইলাইটস</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted"><p className="text-muted-foreground">জমির মোট মূল্য</p><p className="text-lg font-bold text-card-foreground">{formatBdtBangla(landPrice)}</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-muted-foreground">মোট শেয়ার</p><p className="text-lg font-bold text-card-foreground">{target} জন</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-muted-foreground">প্রতি শেয়ারের মূল্য</p><p className="text-lg font-bold text-card-foreground">{formatBdtBangla(sharePrice)}</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-muted-foreground">বুকিং মানি</p><p className="text-lg font-bold text-card-foreground">{formatBdtBangla(bookingMax)}</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-muted-foreground">মাসিক ইনস্টলমেন্ট</p><p className="text-lg font-bold text-card-foreground">{formatBdtBangla(instAmount)} × {instMonths} মাস</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-muted-foreground">মোট ইনস্টলমেন্ট সম্ভাবনা</p><p className="text-lg font-bold text-card-foreground">{formatBdtBangla(instAmount * instMonths * target)}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Income */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">📈 আয়ের সুযোগ</CardTitle>
          <EditBtn section="income" />
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-card-foreground">
          <div className="p-3 rounded-lg bg-muted">
            <p className="font-semibold">{income.current_title}</p>
            <p className="whitespace-pre-line">{income.current_text}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="font-semibold">{income.future_title}</p>
            <p className="whitespace-pre-line">{income.future_text}</p>
          </div>
        </CardContent>
      </Card>

      {/* Why */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">🚀 কেন Uttara Vilas?</CardTitle>
          <EditBtn section="why" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-card-foreground">
            {(why.items || []).map((w, i) => (<li key={i}>{w}</li>))}
          </ul>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> টাইমলাইন</CardTitle>
          <EditBtn section="timeline" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-card-foreground">
            {(timeline.items || []).map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 bg-${t.color || 'primary'}`} />
                <p>{t.emoji} {t.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Phone className="w-5 h-5 text-primary" /> যোগাযোগ</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">বিস্তারিত জানতে বা বুকিং করতে Directors-দের সাথে যোগাযোগ করুন:</p>
          <Link to="/directors"><Button className="gradient-primary text-primary-foreground gap-2"><Users className="w-4 h-4" /> View Directors</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}
