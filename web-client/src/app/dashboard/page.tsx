'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { apiFetch } from '@/lib/apiClient';

// Dynamically import the map so it only renders on the client
const TaskMap = dynamic(() => import('@/components/TaskMap'), { 
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse rounded-lg">Loading Map...</div>
});

interface User {
    firstName?: string;
    email: string;
}

interface Task {
    id: string;
    title: string;
    description: string;
    price: number;
    latitude: number;
    longitude: number;
    client?: { firstName: string; lastName: string };
}

export default function DashboardPage() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    

    // 1. MOVE THIS UP: Define fetchTasks first
    const fetchTasks = async () => {
        try {
            const data = await apiFetch<{ tasks: Task[] }>('/api/tasks');
            setTasks(data.tasks);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            toast.error('Failed to load tasks');
        }
    };

    // 2. Authentication & Socket Setup (Now it can safely call fetchTasks)
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (!token) {
                router.push('/login');
                return;
            } 

            if (userData) {
                setUser(JSON.parse(userData));
            }

            // Initialize Socket Connection
            const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('🟢 Connected to live task feed');
            });

            newSocket.on('new_task_available', (newTaskData) => {
                toast.success(
                    <div>
                        <strong>New Gig Available!</strong><br/>
                        {newTaskData.title} - ${newTaskData.price}
                    </div>, 
                    { duration: 6000, position: 'top-right' }
                );

                // Now this works perfectly!
                fetchTasks();
            });

            setSocket(newSocket);
        };

        checkAuth();

        return () => {
            if (socket) socket.disconnect();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    // 3. Initial Load
    useEffect(() => {
        fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (socket) socket.disconnect();
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Toaster /> {/* Mounts the toast notification system */}
            
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">GigMarket</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                                + Post a Gig
                            </Link>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <span className="text-sm font-medium text-gray-600">
                                {user.firstName || user.email}
                            </span>
                            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Map Area */}
            <main className="flex-1 relative">
                <div className="absolute inset-0 z-0">
                    <TaskMap tasks={tasks} />
                </div>
                
                {/* Floating Stats Card (Optional UI Flex) */}
                <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-1">Live Feed</h3>
                    <p className="text-2xl font-extrabold text-blue-600">{tasks.length}</p>
                    <p className="text-xs text-gray-500">Active tasks in your area</p>
                </div>
            </main>
        </div>
    );
}