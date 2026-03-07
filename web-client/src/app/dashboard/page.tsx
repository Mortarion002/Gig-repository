"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, LogOut, DollarSign, Activity, CheckCircle, MapPin, FileText, Tag } from "lucide-react";

// --- MOCK DATA ---
const MOCK_ACTIVE_GIGS = [
    { id: 1, title: "Deliver groceries from Whole Foods", price: 45, address: "123 Main St", status: "OPEN" },
    { id: 2, title: "Help moving a couch", price: 80, address: "456 Oak Ave", status: "ASSIGNED" },
    { id: 3, title: "Walk my golden retriever", price: 30, address: "789 Pine Ln", status: "OPEN" },
];

export default function Dashboard() {
    const [form, setForm] = useState({ title: "", description: "", price: "", location: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Gig "${form.title}" created successfully!`);
        // Reset form
        setForm({ title: "", description: "", price: "", location: "" });
    };

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white pb-20">

            {/* ── NAVBAR ── */}
            <nav className="sticky top-0 z-50 w-full bg-white border-b border-zinc-200">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-black">
                        <Zap size={22} className="fill-black text-black" />
                        GigMarket
                    </Link>
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-zinc-600 hidden sm:inline-block">
                            Welcome back, User
                        </span>
                        <button className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-black">
                            <LogOut size={16} />
                            <span className="hidden sm:inline-block">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-6 pt-10">

                {/* ── QUICK STATS ── */}
                <section className="mb-12">
                    <h1 className="text-3xl font-extrabold tracking-tight text-black mb-6">Dashboard</h1>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Stat 1 */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-3 text-zinc-500 mb-2">
                                <DollarSign size={20} className="text-zinc-400" />
                                <h3 className="text-sm font-medium uppercase tracking-wider">Total Spent</h3>
                            </div>
                            <p className="text-3xl font-bold text-black">$1,250</p>
                        </div>

                        {/* Stat 2 */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-3 text-zinc-500 mb-2">
                                <Activity size={20} className="text-zinc-400" />
                                <h3 className="text-sm font-medium uppercase tracking-wider">Active Gigs</h3>
                            </div>
                            <p className="text-3xl font-bold text-black">{MOCK_ACTIVE_GIGS.length}</p>
                        </div>

                        {/* Stat 3 */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-3 text-zinc-500 mb-2">
                                <CheckCircle size={20} className="text-zinc-400" />
                                <h3 className="text-sm font-medium uppercase tracking-wider">Completed Gigs</h3>
                            </div>
                            <p className="text-3xl font-bold text-black">12</p>
                        </div>
                    </div>
                </section>

                {/* ── MAIN CONTENT SPLIT ── */}
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">

                    {/* SECTION A: CREATE GIG */}
                    <section className="lg:col-span-5">
                        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-black mb-2">Post a New Gig</h2>
                            <p className="text-sm text-zinc-500 mb-6">Connect with a local provider in minutes.</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700">
                                        <FileText size={15} /> Task Title
                                    </label>
                                    <input
                                        name="title"
                                        type="text"
                                        required
                                        placeholder="What do you need help with?"
                                        value={form.title}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-500 focus:bg-white focus:ring-1 focus:ring-zinc-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700">
                                        <Tag size={15} /> Description
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        required
                                        placeholder="Provide the details..."
                                        value={form.description}
                                        onChange={handleChange}
                                        className="w-full resize-none rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-500 focus:bg-white focus:ring-1 focus:ring-zinc-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700">
                                            <DollarSign size={15} /> Price ($)
                                        </label>
                                        <input
                                            name="price"
                                            type="number"
                                            min="1"
                                            required
                                            placeholder="e.g. 50"
                                            value={form.price}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-500 focus:bg-white focus:ring-1 focus:ring-zinc-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700">
                                            <MapPin size={15} /> Location
                                        </label>
                                        <input
                                            name="location"
                                            type="text"
                                            required
                                            placeholder="e.g. 123 Main St"
                                            value={form.location}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-500 focus:bg-white focus:ring-1 focus:ring-zinc-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="mt-4 w-full rounded-xl bg-black py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 active:scale-[0.98]"
                                >
                                    Post Gig
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* SECTION B: LIVE FEED */}
                    <section className="lg:col-span-7">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-black">Your Active Gigs</h2>
                            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                                {MOCK_ACTIVE_GIGS.length} Gigs
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {MOCK_ACTIVE_GIGS.map((gig) => (
                                <div
                                    key={gig.id}
                                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
                                >
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-3">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-900 ring-1 ring-inset ring-zinc-200">
                                                <DollarSign size={12} />
                                                {gig.price}
                                            </span>
                                            {gig.status === "OPEN" ? (
                                                <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-semibold tracking-wide text-white">
                                                    OPEN
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-zinc-600 ring-1 ring-inset ring-zinc-200">
                                                    ASSIGNED
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-black">{gig.title}</h3>
                                        <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                                            <MapPin size={14} className="shrink-0" />
                                            {gig.address}
                                        </p>
                                    </div>

                                    <div className="shrink-0 sm:self-center mt-2 sm:mt-0">
                                        <button className="w-full sm:w-auto rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-50 active:bg-zinc-100">
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {MOCK_ACTIVE_GIGS.length === 0 && (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-16 text-center">
                                    <Activity size={32} className="text-zinc-400 mb-3" />
                                    <h3 className="text-sm font-semibold text-zinc-900">No active gigs</h3>
                                    <p className="text-sm text-zinc-500 max-w-sm mt-1">Get started by posting a new gig using the form.</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}