"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'shagrat1qaZ') {
            document.cookie = "admin_auth=true; path=/";
            router.push('/admin/dashboard');
        } else {
            alert('ACCESS DENIED');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center font-mono">
            <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 p-8 rounded-xl w-full max-w-md">
                <div className="flex justify-center mb-6 text-red-500">
                    <Lock size={48} />
                </div>
                <h1 className="text-2xl font-black text-white text-center mb-8 tracking-widest uppercase">
                    Restricted Area
                </h1>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ENTER PASSWORD"
                    className="w-full bg-black border border-gray-700 p-4 text-center text-white font-bold tracking-widest focus:outline-none focus:border-red-500 transition-colors mb-6 placeholder-gray-600"
                    autoFocus
                />
                <button
                    type="submit"
                    className="w-full bg-white text-black font-black py-4 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
                >
                    Authenticate
                </button>
            </form>
        </div>
    );
}
