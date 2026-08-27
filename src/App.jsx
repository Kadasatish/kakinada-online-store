import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Minus, Package, Plus, Search, ShoppingBag, ShoppingCart, Store, Trash2, X } from "lucide-react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { products } from "./data/products.js";
import { useCart } from "./hooks/useCart.js";
import { createOrder, getLocalOrders } from "./services/orders.js";
import AdminPage from "./admin/AdminPage.jsx";

function App() {
  const cart = useCart();
  return <CartContextProvider value={cart}><Routes><Route path="/admin/*" element={<AdminPage />} /><Route path="*" element={<StoreApp />} /></Routes></CartContextProvider>;
}

function StoreApp() {
  return <div className="min-h-screen bg-slate-50 text-slate-900"><Header /><main className="pb-24"><Routes>
    <Route path="/" element={<HomePage />} /><Route path="/products" element={<ProductsPage />} />
    <Route path="/products/:id" element={<ProductPage />} /><Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} /><Route path="/orders" element={<OrdersPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes></main><BottomNav /></div>;
}

function Header() {
  const { cart } = useCartContext(); const count = cart.reduce((s, i) => s + i.quantity, 0);
  return <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
    <Link to="/" className="flex min-w-0 items-center gap-2"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white"><Store size={20} /></div><div><p className="truncate text-sm font-extrabold">Kakinada Online Store</p><p className="text-[11px] text-slate-500">Local • COD • Pickup</p></div></Link>
    <div className="ml-auto flex gap-1"><Link className="icon-btn" to="/products" aria-label="Search"><Search size={20} /></Link><Link className="relative icon-btn" to="/cart" aria-label="Cart"><ShoppingCart size={20} />{count > 0 && <span className="badge">{count}</span>}</Link></div>
  </div></header>;
}

function HomePage() {
  return <div className="mx-auto max-w-6xl space-y-8 px-4 py-5"><section className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-10">
    <p className="mb-2 text-sm font-semibold text-slate-300">Kakinada local shopping</p><h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">Shop online. Get it delivered or pick it up at the shop.</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Simple local ordering with Cash on Delivery and Shop Pickup.</p><Link to="/products" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900">Shop now <ChevronRight size={18} /></Link>
  </section><section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">Featured products</h2><Link to="/products" className="text-sm font-bold">View all</Link></div><ProductGrid items={products.slice(0, 4)} /></section>
  <section className="grid gap-3 sm:grid-cols-3">{[["COD","Pay when your order arrives."],["Shop Pickup","Order online and collect from the shop."],["Local","Built for a Kakinada store."]].map(([t,d])=><div key={t} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="font-extrabold">{t}</p><p className="mt-1 text-sm text-slate-500">{d}</p></div>)}</section></div>;
}

function ProductsPage() {
  const [query, setQuery] = useState(""); const filtered = products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="mx-auto max-w-6xl px-4 py-5"><h1 className="text-2xl font-black">Products</h1><div className="mt-4 mb-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3"><Search size={19} className="text-slate-400" /><input className="w-full bg-transparent text-sm outline-none" placeholder="Search products..." value={query} onChange={e=>setQuery(e.target.value)} />{query&&<button onClick={()=>setQuery("")}><X size={18}/></button>}</div>{filtered.length?<ProductGrid items={filtered}/>:<EmptyState title="No products found"/>}</div>;
}

function ProductGrid({ items }) { return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{items.map(p=><ProductCard key={p.id} product={p}/>)}</div>; }
function ProductCard({ product }) { const { add } = useCartContext(); return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><Link to={`/products/${product.id}`}><img src={product.image} alt={product.name} className="aspect-square w-full object-cover" loading="lazy"/></Link><div className="p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{product.category}</p><Link to={`/products/${product.id}`} className="mt-1 block line-clamp-2 min-h-10 text-sm font-bold">{product.name}</Link><div className="mt-3 flex items-center justify-between gap-2"><span className="font-black">₹{product.price.toLocaleString("en-IN")}</span><button className="btn-dark px-3 py-2 text-xs" onClick={()=>add(product)}>Add</button></div></div></article>; }

function ProductPage() { const { id }=useParams(); const product=products.find(p=>p.id===id); const {add}=useCartContext(); const [added,setAdded]=useState(false); if(!product)return <NotFound/>; return <div className="mx-auto max-w-5xl px-4 py-5"><Link to="/products" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-slate-600"><ArrowLeft size={17}/>Back</Link><div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white md:grid-cols-2"><img src={product.image} alt={product.name} className="aspect-square w-full object-cover"/><div className="p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">{product.category}</p><h1 className="mt-2 text-3xl font-black">{product.name}</h1><p className="mt-4 text-2xl font-black">₹{product.price.toLocaleString("en-IN")}</p><p className="mt-5 leading-7 text-slate-600">{product.description}</p><button className="btn-dark mt-7 w-full py-4" onClick={()=>{add(product);setAdded(true)}}><ShoppingCart size={19}/>{added?"Added to cart":"Add to cart"}</button><div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs font-semibold"><div className="rounded-xl bg-slate-50 p-3">COD available</div><div className="rounded-xl bg-slate-50 p-3">Shop pickup</div></div></div></div></div>; }

function CartPage() { const {cart,subtotal,update,remove}=useCartContext(); const navigate=useNavigate(); if(!cart.length)return <EmptyState title="Your cart is empty" action={<Link to="/products" className="btn-dark">Browse products</Link>}/>; return <div className="mx-auto max-w-3xl px-4 py-5"><h1 className="text-2xl font-black">Your Cart</h1><div className="mt-5 space-y-3">{cart.map(item=><div key={item.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3"><img src={item.image} alt="" className="size-20 rounded-xl object-cover"/><div className="min-w-0 flex-1"><p className="truncate font-bold">{item.name}</p><p className="mt-1 text-sm font-black">₹{item.price.toLocaleString("en-IN")}</p><div className="mt-2 flex items-center gap-2"><button className="qty-btn" onClick={()=>update(item.id,item.quantity-1)}><Minus size={15}/></button><span className="w-6 text-center text-sm font-bold">{item.quantity}</span><button className="qty-btn" onClick={()=>update(item.id,item.quantity+1)}><Plus size={15}/></button></div></div><button className="self-start p-2 text-slate-400" onClick={()=>remove(item.id)}><Trash2 size={18}/></button></div>)}</div><div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex justify-between text-sm"><span>Subtotal</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div><div className="mt-3 flex justify-between border-t pt-3 text-lg"><span className="font-bold">Total</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div><button className="btn-dark mt-5 w-full py-4" onClick={()=>navigate("/checkout")}>Continue to checkout</button></div></div>; }

function CheckoutPage() {
  const {cart,subtotal,clear}=useCartContext(); const [mode,setMode]=useState("delivery"); const [form,setForm]=useState({name:"",mobile:"",address:""}); const [state,setState]=useState({loading:false,error:"",order:null});
  if(!cart.length&&!state.order)return <EmptyState title="Your cart is empty" action={<Link to="/products" className="btn-dark">Shop now</Link>}/>;
  if(state.order)return <div className="mx-auto max-w-xl px-4 py-16 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Package/></div><h1 className="mt-5 text-2xl font-black">Order received</h1><p className="mt-2 text-sm text-slate-500">Order {state.order.id} saved successfully. Payment is due by Cash on Delivery or at pickup.</p><Link to="/orders" className="btn-dark mt-6">View order</Link></div>;
  async function submit(e){e.preventDefault();if(!form.name.trim()||!/^[0-9]{10}$/.test(form.mobile)||(mode==="delivery"&&!form.address.trim()))return;setState({loading:true,error:"",order:null});try{const order={customer:form,fulfillment:mode,payment:mode==="delivery"?"cod":"pay_at_store",items:cart,subtotal,total:subtotal,status:"pending",createdAt:new Date().toISOString()};const result=await createOrder(order);const saved={...order,id:result.id,source:result.source};localStorage.setItem("lastOrder",JSON.stringify(saved));clear();setState({loading:false,error:"",order:saved});}catch(error){setState({loading:false,error:error.message||"Could not place order",order:null});}}
  return <div className="mx-auto max-w-2xl px-4 py-5"><h1 className="text-2xl font-black">Checkout</h1><form onSubmit={submit} className="mt-5 space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-extrabold">Fulfillment</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><Choice active={mode==="delivery"} onClick={()=>setMode("delivery")} title="Delivery" text="Cash on Delivery"/><Choice active={mode==="pickup"} onClick={()=>setMode("pickup")} title="Shop Pickup" text="Pay at the shop"/></div></section><section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-extrabold">Customer details</h2><input required className="input" placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input required inputMode="numeric" maxLength={10} pattern="[0-9]{10}" className="input" placeholder="10-digit mobile number" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value.replace(/\D/g,"").slice(0,10)})}/>{mode==="delivery"&&<textarea required className="input min-h-28" placeholder="Delivery address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>}</section><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex justify-between text-sm"><span>Total</span><strong>₹{subtotal.toLocaleString("en-IN")}</strong></div>{state.error&&<p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}<button disabled={state.loading} className="btn-dark mt-5 w-full py-4 disabled:opacity-50" type="submit"><ShoppingBag size={19}/>{state.loading?"Placing order...":"Place order"}</button></section></form></div>;
}

function Choice({active,onClick,title,text}){return <button type="button" onClick={onClick} className={`rounded-xl border p-4 text-left ${active?"border-slate-900 bg-slate-50":"border-slate-200"}`}><p className="font-extrabold">{title}</p><p className="mt-1 text-xs text-slate-500">{text}</p></button>;}

function OrdersPage(){const [orders,setOrders]=useState([]);useEffect(()=>{setOrders(getLocalOrders());},[]);return <div className="mx-auto max-w-2xl px-4 py-5"><h1 className="text-2xl font-black">Orders</h1>{orders.length?orders.map(o=><div key={o.id} className="mt-4 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase text-slate-400">{o.id}</p><p className="mt-1 font-extrabold">{o.fulfillment==="pickup"?"Shop Pickup":"Cash on Delivery"}</p><p className="mt-2 text-sm text-slate-500">{o.items.length} product line(s) • ₹{o.total.toLocaleString("en-IN")}</p><span className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{o.status}</span></div>):<EmptyState title="No local orders yet"/>}</div>;}

function EmptyState({title,action}){return <div className="mx-auto max-w-xl px-4 py-16 text-center"><h2 className="text-xl font-black">{title}</h2>{action&&<div className="mt-5 flex justify-center">{action}</div>}</div>;}
function NotFound(){return <EmptyState title="Page not found" action={<Link to="/" className="btn-dark">Go home</Link>}/>;}
function BottomNav(){return <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-xl justify-around py-2 text-xs font-semibold"><Link to="/" className="p-2">Home</Link><Link to="/products" className="p-2">Products</Link><Link to="/cart" className="p-2">Cart</Link><Link to="/orders" className="p-2">Orders</Link></div></nav>;}

let cartContext=null;
function CartContextProvider({value,children}){cartContext=value;return children;}
function useCartContext(){return cartContext;}

export default App;
