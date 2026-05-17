import { useState } from 'react';
import { Phone, Edit, Save, X, Plus, Trash2, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { uploadImage } from '@/lib/storage';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Director } from '@/types';
import { PROJECT } from '@/config/project';

export default function Directors() {
  const { isAdmin } = useAuth();
  const { directors, directorRoles, addDirector, updateDirector, deleteDirector, addDirectorRole, deleteDirectorRole, loading } = useApp();
  const [selected, setSelected] = useState<Director | null>(null);
  const [editing, setEditing] = useState<Partial<Director> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', role: '', phone: '', bio: '' });
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!editing || !selected) return;
    setSubmitting(true);
    try {
      let imageUrl = editing.image_url || '';
      let signatureUrl = editing.signature_url || '';
      if (imageFile) {
        imageUrl = await uploadImage('shareholder-images', imageFile, 'directors');
      }
      if (signatureFile) {
        signatureUrl = await uploadImage('director-signatures', signatureFile, 'sigs');
      }
      await updateDirector(selected.id, { ...editing, image_url: imageUrl, signature_url: signatureUrl });
      setEditing(null); setImageFile(null); setSignatureFile(null);
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

  const handleAddRole = async () => {
    const name = newRoleName.trim();
    if (!name) return;
    try {
      await addDirectorRole(name);
      setNewRoleName('');
      toast.success('Role added!');
    } catch { toast.error('Role exists or failed'); }
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;
    await deleteDirectorRole(deleteRoleId);
    setDeleteRoleId(null);
    toast.success('Role deleted!');
  };

  const handleDeleteDirector = async () => {
    if (!deleteId) return;
    await deleteDirector(deleteId);
    setDeleteId(null);
    setSelected(null); setEditing(null);
    toast.success('Director deleted!');
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Board of Directors</h1>
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mt-1">{PROJECT.name} by Prottasa Holdings</p>
          <p className="text-sm text-muted-foreground mt-0.5">প্রকল্পের পরিচালনা পর্ষদ</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => setRolesOpen(true)} variant="outline" className="gap-2"><Settings className="w-4 h-4" /> Manage Roles</Button>
            <Button onClick={() => setAddOpen(true)} className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Director</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {directors.map((d, i) => (
          <div key={d.id} className="relative group cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 60}ms` }} onClick={() => { setSelected(d); setEditing(null); }}>
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/50 to-blue-500/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <Card className="relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    {d.image_url ? (
                      <img src={d.image_url} alt={d.name} className="w-32 h-32 rounded-full object-cover shadow-2xl ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 flex-shrink-0" />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-4xl shadow-2xl ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 flex-shrink-0">{d.name.charAt(0)}</div>
                    )}
                    <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none"></div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-xl tracking-tight">{d.name}</h3>
                    <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{d.role}</Badge>
                    <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-3 font-medium">
                      <Phone className="w-3.5 h-3.5 text-primary/70" /> {d.phone}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(d); setEditing({ ...d }); }} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors shadow-sm" title="Edit Director"><Edit className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(d.id); }} className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors shadow-sm" title="Delete Director"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        {directors.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <p className="text-muted-foreground font-medium">No directors added yet</p>
            {isAdmin && <Button onClick={() => setAddOpen(true)} className="mt-4 gradient-primary">Add First Director</Button>}
          </div>
        )}
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
                <div className="flex gap-2">
                  <Button onClick={() => setEditing({ ...selected })} variant="outline" className="flex-1 gap-2"><Edit className="w-4 h-4" /> Edit</Button>
                  <Button onClick={() => setDeleteId(selected.id)} variant="outline" className="flex-1 gap-2 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /> Delete</Button>
                </div>
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
                <div className="w-full"><Label>Profile Image</Label><Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} /></div>
              </div>
              <div><Label>Name</Label><Input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} /></div>
              <div>
                <Label>Role</Label>
                <Select value={editing.role || ''} onValueChange={v => setEditing(p => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {directorRoles.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Phone</Label><Input value={editing.phone || ''} onChange={e => setEditing(p => ({ ...p, phone: e.target.value }))} /></div>
              <div><Label>Bio</Label><Textarea value={editing.bio || ''} onChange={e => setEditing(p => ({ ...p, bio: e.target.value }))} rows={3} /></div>
              <div className="border border-border rounded-lg p-3 bg-muted/30">
                <Label className="text-sm font-semibold">✍️ Signature (রিসিপ্টে দেখা যাবে)</Label>
                <p className="text-xs text-muted-foreground mb-2">PNG বা JPG, transparent background ভাল হয়</p>
                {(editing.signature_url || signatureFile) && (
                  <div className="bg-white border border-border rounded p-2 mb-2 inline-block">
                    <img src={signatureFile ? URL.createObjectURL(signatureFile) : editing.signature_url || ''} alt="signature" className="h-16 max-w-[200px] object-contain" />
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={e => setSignatureFile(e.target.files?.[0] || null)} />
                {editing.signature_url && (
                  <button type="button" onClick={() => setEditing(p => ({ ...p, signature_url: '' }))} className="text-xs text-destructive hover:underline mt-1">সিগনেচার সরান</button>
                )}
              </div>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Director</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><Label>Name *</Label><Input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div>
              <Label>Role</Label>
              <Select value={addForm.role} onValueChange={v => setAddForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {directorRoles.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Need a new role? Use "Manage Roles" button.</p>
            </div>
            <div><Label>Phone</Label><Input value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div><Label>Bio</Label><Textarea value={addForm.bio} onChange={e => setAddForm(p => ({ ...p, bio: e.target.value }))} rows={3} /></div>
            <div><Label>Image</Label><Input type="file" accept="image/*" onChange={e => setAddImageFile(e.target.files?.[0] || null)} /></div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>{submitting ? 'Adding...' : 'Add Director'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={rolesOpen} onOpenChange={setRolesOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Manage Director Roles</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="New role name (e.g. Vice Chairman)" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRole(); } }} />
              <Button onClick={handleAddRole} className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add</Button>
            </div>
            <div className="space-y-2">
              {directorRoles.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No roles yet. Add one above.</p>}
              {directorRoles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.name}</Badge>
                  </div>
                  <button onClick={() => setDeleteRoleId(r.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete director?</AlertDialogTitle><AlertDialogDescription>This will permanently remove this director.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDirector} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteRoleId} onOpenChange={(open) => !open && setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this role?</AlertDialogTitle><AlertDialogDescription>Existing directors with this role will keep their assigned text, but it won't appear in the picker.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
