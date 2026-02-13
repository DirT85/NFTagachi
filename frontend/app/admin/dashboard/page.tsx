"use client";

import { useState } from "react";
import { Upload, Sliders, Save, RefreshCw, Cpu, Download } from "lucide-react";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'ASSETS' | 'GENERATE'>('ASSETS');
    const [genSeed, setGenSeed] = useState("");
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedImage(null);
        try {
            const res = await fetch('/api/admin/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-password': 'shagrat1qaZ' },
                body: JSON.stringify({ seed: genSeed || Math.floor(Math.random() * 9999) })
            });
            const data = await res.json();
            if (data.image) {
                setGeneratedImage(data.image);
            } else {
                alert("Generation returned no image data");
            }
        } catch (e: any) {
            alert("Generation Failed: " + e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-4">
                <h1 className="text-xl font-black tracking-widest text-red-500">ADMIN_DASHBOARD_v1.2</h1>
                <div className="text-xs text-gray-500">USER: ADMIN (SECURE)</div>
            </header>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('ASSETS')}
                    className={`px-4 py-2 rounded text-xs font-bold tracking-wider transition-colors ${activeTab === 'ASSETS' ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                    ASSET MIGRATION
                </button>
                <button
                    onClick={() => setActiveTab('GENERATE')}
                    className={`px-4 py-2 rounded text-xs font-bold tracking-wider flex items-center gap-2 transition-colors ${activeTab === 'GENERATE' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                    <Cpu size={14} /> GENERATORS (V8)
                </button>
            </div>

            {activeTab === 'ASSETS' && (
                <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800">
                    <div className="border-2 border-dashed border-gray-700 rounded-xl h-64 flex flex-col items-center justify-center text-gray-500 hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer group">
                        <Upload size={48} className="mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-lg font-bold">DRAG & DROP ASSETS HERE</span>
                        <span className="text-xs mt-2 opacity-50">(Sprites, Skins, Backgrounds)</span>
                    </div>
                    <p className="mt-4 text-xs text-gray-600 text-center">
                        System will automatically categorize based on filename prefix (e.g. `bg_`, `skin_`).
                    </p>
                </div>
            )}

            {activeTab === 'GENERATE' && (
                <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-blue-400 mb-1">Monster Generator V8</h3>
                            <p className="text-xs text-gray-400">Procedurally generate 256x256 sprite sheets using the ported V8 engine (Node.js/PNGjs).</p>
                        </div>

                        <div className="bg-black/50 p-4 rounded border border-gray-800">
                            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-2">Generation Seed</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={genSeed}
                                    onChange={(e) => setGenSeed(e.target.value)}
                                    className="flex-1 bg-black border border-gray-700 p-2 rounded text-white text-sm font-mono focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Random..."
                                />
                                <button onClick={() => setGenSeed(Math.floor(Math.random() * 99999).toString())} className="p-2 bg-gray-800 rounded hover:bg-gray-700 text-gray-400">
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={`w-full font-bold py-4 rounded flex items-center justify-center gap-2 transition-all ${isGenerating ? 'bg-blue-900 text-blue-200 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'}`}
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" /> : <Cpu />}
                            {isGenerating ? 'PROCESSING...' : 'EXECUTE GENERATION'}
                        </button>
                    </div>

                    <div className="flex-1 bg-black rounded-xl border border-gray-800 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />

                        {generatedImage ? (
                            <div className="text-center z-10 animate-in fade-in zoom-in duration-300">
                                <div className="relative group">
                                    <img src={generatedImage} alt="Generated" className="w-64 h-64 pixelated border-2 border-slate-700 rounded-lg shadow-2xl mb-6 bg-slate-900" />
                                    <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 transition-all rounded-lg pointer-events-none" />
                                </div>

                                <div className="flex justify-center gap-4">
                                    <a
                                        href={generatedImage}
                                        download={`monster_v8_${genSeed || 'random'}.png`}
                                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <Download size={14} /> SAVE PNG
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-700 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center">
                                    <Cpu className="opacity-20" size={32} />
                                </div>
                                <span className="text-xs font-mono uppercase tracking-widest">Awaiting Input Stream...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
