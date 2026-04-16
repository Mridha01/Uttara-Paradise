import { useState } from 'react';
import { Phone, Edit, Save, X, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { uploadImage } from '@/lib/storage';
import { toast } from 'sonner';
import type { Director } from '@/types';

export default function Directors() {
  const { isAdmin } = useAuth();
  const { directors, addDirector, updateDirector, loading } = useApp();
  const [selected, setSelected] = useState<Director | null>(null);
  const [editing, setEditing] = useState<Partial<Director> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', role: '', phone: '', bio: '' });
  const [addImageFile, setAddImageFile] = useState<File | null>(null);

  const handleSave = async () => {
    if (!editing || !selected) return;
    setSubmitting(true);
    try {
      let imageUrl = editing.image_url || '';
      if (imageFile) {
        imageUrl = await uploadImage('shareholder-images', imageFile, 'directors');
      }
      await updateDirector(selected.id, { ...editing, image_url: imageUrl });
      setEditing(null); setImageFile(null);
      setSelected(null);
      toast.success('Director updated!');
    } catch { toast.error('Failed to update'); }
    setSubmitting(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (addImageFile) {
        imageUrl = await uploadImage('shareholder-images', addImageFile, 'directors');
      }
      await addDirector({ name: addForm.name, role: addForm.role, phone: addForm.phone, bio: addForm.bio, image_url: imageUrl, display_order: directors.length });
      setAddForm({ name: '', role: '', phone: '', bio: '' }); setAddImageFile(null);
      setAddOpen(false);
      toast.success('Director added!');
    } catch { toast.error('Failed to add'); }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Directors</h1>
          <p className="text-sm text-muted-foreground">Uttara Vilas প্রকল্পের পরিচালনা পর্ষদ</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setAddOpen(true)} className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Director</Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {directors.map((d, i) => (
          <Card key={d.id} className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 60}ms` }} onClick={() => { setSelected(d); setEditing(null); }}>
            <CardContent className="p-5">
              <div className="flex flex-col items-center text-center gap-3">
                {d.image_url ? (
                  <img src={d.image_url} alt={d.name} className="w-28 h-28 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-28 h-28 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-3xl flex-shrink-0">{d.name.charAt(0)}</div>
                )}
                <div>
                  <h3 className="font-semibold text-card-foreground text-lg">{d.name}</h3>
                  <p className="text-sm text-muted-foreground">{d.role}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1"><Phone className="w-3 h-3" /> {d.phone}</div>
                </div>
                {isAdmin && (
                  <button onClick={(e) => { e.stopPropagation(); setSelected(d); setEditing({ ...d }); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-4 h-4" /></button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail/Edit Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setEditing(null); } }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Director Details</DialogTitle></DialogHeader>
          {selected && !editing && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                {selected.image_url ? (
                  <img src={selected.image_url} alt={selected.name} className="w-40 h-40 rounded-xl object-cover" />
                ) : (
                  <div className="w-40 h-40 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-5xl">{selected.name.charAt(0)}</div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-card-foreground">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.role}</p>
                </div>
              </div>
              <p className="text-sm text-card-foreground text-center">{selected.bio}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 justify-center"><Phone className="w-4 h-4 text-primary" /><span className="text-card-foreground">{selected.phone}</span></div>
              </div>
              {isAdmin && (
                <Button onClick={() => setEditing({ ...selected })} variant="outline" className="w-full gap-2"><Edit className="w-4 h-4" /> Edit Director</Button>
              )}
            </div>
          )}
          {editing && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                {(editing.image_url || imageFile) ? (
                  <img src={imageFile ? URL.createObjectURL(imageFile) : editing.image_url} alt="" className="w-32 h-32 rounded-xl object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-4xl">{editing.name?.charAt(0)}</div>
                )}
                <div><Label>Profile Image</Label><Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} /></div>
              </div>
              <div><Label>Name</Label><Input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Role</Label><Input value={editing.role || ''} onChange={e => setEditing(p => ({ ...p, role: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={editing.phone || ''} onChange={e => setEditing(p => ({ ...p, phone: e.target.value }))} /></div>
              <div><Label>Bio</Label><Textarea value={editing.bio || ''} onChange={e => setEditing(p => ({ ...p, bio: e.target.value }))} rows={3} /></div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1 gradient-primary text-primary-foreground gap-2" disabled={submitting}><Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save'}</Button>
                <Button onClick={() => setEditing(null)} variant="outline" className="gap-2"><X className="w-4 h-4" /> Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Director Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Director</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><Label>Name *</Label><Input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div><Label>Role</Label><Input value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))} /></div>
            <div><Label>Phone</Label><Input value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div><Label>Bio</Label><Textarea value={addForm.bio} onChange={e => setAddForm(p => ({ ...p, bio: e.target.value }))} rows={3} /></div>
            <div><Label>Image</Label><Input type="file" accept="image/*" onChange={e => setAddImageFile(e.target.files?.[0] || null)} /></div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>{submitting ? 'Adding...' : 'Add Director'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
