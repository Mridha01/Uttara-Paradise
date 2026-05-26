import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Phone, MapPin, Edit, Trash2, Users, Activity, CheckCircle2 } from 'lucide-react';
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
  
  interface ReferenceSplit {
    directorId: string;
    sharesCount: number;
  }
  const [isSplit, setIsSplit] = useState(false);
  const [formSplits, setFormSplits] = useState<ReferenceSplit[]>([]);
  const [editIsSplit, setEditIsSplit] = useState(false);
  const [editFormSplits, setEditFormSplits] = useState<ReferenceSplit[]>([]);

  const filtered = shareholders.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search));
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalFormSplits = formSplits.reduce((acc, s) => acc + (Number(s.sharesCount) || 0), 0);
  const totalEditFormSplits = editFormSplits.reduce((acc, s) => acc + (Number(s.sharesCount) || 0), 0);
  
  const isFormInvalid = isSplit && Number(form.num_shares) > 1 && totalFormSplits !== Number(form.num_shares);
  const isEditFormInvalid = editIsSplit && Number(editForm.num_shares) > 1 && totalEditFormSplits !== Number(editForm.num_shares);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || isFormInvalid) return;
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage('shareholder-images', imageFile, 'profiles');
      }

      let referred_by_directors: Record<string, number> = {};
      let referred_by_director_id = form.referred_by_director_id || null;
      
      if (isSplit && Number(form.num_shares) > 1) {
        formSplits.forEach(split => {
          if (split.directorId) {
            referred_by_directors[split.directorId] = (referred_by_directors[split.directorId] || 0) + split.sharesCount;
          }
        });
        referred_by_director_id = formSplits[0]?.directorId || null;
      } else if (form.referred_by_director_id) {
        referred_by_directors = { [form.referred_by_director_id]: Number(form.num_shares) || 1 };
      }

      await addShareholder({
        name: form.name, phone: form.phone, address: form.address,
        profile_image_url: imageUrl, booking_date: form.booking_date,
        num_shares: Number(form.num_shares) || 1,
        total_share: (Number(form.num_shares) || 1) * TOTAL_SHARE_AMOUNT,
        referred_by_director_id: referred_by_director_id,
        referred_by_directors: referred_by_directors,
      });
      setForm({ name: '', phone: '', address: '', booking_date: new Date().toISOString().split('T')[0], num_shares: '1', referred_by_director_id: '' });
      setImageFile(null);
      setIsSplit(false);
      setFormSplits([]);
      setDialogOpen(false);
      toast.success('Shareholder added successfully!');
    } catch { toast.error('Failed to add shareholder'); }
    setSubmitting(false);
  };

  const openEdit = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const s = shareholders.find(sh => sh.id === id);
    if (!s) return;
    setSelectedId(id);
    setEditForm({ name: s.name, phone: s.phone, address: s.address, booking_date: s.booking_date, num_shares: String(s.num_shares), profile_image_url: s.profile_image_url, referred_by_director_id: s.referred_by_director_id || '' });
    
    let splits: ReferenceSplit[] = [];
    let isSplitActive = false;
    if (s.referred_by_directors && Object.keys(s.referred_by_directors).length > 0) {
      splits = Object.entries(s.referred_by_directors).map(([dirId, count]) => ({
        directorId: dirId,
        sharesCount: count,
      }));
      isSplitActive = Object.keys(s.referred_by_directors).length > 1;
    } else if (s.referred_by_director_id) {
      splits = [{ directorId: s.referred_by_director_id, sharesCount: s.num_shares }];
    }
    
    setEditFormSplits(splits);
    setEditIsSplit(isSplitActive);
    setEditImageFile(null);
    setEditDialogOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || isEditFormInvalid) return;
    setSubmitting(true);
    try {
      let imageUrl = editForm.profile_image_url;
      if (editImageFile) {
        imageUrl = await uploadImage('shareholder-images', editImageFile, 'profiles');
      }

      let referred_by_directors: Record<string, number> = {};
      let referred_by_director_id = editForm.referred_by_director_id || null;
      
      if (editIsSplit && Number(editForm.num_shares) > 1) {
        editFormSplits.forEach(split => {
          if (split.directorId) {
            referred_by_directors[split.directorId] = (referred_by_directors[split.directorId] || 0) + split.sharesCount;
          }
        });
        referred_by_director_id = editFormSplits[0]?.directorId || null;
      } else if (editForm.referred_by_director_id) {
        referred_by_directors = { [editForm.referred_by_director_id]: Number(editForm.num_shares) || 1 };
      }

      await updateShareholder(selectedId, {
        name: editForm.name, phone: editForm.phone, address: editForm.address,
        booking_date: editForm.booking_date, profile_image_url: imageUrl,
        num_shares: Number(editForm.num_shares) || 1,
        referred_by_director_id: referred_by_director_id,
        referred_by_directors: referred_by_directors,
      });
      setEditDialogOpen(false);
      toast.success('Shareholder updated successfully!');
    } catch { toast.error('Failed to update shareholder'); }
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
    toast.success('Shareholder deleted successfully!');
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-cyan-500 animate-spin-reverse"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-6 lg:p-8 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="w-full lg:w-auto text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Users className="w-3 h-3" /> Member Directory
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              Shareholders <span className="text-cyan-400">({filtered.length})</span>
            </h1>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 transition-colors backdrop-blur-md rounded-xl h-11"
                placeholder="Search by name or phone..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 gap-2 transition-all hover:scale-105">
                    <Plus className="w-4 h-4" /> Add Shareholder
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] border-border/50 bg-background/95 backdrop-blur-xl">
                  <DialogHeader><DialogTitle className="text-xl">Add New Shareholder</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-foreground/80">Name *</Label><Input className="bg-muted/50" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                      <div className="space-y-1.5"><Label className="text-foreground/80">Phone *</Label><Input className="bg-muted/50" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required /></div>
                    </div>
                    <div className="space-y-1.5"><Label className="text-foreground/80">Address</Label><Input className="bg-muted/50" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-foreground/80">Booking Date</Label><Input className="bg-muted/50" type="date" value={form.booking_date} onChange={e => setForm(p => ({ ...p, booking_date: e.target.value }))} /></div>
                      <div className="space-y-1.5"><Label className="text-foreground/80">Number of Shares</Label><Input className="bg-muted/50" type="number" min={1} max={10} value={form.num_shares} onChange={e => setForm(p => ({ ...p, num_shares: e.target.value }))} /></div>
                    </div>
                    {/* Admin Only Field */}
                    <div className="space-y-3 bg-primary/5 p-3 rounded-lg border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-primary" />
                        <Label className="text-primary font-medium m-0">Admin: Referred By Director</Label>
                      </div>

                      {Number(form.num_shares) > 1 && (
                        <div className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border/40 mb-1">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-foreground/80">একাধিক ডিরেক্টর রেফারেন্স (Split Reference)</span>
                            <span className="text-[9px] text-muted-foreground">শেয়ারগুলো একাধিক ডিরেক্টরের মধ্যে বন্টন করুন</span>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={isSplit} 
                            onChange={(e) => {
                              setIsSplit(e.target.checked);
                              if (e.target.checked && formSplits.length === 0) {
                                setFormSplits([{ directorId: form.referred_by_director_id || '', sharesCount: 1 }]);
                              }
                            }} 
                            className="w-4 h-4 rounded border-input text-primary focus:ring-primary cursor-pointer accent-primary"
                          />
                        </div>
                      )}

                      {!isSplit || Number(form.num_shares) <= 1 ? (
                        <Select value={form.referred_by_director_id || 'none'} onValueChange={v => setForm(p => ({ ...p, referred_by_director_id: v === 'none' ? '' : v }))}>
                          <SelectTrigger className="bg-background"><SelectValue placeholder="Select director" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">— None —</SelectItem>
                            {directors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.role})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="space-y-2 mt-1">
                          <div className="flex justify-between items-center bg-background/50 p-1.5 rounded border border-border/30">
                            <span className="text-[10px] font-bold text-foreground/75">বন্টন তালিকা</span>
                            <span className={`text-[10px] font-bold ${totalFormSplits === Number(form.num_shares) ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`}>
                              {totalFormSplits === Number(form.num_shares) 
                                ? `✓ বন্টন মিলেছে (${totalFormSplits}/${form.num_shares})` 
                                : `⚠️ বরাদ্দ: ${totalFormSplits} / ${form.num_shares} শেয়ার`}
                            </span>
                          </div>
                          
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {formSplits.map((split, index) => (
                              <div key={index} className="flex items-center gap-1.5 bg-background p-1.5 rounded-md border border-border/40">
                                <div className="flex-1">
                                  <Select 
                                    value={split.directorId || 'none'} 
                                    onValueChange={v => {
                                      const newSplits = [...formSplits];
                                      newSplits[index].directorId = v === 'none' ? '' : v;
                                      setFormSplits(newSplits);
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs bg-muted/20"><SelectValue placeholder="সিলেক্ট ডিরেক্টর" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">— None —</SelectItem>
                                      {directors.map(d => <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="w-16">
                                  <Input 
                                    type="number" 
                                    min={1} 
                                    max={Number(form.num_shares)}
                                    value={split.sharesCount} 
                                    onChange={e => {
                                      const val = Math.max(1, Number(e.target.value) || 1);
                                      const newSplits = [...formSplits];
                                      newSplits[index].sharesCount = val;
                                      setFormSplits(newSplits);
                                    }}
                                    className="h-8 text-xs text-center px-1"
                                    placeholder="Shares"
                                  />
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setFormSplits(formSplits.filter((_, i) => i !== index));
                                  }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormSplits([...formSplits, { directorId: '', sharesCount: 1 }])}
                            className="w-full h-8 text-[10px] border-dashed gap-1 bg-background hover:bg-muted/50"
                          >
                            <Plus className="w-3 h-3" /> ডিরেক্টর যোগ করুন
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-foreground/80">Profile Image</Label>
                      <Input className="bg-muted/50 cursor-pointer" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white shadow-lg mt-4" disabled={submitting || isFormInvalid}>
                      {submitting ? 'Adding...' : 'Add Shareholder'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Premium Shareholders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {paginated.map((s, i) => {
          const progress = (s.total_paid / s.total_share) * 100;
          const isFullyPaid = s.status === 'fully_paid';

          return (
            <Link key={s.id} to={`/shareholders/${s.id}`} className="block group">
              <Card className={`relative overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-card/40 backdrop-blur-md ${isFullyPaid ? 'border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-emerald-500/10' : 'border-border/50 hover:border-primary/40 hover:shadow-primary/5'}`} style={{ animationDelay: `${i * 50}ms` }}>
                <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${isFullyPaid ? 'bg-emerald-500' : 'bg-primary'}`}></div>

                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      {s.profile_image_url ? (
                        <img src={s.profile_image_url} alt={s.name} className={`w-14 h-14 rounded-2xl object-cover shadow-sm ring-2 ${isFullyPaid ? 'ring-emerald-500/20' : 'ring-primary/20'}`} />
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm bg-gradient-to-br ${isFullyPaid ? 'from-emerald-400 to-emerald-600' : 'from-cyan-400 to-blue-600'}`}>
                          {s.name.charAt(0)}
                        </div>
                      )}
                      {isFullyPaid && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-foreground truncate text-base group-hover:text-primary transition-colors">{s.name}</h3>
                        {/* Admin Action Buttons */}
                        {isAdmin && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg p-0.5 border border-border shadow-sm">
                            <button onClick={(e) => openEdit(e, s.id)} className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => openDelete(e, s.id)} className="p-1.5 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 mt-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3.5 h-3.5 text-slate-400" />{s.phone}</div>
                        {s.address && <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate"><MapPin className="w-3.5 h-3.5 text-slate-400" />{s.address}</div>}
                      </div>

                      {s.num_shares > 1 && (
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                          {s.num_shares} Shares
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5 pt-4 border-t border-border/50">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">Paid Amount</p>
                        <p className="text-sm font-bold text-foreground">৳{s.total_paid.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${isFullyPaid ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                          {isFullyPaid ? '✓ Completed' : `Due: ৳${(s.total_share - s.total_paid).toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${isFullyPaid ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {paginated.length === 0 && (
        <div className="text-center py-20 bg-card/30 rounded-2xl border border-border border-dashed">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-lg font-medium">No shareholders found.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4">
          <Pagination>
            <PaginationContent className="bg-card/40 backdrop-blur-md border border-border/50 p-1 rounded-xl shadow-sm">
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={`rounded-lg ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'}`} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink onClick={() => setCurrentPage(page)} isActive={page === currentPage} className={`rounded-lg cursor-pointer ${page === currentPage ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted'}`}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={`rounded-lg ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted'}`} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Admin Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-border/50 bg-background/95 backdrop-blur-xl">
          <DialogHeader><DialogTitle className="text-xl">Edit Shareholder</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-foreground/80">Name</Label><Input className="bg-muted/50" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="space-y-1.5"><Label className="text-foreground/80">Phone</Label><Input className="bg-muted/50" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} required /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-foreground/80">Address</Label><Input className="bg-muted/50" value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-foreground/80">Booking Date</Label><Input className="bg-muted/50" type="date" value={editForm.booking_date} onChange={e => setEditForm(p => ({ ...p, booking_date: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-foreground/80">Number of Shares</Label><Input className="bg-muted/50" type="number" min={1} max={10} value={editForm.num_shares} onChange={e => setEditForm(p => ({ ...p, num_shares: e.target.value }))} /></div>
            </div>
            {/* Admin Only Field */}
            <div className="space-y-3 bg-primary/5 p-3 rounded-lg border border-primary/10">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-primary" />
                <Label className="text-primary font-medium m-0">Admin: Referred By Director</Label>
              </div>

              {Number(editForm.num_shares) > 1 && (
                <div className="flex items-center justify-between p-2 rounded bg-muted/40 border border-border/40 mb-1">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-foreground/80">একাধিক ডিরেক্টর রেফারেন্স (Split Reference)</span>
                    <span className="text-[9px] text-muted-foreground">শেয়ারগুলো একাধিক ডিরেক্টরের মধ্যে বন্টন করুন</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={editIsSplit} 
                    onChange={(e) => {
                      setEditIsSplit(e.target.checked);
                      if (e.target.checked && editFormSplits.length === 0) {
                        setEditFormSplits([{ directorId: editForm.referred_by_director_id || '', sharesCount: 1 }]);
                      }
                    }} 
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                </div>
              )}

              {!editIsSplit || Number(editForm.num_shares) <= 1 ? (
                <Select value={editForm.referred_by_director_id || 'none'} onValueChange={v => setEditForm(p => ({ ...p, referred_by_director_id: v === 'none' ? '' : v }))}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Select director" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {directors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.role})</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2 mt-1">
                  <div className="flex justify-between items-center bg-background/50 p-1.5 rounded border border-border/30">
                    <span className="text-[10px] font-bold text-foreground/75">বন্টন তালিকা</span>
                    <span className={`text-[10px] font-bold ${totalEditFormSplits === Number(editForm.num_shares) ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`}>
                      {totalEditFormSplits === Number(editForm.num_shares) 
                        ? `✓ বন্টন মিলেছে (${totalEditFormSplits}/${editForm.num_shares})` 
                        : `⚠️ বরাদ্দ: ${totalEditFormSplits} / ${editForm.num_shares} শেয়ার`}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {editFormSplits.map((split, index) => (
                      <div key={index} className="flex items-center gap-1.5 bg-background p-1.5 rounded-md border border-border/40">
                        <div className="flex-1">
                          <Select 
                            value={split.directorId || 'none'} 
                            onValueChange={v => {
                              const newSplits = [...editFormSplits];
                              newSplits[index].directorId = v === 'none' ? '' : v;
                              setEditFormSplits(newSplits);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs bg-muted/20"><SelectValue placeholder="সিলেক্ট ডিরেক্টর" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">— None —</SelectItem>
                              {directors.map(d => <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-16">
                          <Input 
                            type="number" 
                            min={1} 
                            max={Number(editForm.num_shares)}
                            value={split.sharesCount} 
                            onChange={e => {
                              const val = Math.max(1, Number(e.target.value) || 1);
                              const newSplits = [...editFormSplits];
                              newSplits[index].sharesCount = val;
                              setEditFormSplits(newSplits);
                            }}
                            className="h-8 text-xs text-center px-1"
                            placeholder="Shares"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditFormSplits(editFormSplits.filter((_, i) => i !== index));
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditFormSplits([...editFormSplits, { directorId: '', sharesCount: 1 }])}
                    className="w-full h-8 text-[10px] border-dashed gap-1 bg-background hover:bg-muted/50"
                  >
                    <Plus className="w-3 h-3" /> ডিরেক্টর যোগ করুন
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Profile Image</Label>
              <div className="flex items-center gap-4">
                {editForm.profile_image_url && <img src={editForm.profile_image_url} alt="Current" className="w-12 h-12 rounded-xl object-cover ring-2 ring-border" />}
                <Input className="bg-muted/50 cursor-pointer flex-1" type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg mt-4" disabled={submitting || isEditFormInvalid}>
              {submitting ? 'Updating...' : 'Update Shareholder'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Delete Alert */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-rose-500/20 bg-background/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Delete Shareholder</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70">
              This action cannot be undone. This will permanently delete this shareholder and completely wipe all their payment records from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted/50 hover:bg-muted border-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25">Yes, Delete Permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
