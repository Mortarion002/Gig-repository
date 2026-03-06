'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 1. Add a User interface so TypeScript knows what a 'user' is
interface User {
    firstName?: string;
    email: string;
}

export default function DashboardPage() {
    const router = useRouter();
    // 2. Add the missing user state
    const [user, setUser] = useState<User | null>(null);
    
    // 3. (Optional) Comment out tasks if you aren't rendering them yet to fix the unused-vars warning
    // const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (!token) {
                router.push('/login');
            } else if (userData) {
                setUser(JSON.parse(userData));
            }
        };

        // Call the function
        checkAuth();
    }, [router]);
     

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">GigMarket Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-500 mr-4">
                                Hello, {user.firstName || user.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-red-100"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center bg-white shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to your Dashboard</h2>
                        <p className="text-gray-500 text-center max-w-md">
                            You have successfully authenticated using JWT. Your token is securely stored and will be attached to future API requests.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
