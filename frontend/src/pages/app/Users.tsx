import { useEffect, useMemo, useState } from "react";
import { useAuth, ROLE_LABELS } from "@/lib/auth";
import { AppRole, User as UserType } from "@/lib/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2, Plus, Search, Trash2, UserCog, UserPlus, ShieldAlert, Copy, Check, XCircle, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Member = {
  _id: string;
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  phone?: string | null;
  roles: AppRole[];
};

const FACULTY_ROLES: AppRole[] = ["principal", "ed", "hod", "advisor"];
const ALL_ROLES: AppRole[] = ["admin", "principal", "ed", "hod", "advisor", "student"];

const Users = () => {
  const { college, user, hasRole, roles: myRoles, signOut } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");

  // Permissions of the current user
  const isAdmin = hasRole("admin");
  const isFaculty = useMemo(
    () => FACULTY_ROLES.some((r) => myRoles.includes(r)),
    [myRoles]
  );
  const canAddMembers = isAdmin || isFaculty;
  const allowedRolesToCreate: AppRole[] = isAdmin ? ALL_ROLES : ["student"];

  // Assign role dialog
  const [assignTarget, setAssignTarget] = useState<Member | null>(null);
  const [assignRole, setAssignRole] = useState<AppRole>("student");

  // Add member dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    password: "",
    department: "",
    role: "student" as AppRole,
  });
  const [addBusy, setAddBusy] = useState(false);
  const [createdCreds, setCreatedCreds] = useState<{
    email: string;
    password: string;
    emailed: boolean;
    emailError: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Permanent delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Edit member dialog
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    department: "",
    phone: "",
  });
  const [editBusy, setEditBusy] = useState(false);
  
  // Institutional Structure (Admin only)
  const [structureOpen, setStructureOpen] = useState(false);
  const [structure, setStructure] = useState<{ name: string; branches: string[] }[]>([]);
  const [structBusy, setStructBusy] = useState(false);

  // For Add Member dynamic branch
  const [addBranch, setAddBranch] = useState("");

  // Separate Branch management
  const [selectedDeptIndex, setSelectedDeptIndex] = useState<number | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [newBranchName, setNewBranchName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get("/users");
      setMembers(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    api.get("/college/structure").then((data) => {
      setStructure(data.departments || []);
    }).catch(() => {});
  }, []);

  // ---- Per-row permission helpers ----
  const isPureStudent = (m: Member) =>
    m.roles.length > 0 && m.roles.every((r) => r === "student");

  const canAssignRoleTo = (_m: Member, role: AppRole) => {
    if (isAdmin) return true;
    if (isFaculty && role === "student") return true;
    return false;
  };

  const canRemoveSpecificRole = (m: Member, role: AppRole) => {
    if ((m._id || m.id) === user?.id && role === "admin") return false;
    if (isAdmin) return true;
    if (isFaculty && role === "student") return true;
    return false;
  };

  const canDeleteMember = (m: Member) => {
    if (isAdmin) return true;
    if ((m._id || m.id) === user?.id) return false;
    if (isFaculty && isPureStudent(m)) return true;
    return false;
  };

  const canEditMember = (m: Member) => {
    if (isAdmin) return true;
    if ((m._id || m.id) === user?.id) return false; // Self-edit for faculty? Request says only faculty change student info
    if (isFaculty && isPureStudent(m)) return true;
    return false;
  };

  // ---- Actions ----
  const handleAssign = async () => {
    if (!assignTarget) return;
    if (!canAssignRoleTo(assignTarget, assignRole)) {
      toast.error("You can only assign the Student role.");
      return;
    }
    try {
      await api.patch("/users/roles", {
        userId: assignTarget._id || assignTarget.id,
        role: assignRole,
        action: "add",
      });
      toast.success(`Assigned ${ROLE_LABELS[assignRole]}`);
      setAssignTarget(null);
      await load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemoveRole = async (memberId: string, role: AppRole) => {
    const member = members.find((m) => (m._id || m.id) === memberId);
    if (!member || !canRemoveSpecificRole(member, role)) {
      toast.error("You don't have permission for this.");
      return;
    }
    try {
      await api.patch("/users/roles", {
        userId: memberId,
        role: role,
        action: "remove",
      });
      toast.success("Role removed");
      await load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddMember = async () => {
    if (!addForm.fullName || !addForm.email || !addForm.password) {
      toast.error("Name, email, and password are required");
      return;
    }
    if (addForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!allowedRolesToCreate.includes(addForm.role)) {
      toast.error("You can't assign that role");
      return;
    }
    setAddBusy(true);
    try {
      await api.post("/users", {
        fullName: addForm.fullName.trim(),
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password.trim(),
        department: addForm.department || null,
        branch: addBranch || null,
        role: addForm.role,
      });

      toast.success(`${ROLE_LABELS[addForm.role]} created`);
      setCreatedCreds({
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password.trim(),
        emailed: false,
        emailError: null,
      });
      setAddOpen(false);
      setAddForm({ fullName: "", email: "", password: "", department: "", role: "student" });
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAddBusy(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteTarget) return;
    const memberId = deleteTarget._id || deleteTarget.id;
    const isSelf = memberId === user?.id;
    setDeleteBusy(true);
    try {
      await api.delete(`/users/${memberId}`);
      if (isSelf) {
        toast.success("Your admin account has been deleted");
        await signOut();
        window.location.href = "/";
        return;
      }
      toast.success(`${deleteTarget.full_name} permanently deleted`);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleteBusy(false);
    }
  };

  const copyCreds = async () => {
    if (!createdCreds) return;
    await navigator.clipboard.writeText(
      `Email: ${createdCreds.email}\nTemp password: ${createdCreds.password}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditBusy(true);
    try {
      await api.patch(`/users/${editTarget._id || editTarget.id}/profile`, {
        fullName: editForm.fullName.trim(),
        department: editForm.department.trim() || null,
        phone: editForm.phone.trim() || null,
      });
      toast.success("Member information updated");
      setEditTarget(null);
      await load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEditBusy(false);
    }
  };

  const handleUpdateStructure = async () => {
    setStructBusy(true);
    try {
      await api.post("/college/structure", { departments: structure });
      toast.success("Institutional structure updated");
      setStructureOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setStructBusy(false);
    }
  };

  const depts = useMemo(() => {
    const d = new Set<string>();
    members.forEach((m) => { if (m.department) d.add(m.department); });
    return Array.from(d).sort();
  }, [members]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || m.full_name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      const matchesRole = filterRole === "all" || m.roles.includes(filterRole as AppRole);
      const matchesDept = filterDept === "all" || m.department === filterDept;
      return matchesSearch && matchesRole && matchesDept;
    });
  }, [members, search, filterRole, filterDept]);

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
            {isAdmin ? "Admin" : "Faculty"}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-semibold leading-tight break-words mb-2">
            {college?.name}
          </h1>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            {isFaculty ? `${user?.department} Members` : "Members & roles"}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            {isAdmin
              ? <>Add or remove anyone in <strong>{college?.name}</strong>.</>
              : <>Add and manage students in <strong>{college?.name}</strong>.</>}
          </p>
        </div>
        {canAddMembers && (
          <div className="flex gap-2 w-full sm:w-auto">
            {isAdmin && (
              <Button variant="outline" onClick={() => setStructureOpen(true)}>
                <UserCog className="h-4 w-4 mr-2" /> Manage Structure
              </Button>
            )}
            <Button
              onClick={() => {
                setAddForm({ fullName: "", email: "", password: "", department: "", role: allowedRolesToCreate[0] ?? "student" });
                setAddBranch("");
                setAddOpen(true);
              }}
              className="bg-gradient-hero shadow-elegant"
            >
              <UserPlus className="h-4 w-4 mr-2" /> Add member
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center no-transition">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="pl-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-[130px] h-10">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ALL_ROLES.map(r => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterDept} onValueChange={setFilterDept} disabled={isFaculty}>
            <SelectTrigger className="w-full sm:w-[150px] h-10">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {isFaculty ? (
                <SelectItem value={user?.department || "none"}>{user?.department || "No Dept"}</SelectItem>
              ) : (
                <>
                  <SelectItem value="all">All Depts</SelectItem>
                  {depts.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {filtered.map((m) => {
              const showAssign = isAdmin || (isFaculty && (m.roles.length === 0 || isPureStudent(m)));
              const memberId = m._id || m.id;
              return (
                <div key={memberId} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                      {m.department && <p className="text-xs text-muted-foreground mt-1">{m.department}</p>}
                    </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => { setEditTarget(m); setEditForm({ fullName: m.full_name, department: m.department || "", phone: m.phone || "" }); }}>
                          <UserCog className="h-3.5 w-3.5" /> Details
                        </Button>
                        {showAssign && (
                        <Button size="sm" variant="outline" onClick={() => { setAssignTarget(m); setAssignRole(isAdmin ? "advisor" : "student"); }}>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Role
                        </Button>
                      )}
                      {canDeleteMember(m) && (
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(m)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.roles.length === 0 && <span className="text-xs text-muted-foreground italic">No roles</span>}
                    {m.roles.map((r) => (
                      <span key={r} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-semibold">
                        {ROLE_LABELS[r]}
                        {canRemoveSpecificRole(m, r) && (
                          <button onClick={() => handleRemoveRole(memberId, r)} className="ml-1 hover:text-destructive" title="Remove role">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block rounded-2xl border border-border overflow-hidden bg-card shadow-card">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Member</th>
                  <th className="p-4 hidden md:table-cell">Department</th>
                  <th className="p-4">Roles</th>
                  <th className="p-4 w-48 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const showAssign = isAdmin || (isFaculty && (m.roles.length === 0 || isPureStudent(m)));
                  const memberId = m._id || m.id;
                  return (
                    <tr key={memberId} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold">{m.full_name}</p>
                        <p className="text-sm text-muted-foreground">{m.email}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{m.department ?? "—"}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {m.roles.length === 0 && <span className="text-xs text-muted-foreground italic">No roles</span>}
                          {m.roles.map((r) => (
                            <span key={r} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-semibold">
                              {ROLE_LABELS[r]}
                              {canRemoveSpecificRole(m, r) && (
                                <button onClick={() => handleRemoveRole(memberId, r)} className="ml-1 hover:text-destructive" title="Remove role">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </td>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditTarget(m); setEditForm({ fullName: m.full_name, department: m.department || "", phone: m.phone || "" }); }}>
                            <UserCog className="h-3.5 w-3.5" />
                          </Button>
                          {showAssign && (
                            <Button size="sm" variant="outline" onClick={() => { setAssignTarget(m); setAssignRole(isAdmin ? "advisor" : "student"); }}>
                              <Plus className="h-3.5 w-3.5 mr-1" /> Role
                            </Button>
                          )}
                          {canDeleteMember(m) && (
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(m)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Assign role dialog */}
      <Dialog open={!!assignTarget} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign role</DialogTitle>
            <DialogDescription>
              Grant <strong>{assignTarget?.full_name}</strong> a new role in {college?.name}.
            </DialogDescription>
          </DialogHeader>
          <Select value={assignRole} onValueChange={(v) => setAssignRole(v as AppRole)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(isAdmin ? ALL_ROLES : (["student"] as AppRole[])).map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button onClick={handleAssign} className="bg-gradient-hero">
              <UserCog className="h-4 w-4 mr-2" /> Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add member dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new member</DialogTitle>
            <DialogDescription>
              {isAdmin
                ? "Create an account and assign any role."
                : "You can add students to your college."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Full name</Label>
              <Input id="add-name" value={addForm.fullName} onChange={(e) => setAddForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Aarav Sharma" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-email">Email</Label>
              <Input id="add-email" type="email" value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))} placeholder="aarav@college.edu" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-password">Initial Password</Label>
              <Input id="add-password" type="text" value={addForm.password} onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))} placeholder="At least 6 characters" />
            </div>
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <Select 
                value={isAdmin ? addForm.department : user?.department || ""} 
                onValueChange={(v) => { setAddForm(p => ({ ...p, department: v })); setAddBranch(""); }}
                disabled={!isAdmin}
              >
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {structure.map((d) => (
                    <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isAdmin && (
                <p className="text-[0.65rem] text-muted-foreground">Students will be assigned to your department: <strong>{user?.department}</strong></p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Branch</Label>
              <Select 
                value={addBranch} 
                onValueChange={setAddBranch}
                disabled={!addForm.department}
              >
                <SelectTrigger><SelectValue placeholder="Select branch (Optional)" /></SelectTrigger>
                <SelectContent>
                  {structure.find(d => d.name === addForm.department)?.branches.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={addForm.role} onValueChange={(v) => setAddForm((p) => ({ ...p, role: v as AppRole }))} disabled={!isAdmin}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allowedRolesToCreate.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isAdmin && (
                <p className="text-xs text-muted-foreground">Faculty can only add students.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addBusy}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={addBusy} className="bg-gradient-hero">
              {addBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <UserPlus className="h-4 w-4 mr-2" /> Create account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show generated credentials */}
      <Dialog open={!!createdCreds} onOpenChange={(open) => !open && setCreatedCreds(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account created</DialogTitle>
            <DialogDescription>
              Share these credentials with the new member — they'll set their own password on first login.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-muted/40 p-4 font-mono text-sm space-y-2">
            <div><span className="text-muted-foreground">Email:</span> {createdCreds?.email}</div>
            <div><span className="text-muted-foreground">Password:</span> {createdCreds?.password}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={copyCreds}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={() => setCreatedCreds(null)} className="bg-gradient-hero">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              {(deleteTarget?._id || deleteTarget?.id) === user?.id
                ? "Delete your own admin account?"
                : "Permanently delete this account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(deleteTarget?._id || deleteTarget?.id) === user?.id ? (
                <>
                  This will permanently remove <strong>your</strong> login, profile and admin role from{" "}
                  {college?.name}. You'll be signed out immediately. Make sure another admin exists in
                  the college before doing this — the system blocks deleting the last admin.
                </>
              ) : (
                <>
                  This removes <strong>{deleteTarget?.full_name}</strong>'s login, profile, and roles from{" "}
                  {college?.name}. Their submitted events will remain but credited to a missing user.
                  This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteMember(); }}
              disabled={deleteBusy}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {(deleteTarget?._id || deleteTarget?.id) === user?.id ? "Delete my account" : "Delete permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View/Edit Information Panel */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Member Information</DialogTitle>
            <DialogDescription>
              Details for <strong>{editTarget?.full_name}</strong> in {college?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Email (Read-only)</Label>
              <Input value={editTarget?.email || ""} disabled className="bg-muted/30" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Full name</Label>
              <Input 
                id="edit-name" 
                value={editForm.fullName} 
                onChange={(e) => setEditForm(p => ({ ...p, fullName: e.target.value }))} 
                disabled={editTarget ? !canEditMember(editTarget) : true}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-dept">Department</Label>
              <Input 
                id="edit-dept" 
                value={editForm.department} 
                onChange={(e) => setEditForm(p => ({ ...p, department: e.target.value }))} 
                disabled={editTarget ? !canEditMember(editTarget) : true}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Phone number</Label>
              <Input 
                id="edit-phone" 
                value={editForm.phone} 
                onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} 
                disabled={editTarget ? !canEditMember(editTarget) : true}
                placeholder="+91 ..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Account Roles</Label>
              <div className="flex flex-wrap gap-1.5 p-2 border rounded-lg bg-muted/10">
                {editTarget?.roles.map(r => (
                    <span key={r} className="rounded-full bg-background border px-2 py-0.5 text-[0.7rem] font-semibold">
                        {ROLE_LABELS[r]}
                    </span>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              {editTarget && canEditMember(editTarget) ? "Cancel" : "Close"}
            </Button>
            {editTarget && canEditMember(editTarget) && (
              <Button onClick={handleEdit} disabled={editBusy} className="bg-gradient-hero">
                {editBusy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save information
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Institutional Structure Dialog */}
      <Dialog open={structureOpen} onOpenChange={setStructureOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Institutional Governance</DialogTitle>
            <DialogDescription>
              Configure the departments and sub-specialization branches for {college?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 h-[60vh]">
            {/* Departments Column */}
            <div className="flex flex-col gap-3 border-r border-border pr-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Departments</h3>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Input 
                  value={newDeptName} 
                  onChange={(e) => setNewDeptName(e.target.value)} 
                  placeholder="New Dept (e.g. Mechanical)" 
                  className="h-9 text-sm"
                />
                <Button size="sm" variant="outline" onClick={() => {
                  if (!newDeptName) return;
                  setStructure([...structure, { name: newDeptName, branches: [] }]);
                  setNewDeptName("");
                }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                {structure.map((dept, di) => (
                  <div 
                    key={di} 
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedDeptIndex === di ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setSelectedDeptIndex(di)}
                  >
                    <span className="text-sm font-medium truncate">{dept.name}</span>
                    <Button size="sm" variant="ghost" className="h-7 w-7 text-destructive p-0" onClick={(e) => {
                      e.stopPropagation();
                      setStructure(structure.filter((_, i) => i !== di));
                      if (selectedDeptIndex === di) setSelectedDeptIndex(null);
                    }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Branches Column */}
            <div className="flex flex-col gap-3 overflow-y-auto pl-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {selectedDeptIndex !== null ? `${structure[selectedDeptIndex].name} Branches` : "Select a Dept"}
                </h3>
              </div>

              {selectedDeptIndex !== null ? (
                <>
                  <div className="flex gap-2 mb-4">
                    <Input 
                      value={newBranchName} 
                      onChange={(e) => setNewBranchName(e.target.value)} 
                      placeholder="New Branch (e.g. AI)" 
                      className="h-9 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={() => {
                      if (!newBranchName) return;
                      const ns = [...structure];
                      ns[selectedDeptIndex].branches.push(newBranchName);
                      setStructure(ns);
                      setNewBranchName("");
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {structure[selectedDeptIndex].branches.map((branch, bi) => (
                      <div key={bi} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                        <span className="text-sm">{branch}</span>
                        <Button size="sm" variant="ghost" className="h-7 w-7 text-muted-foreground p-0" onClick={() => {
                          const ns = [...structure];
                          ns[selectedDeptIndex].branches = ns[selectedDeptIndex].branches.filter((_, i) => i !== bi);
                          setStructure(ns);
                        }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    {structure[selectedDeptIndex].branches.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-10 italic">No branches added yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
                  <GraduationCap className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-xs">Pick a department to manage its branches.</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setStructureOpen(false)} disabled={structBusy}>Cancel</Button>
            <Button onClick={handleUpdateStructure} disabled={structBusy} className="bg-gradient-hero">
              {structBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Institutional Structure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
