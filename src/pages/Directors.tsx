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

export default function Directors() {
  const { isAdmin } = useAuth();
  const { directors, directorRoles, addDirector, updateDirector, deleteDirector, addDirectorRole, deleteDirectorRole, loading } = useApp();
  const [selected, setSelected] = useState<Director | null>(null);
  const [editing, setEditing] = useState<Partial<Director> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Directors</h1>
          <p className="text-sm text-muted-foreground">Uttara Vilas প্রকল্পের পরিচালনা পর্ষদ</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => setRolesOpen(true)} variant="outline" className="gap-2"><Settings className="w-4 h-4" /> Manage Roles</Button>
            <Button onClick={() => setAddOpen(true)} className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Director</Button>
          </div>
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
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setSelected(d); setEditing({ ...d }); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(d.id); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {directors.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">No directors yet</p>
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
