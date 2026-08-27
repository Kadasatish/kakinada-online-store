import { useEffect, useState } from "react";
import { LogOut, ShieldCheck, ShoppingBag } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase.js";
import { isAdmin, logout, signInAdmin, watchAuth } from "../services/auth.js";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    return watchAuth(async currentUser => {
      setUser(currentUser);
      if (!currentUser) {
        setAuthorized(false);
        setChecking(false);
        return;
      }
      setChecking(true);
      try {
        setAuthorized(await isAdmin(currentUser));
      } catch {
        setAuthorized(false);
      } finally {
        setChecking(false);
      }
    });
  }, []);

  if (checking) return <AdminShell><Loading /></AdminShell>;
  if (!user || !authorized) return <AdminLogin signedIn={Boolean(user)} />;
  return <AdminDashboard user={user} />;
}

function AdminLogin({ signedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(signedIn ? "This account is not authorized as an admin." : "");

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInAdmin(email, password);
    } catch (err) {
      setError(err?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return <AdminShell>
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid size-12 place-items-center rounded-2xl bg-slate-900 text-white"><ShieldCheck size={24} /></div>
        <h1 className="mt-5 text-2xl font-black">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-500">Authorized store administrators only.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input className="input" type="email" autoComplete="username" required placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input" type="password" autoComplete="current-password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button disabled={loading} className="btn-dark w-full py-3.5 disabled:opacity-50" type="submit">{loading ? "Signing in..." : "Sign in"}</button>
        </form>
      </div>
    </div>
  </AdminShell>;
}

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({ orders: 0, pending: 0, sales: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!db) return;
      try {
        const snapshot = await getDocs(collection(db, "orders"));
        const orders = snapshot.docs.map(doc => doc.data());
        setStats({
          orders: orders.length,
          pending: orders.filter(order => order.status === "pending").length,
          sales: orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
        });
      } catch (err) {
        setError(err?.message || "Could not load orders.");
      }
    }
    load();
  }, []);

  return <AdminShell>
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Secure area</p><h1 className="mt-1 text-3xl font-black">Admin Dashboard</h1><p className="mt-1 text-sm text-slate-500">{user.email}</p></div>
        <button className="icon-btn border border-slate-200" onClick={logout} aria-label="Sign out"><LogOut size={19} /></button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat title="Orders" value={stats.orders} />
        <Stat title="Pending" value={stats.pending} />
        <Stat title="Order value" value={`₹${stats.sales.toLocaleString("en-IN")}`} />
      </div>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2"><ShoppingBag size={19} /><h2 className="font-extrabold">Admin workspace</h2></div>
        <p className="mt-2 text-sm text-slate-500">This protected area is separate from the customer store. Product, order and store-management tools can be added here next.</p>
      </section>
    </div>
  </AdminShell>;
}

function Stat({ title, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-black">{value}</p></div>;
}

function AdminShell({ children }) {
  return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
}

function Loading() {
  return <div className="grid min-h-screen place-items-center text-sm font-semibold text-slate-500">Checking admin access...</div>;
}
