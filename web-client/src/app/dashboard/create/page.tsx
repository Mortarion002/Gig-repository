'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';

export default function CreateTaskPage() {
    const router = useRouter();
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [address, setAddress] = useState('');
    
    // Coordinates State
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // 1. The OpenStreetMap Geocoding Function
    const handleGeocode = async () => {
        if (!address.trim()) {
            setError('Please enter an address first.');
            return;
        }

        setGeoLoading(true);
        setError('');
        setLatitude(null);
        setLongitude(null);

        try {
            // Nominatim API call (Free, no API key needed!)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
                {
                    headers: {
                        // CRITICAL: Nominatim requires a custom User-Agent to prevent blocking
                        'User-Agent': 'GigMarketplaceApp/1.0'
                    }
                }
            );

            const data = await response.json();

            if (data && data.length > 0) {
                // Grab the most relevant result
                setLatitude(parseFloat(data[0].lat));
                setLongitude(parseFloat(data[0].lon));
                setSuccessMessage('Location found successfully!');
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError('Address not found. Please try adding a city or zip code.');
            }
        } catch (err: unknown) {
            setError('Failed to connect to the mapping service.');
        } finally {
            setGeoLoading(false);
        }
    };

    // 2. The Form Submission to your Backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (latitude === null || longitude === null) {
            setError('You must click "Find Location" and get coordinates before posting.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiFetch('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    address,
                    latitude,
                    longitude
                }),
            });

            // Redirect back to dashboard on success
            router.push('/dashboard');
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to create task');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                    <h2 className="text-xl font-semibold leading-7 text-gray-900 mb-6">Post a New Gig</h2>
                    
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title & Price */}
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Task Title</label>
                                <div className="mt-2">
                                    <input type="text" id="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" placeholder="e.g., Fix my plumbing" />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">Price ($)</label>
                                <div className="mt-2">
                                    <input type="number" id="price" min="1" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" placeholder="50.00" />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">Description</label>
                            <div className="mt-2">
                                <textarea id="description" rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" placeholder="Describe what needs to be done..." />
                            </div>
                        </div>

                        {/* Address & Geocoding */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">Service Address</label>
                            <div className="mt-2 flex gap-3">
                                <input type="text" id="address" required value={address} onChange={(e) => { setAddress(e.target.value); setLatitude(null); setLongitude(null); }} className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" placeholder="123 Main St, New York, NY" />
                                <button type="button" onClick={handleGeocode} disabled={geoLoading} className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:opacity-50 whitespace-nowrap">
                                    {geoLoading ? 'Searching...' : 'Find Location'}
                                </button>
                            </div>
                            
                            {/* Coordinate Status Display */}
                            {successMessage && <p className="mt-2 text-sm text-green-600">{successMessage}</p>}
                            {latitude && longitude && !successMessage && (
                                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Coordinates locked: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end border-t border-gray-900/10 pt-6">
                            <button type="button" onClick={() => router.push('/dashboard')} className="text-sm font-semibold leading-6 text-gray-900 mr-4">Cancel</button>
                            <button type="submit" disabled={loading || latitude === null} className="rounded-md bg-blue-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50">
                                {loading ? 'Posting...' : 'Post Task'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}