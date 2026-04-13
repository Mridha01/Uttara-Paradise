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
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ITEMS_PER_PAGE = 12;

export default function Shareholders() {
  const { shareholders, addShareholder, updateShareholder, deleteShareholder } = useApp();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', address: '', bookingDate: new Date().toISOString().split('T')[0], profileImage: '' });
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', bookingDate: '', profileImage: '' });

  const { isAdmin } = useAuth();
  const filtered = shareholders.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search));

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    addShareholder({ name: form.name, phone: form.phone, address: form.address, profileImage: form.profileImage, bookingDate: form.bookingDate, totalShare: TOTAL_SHARE_AMOUNT });
    setForm({ name: '', phone: '', address: '', bookingDate: new Date().toISOString().split('T')[0], profileImage: '' });
    setDialogOpen(false);
    toast.success('Shareholder added successfully!');
  };

  const openEdit = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const s = shareholders.find(sh => sh.id === id);
    if (!s) return;
    setSelectedId(id);
    setEditForm({ name: s.name, phone: s.phone, address: s.address, bookingDate: s.bookingDate, profileImage: s.profileImage });
    setEditDialogOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    updateShareholder(selectedId, editForm);
    setEditDialogOpen(false);
    toast.success('Shareholder updated!');
  };

  const openDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteShareholder(selectedId);
    setDeleteDialogOpen(false);
    toast.success('Shareholder deleted!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (target === 'add') setForm(p => ({ ...p, profileImage: url }));
    else setEditForm(p => ({ ...p, profileImage: url }));
  };

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
                <div><Label>Booking Date</Label><Input type="date" value={form.bookingDate} onChange={e => setForm(p => ({ ...p, bookingDate: e.target.value }))} /></div>
                <div>
                  <Label>Profile Image</Label>
                  <Input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'add')} />
                  {form.profileImage && <img src={form.profileImage} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">Add Shareholder</Button>
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
                  {s.profileImage ? (
                    <img src={s.profileImage} alt={s.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                      {s.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate">{s.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{s.phone}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><MapPin className="w-3 h-3" />{s.address || 'N/A'}</div>
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
                    <span className="text-muted-foreground">Paid: ৳{s.totalPaid.toLocaleString()}</span>
                    <span className={s.status === 'fully_paid' ? 'text-success font-medium' : 'text-warning font-medium'}>
                      {s.status === 'fully_paid' ? '✓ Paid' : `Due: ৳${(TOTAL_SHARE_AMOUNT - s.totalPaid).toLocaleString()}`}
                    </span>
                  </div>
                  <Progress value={(s.totalPaid / TOTAL_SHARE_AMOUNT) * 100} className="h-1.5" />
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
                <PaginationLink onClick={() => setCurrentPage(page)} isActive={page === currentPage} className="cursor-pointer">
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Shareholder</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div><Label>Name</Label><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div><Label>Phone</Label><Input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} required /></div>
            <div><Label>Address</Label><Input value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} /></div>
            <div><Label>Booking Date</Label><Input type="date" value={editForm.bookingDate} onChange={e => setEditForm(p => ({ ...p, bookingDate: e.target.value }))} /></div>
            <div>
              <Label>Profile Image</Label>
              <Input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'edit')} />
              {editForm.profileImage && <img src={editForm.profileImage} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">Update Shareholder</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
