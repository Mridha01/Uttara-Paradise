import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { TOTAL_SHARE_AMOUNT } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ITEMS_PER_PAGE = 12;

export default function Shareholders() {
  const { shareholders, addShareholder, updateShareholder, deleteShareholder, directors, loading } = useApp();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', booking_date: new Date().toISOString().split('T')[0], num_shares: '1', referred_by_director_id: '' });
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', booking_date: '', num_shares: '1', profile_image_url: '', referred_by_director_id: '' });

  const filtered = shareholders.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search));
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage('shareholder-images', imageFile, 'profiles');
      }
      await addShareholder({
        name: form.name, phone: form.phone, address: form.address,
        profile_image_url: imageUrl, booking_date: form.booking_date,
        num_shares: Number(form.num_shares) || 1,
        total_share: (Number(form.num_shares) || 1) * TOTAL_SHARE_AMOUNT,
        referred_by_director_id: form.referred_by_director_id || null,
      });
      setForm({ name: '', phone: '', address: '', booking_date: new Date().toISOString().split('T')[0], num_shares: '1', referred_by_director_id: '' });
      setImageFile(null);
      setDialogOpen(false);
      toast.success('Shareholder added!');
    } catch { toast.error('Failed to add'); }
    setSubmitting(false);
  };

  const openEdit = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const s = shareholders.find(sh => sh.id === id);
    if (!s) return;
    setSelectedId(id);
    setEditForm({ name: s.name, phone: s.phone, address: s.address, booking_date: s.booking_date, num_shares: String(s.num_shares), profile_image_url: s.profile_image_url, referred_by_director_id: s.referred_by_director_id || '' });
    setEditImageFile(null);
    setEditDialogOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setSubmitting(true);
    try {
      let imageUrl = editForm.profile_image_url;
      if (editImageFile) {
        imageUrl = await uploadImage('shareholder-images', editImageFile, 'profiles');
      }
      await updateShareholder(selectedId, {
        name: editForm.name, phone: editForm.phone, address: editForm.address,
        booking_date: editForm.booking_date, profile_image_url: imageUrl,
        num_shares: Number(editForm.num_shares) || 1,
        referred_by_director_id: editForm.referred_by_director_id || null,
      });
      setEditDialogOpen(false);
      toast.success('Updated!');
    } catch { toast.error('Failed to update'); }
    setSubmitting(false);
  };

  const openDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setSelectedId(id); setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    await deleteShareholder(selectedId);
    setDeleteDialogOpen(false);
    toast.success('Deleted!');
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-foreground">Shareholders ({filtered.length})</h1>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Shareholder</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Shareholder</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <div><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required /></div>
                <div><Label>Address</Label><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
                <div><Label>Booking Date</Label><Input type="date" value={form.booking_date} onChange={e => setForm(p => ({ ...p, booking_date: e.target.value }))} /></div>
                <div><Label>Number of Shares</Label><Input type="number" min={1} max={10} value={form.num_shares} onChange={e => setForm(p => ({ ...p, num_shares: e.target.value }))} /></div>
                {isAdmin && (
                  <div>
                    <Label>Referred By Director</Label>
                    <Select value={form.referred_by_director_id || 'none'} onValueChange={v => setForm(p => ({ ...p, referred_by_director_id: v === 'none' ? '' : v }))}>
                      <SelectTrigger><SelectValue placeholder="Select director" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— None —</SelectItem>
                        {directors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.role})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Profile Image</Label>
                  <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Shareholder'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name or phone..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((s, i) => (
          <Link key={s.id} to={`/shareholders/${s.id}`}>
            <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {s.profile_image_url ? (
                    <img src={s.profile_image_url} alt={s.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                      {s.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate">{s.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{s.phone}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><MapPin className="w-3 h-3" />{s.address || 'N/A'}</div>
                    {s.num_shares > 1 && <span className="text-xs font-medium text-primary">Shares: {s.num_shares}</span>}
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col gap-1">
                      <button onClick={(e) => openEdit(e, s.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => openDelete(e, s.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Paid: ৳{s.total_paid.toLocaleString()}</span>
                    <span className={s.status === 'fully_paid' ? 'text-success font-medium' : 'text-warning font-medium'}>
                      {s.status === 'fully_paid' ? '✓ Paid' : `Due: ৳${(s.total_share - s.total_paid).toLocaleString()}`}
                    </span>
                  </div>
                  <Progress value={(s.total_paid / s.total_share) * 100} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink onClick={() => setCurrentPage(page)} isActive={page === currentPage} className="cursor-pointer">{page}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Shareholder</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div><Label>Name</Label><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div><Label>Phone</Label><Input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} required /></div>
            <div><Label>Address</Label><Input value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} /></div>
            <div><Label>Booking Date</Label><Input type="date" value={editForm.booking_date} onChange={e => setEditForm(p => ({ ...p, booking_date: e.target.value }))} /></div>
            <div><Label>Number of Shares</Label><Input type="number" min={1} max={10} value={editForm.num_shares} onChange={e => setEditForm(p => ({ ...p, num_shares: e.target.value }))} /></div>
            <div>
              <Label>Referred By Director</Label>
              <Select value={editForm.referred_by_director_id || 'none'} onValueChange={v => setEditForm(p => ({ ...p, referred_by_director_id: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Select director" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {directors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.role})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Profile Image</Label>
              <Input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
              {editForm.profile_image_url && <img src={editForm.profile_image_url} alt="Current" className="w-16 h-16 rounded-full object-cover mt-2" />}
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Shareholder'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this shareholder and all their payment records.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
