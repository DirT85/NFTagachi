"use client";

import { MonsterData } from "../utils/GameLogic";

import { MarketStats } from "@/components/MarketStats";
import { Device } from "@/components/Device";
import { Screen } from "@/components/Screen";
import { Arena, ArenaRef } from "@/components/Arena";
import { Lobby } from "@/components/Lobby";
import { MintShop } from "@/components/MintShop";
import { TokenomicsMap } from "@/components/TokenomicsMap";
import { ActivityPanel } from "@/components/ActivityPanel";
import { Inventory, getBgStyle } from "@/components/Inventory";
import { GameWallet } from "@/components/GameWallet";
import { NoAssetPopup } from "@/components/NoAssetPopup";
import { Daycare } from "@/components/Daycare";
import { SwapModal } from "@/components/SwapModal";
import { useNftagachi } from "@/hooks/useNftagachi";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import { useState, ReactNode, useEffect, useRef } from "react";
import { Drumstick, Dumbbell, Sparkles, Swords, Home as HomeIcon, Info, X, History as HistoryIcon, Wallet, TrendingUp } from "lucide-react";
import { io, Socket } from "socket.io-client";

export default function Home() {
  const {
    // State
    gameState, petState, monsterData, bgId,
    inventoryOpen, setInventoryOpen,
    ownedDevices, ownedBackgrounds,
    currentDevice, currentBackground,
    loading, boostActive, tokenBalance,
    gameBalance, solBalance,
    treasuryStats,
    rewardSettings,
    ownedMonsters, switchMonster, isAuthenticating,
    swapOpen, setSwapOpen,

    // Actions
    performAction, mintItem, equipItem, buyGama, depositGama, depositGamaFromWallet, withdrawGama, completeBattle, setGameState, syncOnChainMetadata,
    mintTestMonster,

    isWhale,
    wallet
  } = useNftagachi();

  const [view, setView] = useState<'HOME' | 'LOBBY' | 'ARENA'>('HOME');
  const [tokenomicsOpen, setTokenomicsOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false); // NEW
  const [modalTab, setModalTab] = useState<'STATS' | 'SHOP'>('STATS');
  const [activityOpen, setActivityOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  // PvP State (Existing)
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerCount, setPlayerCount] = useState(0);

  // Onboarding State
  const [showNoAssetPopup, setShowNoAssetPopup] = useState(false);

  useEffect(() => {
    // Show popup if NOT loading AND NO monsters found
    // Wallet connection is NO LONGER a requirement to see this popup for trial mints
    if (!loading && ownedMonsters.length === 0) {
      const timer = setTimeout(() => setShowNoAssetPopup(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowNoAssetPopup(false);
    }
  }, [loading, ownedMonsters]);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [opponentMonster, setOpponentMonster] = useState<MonsterData | null>(null);
  const [isChallenger, setIsChallenger] = useState(false);
  const arenaRef = useRef<ArenaRef>(null);

  // Orientation Check (Simplified for full vertical support)
  useEffect(() => {
    const checkOrientation = () => {
      // We no longer block on portrait, but we track it for UI adjustments if needed
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://nftagachi.onrender.com');
    // ... (rest of socket logic stays same)
    setSocket(s);
    s.on('currentPlayers', (players: any[]) => setPlayerCount(players.length));
    s.on('playerJoined', () => setPlayerCount(prev => prev + 1));
    s.on('playerLeft', () => setPlayerCount(prev => Math.max(0, prev - 1)));
    s.on('playerCountUpdate', (count: number) => setPlayerCount(count));
    return () => { s.off('currentPlayers'); s.off('playerJoined'); s.off('playerLeft'); s.disconnect(); };
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Phantom Mobile Deep Link Helper
  const openInPhantom = () => {
    const url = window.location.href.replace(/^https?:\/\//, '');
    const phantomUrl = `https://phantom.app/ul/browse/${encodeURIComponent(url)}`;
    window.location.href = phantomUrl;
  };

  // Responsive Scaling Logic
  const getDeviceScale = () => {
    if (typeof window === 'undefined') return 1.3;
    const isMobile = window.innerWidth < 768;
    const isNarrow = window.innerWidth < 400;

    if (view === 'ARENA') return isMobile ? (isNarrow ? 0.75 : 1.0) : 1.6;
    return isMobile ? (isNarrow ? 0.65 : 0.8) : 1.3;
  };

  const guestMonster: MonsterData = {
    id: -1, name: "GUEST", tier: "COMMON", type: "MAGIC", baseImageIndex: 0, variant: "GHOST",
    baseStats: { hp: 100, maxHp: 100, atk: 10, def: 10, spd: 10, exp: 0, level: 1, weight: 10, power: 10, bodyCondition: 'NORMAL' }
  };

  return (
    <main className="relative min-h-screen bg-[#050510] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* 
        Full Vertical Support: Orientation Overlay Removed 
        Mobile users can now play in portrait mode as requested.
      */}

      <div className="absolute inset-0 z-0">
        <Daycare ownedMonsters={ownedMonsters} activeMonsterId={monsterData?.id} />
      </div>

      {/* Unified Header Navigation */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[150] flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-2xl scale-90 md:scale-100 transition-all hover:border-white/20">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/20 tracking-widest uppercase">POCKET_LINK_OS_V1.1.0</div>
        {/* Market Tab */}
        <button
          onClick={() => setTokenomicsOpen(!tokenomicsOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all group ${tokenomicsOpen ? 'bg-yellow-500/20 ring-1 ring-yellow-500/50' : 'hover:bg-white/5'}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
          <span className="text-[10px] font-black text-white uppercase tracking-wider">MARKET</span>
          <TrendingUp size={12} className="text-yellow-400 opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        {/* Wallet Tab - Distinguish G vs TKN */}
        {/* Wallet Tab - Distinguish G vs TKN */}
        <button
          onClick={() => setWalletOpen(true)}
          className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all group ${walletOpen ? 'bg-blue-500/20 ring-1 ring-blue-500/50' : 'hover:bg-white/5'}`}
        >
          <div className="flex flex-col items-end leading-none border-l border-white/10 pl-3">
            <span className="text-[8px] font-mono text-white/40 group-hover:text-blue-400 transition-colors uppercase tracking-tighter">TOTAL G</span>
            {/* EMERGENCY FIX: Never show 150,000. If state is stuck, show 0. */}
            <span className="text-[9px] font-mono font-bold text-white/80">
              {(gameBalance === 150000 ? 0 : gameBalance).toLocaleString()} G
            </span>
          </div>
        </button>

        {
          mounted && !wallet && typeof window !== 'undefined' && window.innerWidth < 768 && (
            <>
              <div className="w-[1px] h-4 bg-white/10 mx-1" />
              <button
                onClick={openInPhantom}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:bg-[#AB9FF2]/20 group"
              >
                <Wallet size={12} className="text-[#AB9FF2] opacity-60 group-hover:opacity-100" />
                <span className="text-[10px] font-black text-white uppercase tracking-wider">PHANTOM</span>
              </button>
            </>
          )
        }
      </div >


      {mounted && (
        <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 items-end">
          <WalletMultiButton className="!bg-cyan-500/20 !border !border-cyan-500/50 !rounded-lg !text-cyan-400 hover:!bg-cyan-500/40 !transition-colors !shadow-[0_0_15px_rgba(6,182,212,0.2)] !text-[10px] !font-bold !h-auto !py-1.5 !px-3 !font-mono" />
        </div>
      )
      }

      {/* Activity Panel (Left Sidebar) */}
      <AnimatePresence>
        {activityOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-24 bottom-4 left-4 z-[90] w-full md:w-[320px] pointer-events-none md:pointer-events-auto"
          >
            <div className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm -z-10 pointer-events-auto" onClick={() => setActivityOpen(false)} />
            <div className="relative h-full pointer-events-auto">
              <ActivityPanel balance={gameBalance} logs={logs} />
              <button onClick={() => setActivityOpen(false)} className="md:hidden absolute top-4 right-4 text-gray-400 p-2 z-50 bg-black/50 rounded-full"><X size={20} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tokenomics Modal (Centered) */}
      <AnimatePresence>
        {tokenomicsOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTokenomicsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-gray-900 border-2 border-yellow-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/40">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_#ea7708]" />
                    <span className="text-xs font-black text-yellow-500 tracking-widest uppercase font-mono">GAMA ECONOMY</span>
                  </div>

                  <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                    <button
                      onClick={() => setModalTab('STATS')}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${modalTab === 'STATS' ? 'bg-yellow-500 text-black' : 'text-white/40 hover:text-white'}`}
                    >
                      LIVE STATS
                    </button>
                    <button
                      onClick={() => setModalTab('SHOP')}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${modalTab === 'SHOP' ? 'bg-green-500 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                      MINT SHOP
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setTokenomicsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {modalTab === 'STATS' ? (
                  <TokenomicsMap
                    treasuryStats={treasuryStats}
                    rewardSettings={rewardSettings}
                  />
                ) : (
                  <div className="p-6">
                    <MintShop
                      balance={tokenBalance}
                      onMint={(type, price) => mintItem(type, price)}
                      onBuyGama={() => setSwapOpen(true)}
                      ownedDevices={ownedDevices}
                      ownedBackgrounds={ownedBackgrounds}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Inventory
        isOpen={inventoryOpen} onClose={() => setInventoryOpen(false)}
        ownedMonsters={ownedMonsters} currentMonsterId={monsterData?.id}
        onSwitchMonster={switchMonster} ownedDevices={ownedDevices}
        ownedBackgrounds={ownedBackgrounds} currentDevice={currentDevice}
        currentBackground={currentBackground} onEquipDevice={(id: string) => equipItem('DEVICE', id)}
        onEquipBackground={(id: string) => equipItem('BG', id)} isAuthenticating={isAuthenticating}
      />

      <div className="relative z-20 mt-10">
        <motion.div
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-[240px] bg-black/60 border border-white/10 rounded-t-lg px-4 py-1.5 flex justify-between items-center backdrop-blur-xl shadow-[0_-10px_20px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" />
            <span className="text-[8px] font-black text-white/40 tracking-[0.3em] uppercase">Pocket_Link // OS</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-1 h-3 bg-white/5 rounded-full" />
            <div className="w-1 h-3 bg-white/5 rounded-full" />
            <div className="w-3 h-3 border border-white/20 rounded-sm" />
          </div>
        </motion.div>

        <motion.div
          className={`relative z-10 transform transition-all duration-500 translate-y-8`}
          style={{ scale: getDeviceScale() }}
          animate={{
            x: 0 // Keep character centered regardless of modals on mobile
          }}
        >
          <Device
            device={currentDevice}
            hideLogo={view === 'LOBBY'}
            hideButtons={view === 'LOBBY'}
            isWhale={isWhale}
            isLobbyActive={playerCount > 0 || view === 'LOBBY' || view === 'ARENA'}
            actions={
              view === 'ARENA' ? {
                A: { label: 'ACTION', onClick: () => arenaRef.current?.handleAction('ATTACK'), highlight: true },
                B: { label: 'DEFEND', onClick: () => arenaRef.current?.handleAction('BLOCK'), highlight: true },
                C: { label: 'SPECIAL', onClick: () => arenaRef.current?.handleAction('SPECIAL'), highlight: true }
              } : (petState && !petState.isFainted ? {
                A: { label: 'FEED', onClick: () => performAction('feed'), disabled: loading || petState.hunger === 0, cost: '10G BURN' },
                B: { label: 'TRAIN', onClick: () => performAction('train'), disabled: loading || petState.energy < 20, cost: '15G BURN' },
                C: { label: 'CLEAN', onClick: () => performAction('clean'), disabled: loading || petState.waste === 0, cost: '+5G RECYCLE', highlight: petState.waste > 0 }
              } : undefined)
            }
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-xs text-gray-700 mb-2 font-black animate-pulse uppercase tracking-widest">CONNECTING...</p>
              </div>
            ) : (
              <>
                {petState ? (
                  <>
                    {view === 'ARENA' && monsterData ? (
                      <div className="absolute inset-0 z-50">
                        <Arena
                          ref={arenaRef}
                          playerMonster={monsterData}
                          opponentMonster={opponentMonster || undefined}
                          socket={socket}
                          opponentId={opponentId}
                          isChallenger={isChallenger}
                          currentBackground={currentBackground}
                          onClose={() => setView('LOBBY')}
                          onBattleEnd={completeBattle}
                        />
                      </div>
                    ) : view === 'LOBBY' ? (
                      <div className="absolute inset-0 z-50">
                        <Lobby
                          userMonster={monsterData || guestMonster}
                          ownedMonsters={ownedMonsters}
                          onSwitchMonster={switchMonster}
                          socket={socket}
                          isWhale={isWhale}
                          onJoinArena={(id, monster, challenger) => {
                            setOpponentId(id);
                            setOpponentMonster(monster);
                            setIsChallenger(challenger);
                            setView('ARENA');
                          }}
                          onClose={() => setView('HOME')}
                          isAuthenticating={isAuthenticating}
                        />
                      </div>
                    ) : (
                      <Screen
                        state={gameState as any}
                        skin={'MONSTER'}
                        stats={petState}
                        monsterData={monsterData}
                        backgroundId={currentBackground}
                        tokenBalance={gameBalance}
                        solBalance={solBalance}
                        actionLabels={currentDevice === 'DIGI' ? undefined : (view === 'HOME' ? ['FEED', 'TRAIN', 'CLEAN'] : ['ATTACK', 'BLOCK', 'SPECIAL'])}
                        loopLimit={gameState === 'IDLE' ? undefined : 2}
                        onAnimationComplete={() => setGameState('IDLE')}
                      />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <p className="text-[10px] text-gray-700 mb-2 font-black uppercase tracking-widest">INITIATING LINK...</p>
                    <div className="animate-bounce w-1.5 h-1.5 bg-gray-500 rounded-full" />
                  </div>
                )}
              </>
            )}
          </Device>
          <Inventory
            isOpen={inventoryOpen}
            onClose={() => setInventoryOpen(false)}
            ownedMonsters={ownedMonsters}
            currentMonsterId={monsterData?.id}
            onSwitchMonster={switchMonster}
            ownedDevices={ownedDevices}
            ownedBackgrounds={ownedBackgrounds}
            currentDevice={currentDevice}
            currentBackground={currentBackground}
            onEquipDevice={(id) => equipItem('DEVICE', id)}
            onEquipBackground={(id) => equipItem('BG', id)}
            isAuthenticating={isAuthenticating}
            onSyncMetadata={syncOnChainMetadata}
            gameBalance={gameBalance}
            tokenBalance={tokenBalance}
            solBalance={solBalance}
          />
        </motion.div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex gap-4 w-full justify-center pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 flex gap-4 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform">
          <button
            onClick={() => setView('HOME')}
            className={`px-4 py-2 rounded-full text-[10px] font-black transition-all duration-300 ${view === 'HOME' ? 'bg-white text-black shadow-lg scale-105' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          >
            🏠 HOME
          </button>
          <button
            onClick={() => setView('LOBBY')}
            className={`px-4 py-2 rounded-full text-[10px] font-black transition-all duration-300 ${view === 'LOBBY' || view === 'ARENA' ? 'bg-red-600 text-white shadow-lg scale-105' : 'text-white/60 hover:text-red-400 hover:bg-white/10'}`}
          >
            ⚔️ ARENA
          </button>
          <button
            onClick={() => setInventoryOpen(true)}
            className="px-4 py-2 rounded-full text-[10px] font-black text-white/60 hover:text-purple-400 hover:bg-white/10 transition-all duration-300"
          >
            🎒 INVENTORY
          </button>
        </div>
      </div>

      <SwapModal isOpen={swapOpen} onClose={() => setSwapOpen(false)} balance={tokenBalance} onSwap={buyGama} />

      <GameWallet
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        gameBalance={gameBalance}
        tokenBalance={tokenBalance}
        onDepositGama={depositGamaFromWallet} // GAMA -> GAME
        onWithdraw={withdrawGama} // GAME -> GAMA
      />

      <NoAssetPopup
        isOpen={showNoAssetPopup}
        onMintClick={() => window.open('https://launchmynft.io/collections/HgZ3fK1jsiG1G...YOUR_COLLECTION', '_blank')}
        onMarketClick={() => window.open('https://tensor.trade/trade/nftagachi', '_blank')}
        onTestMint={mintTestMonster}
      />
    </main >
  );
}

interface ActionButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  cost: string;
  highlight?: boolean;
}

const ActionButton = ({ label, icon, onClick, disabled, cost, highlight }: ActionButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`
        w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-2
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${highlight
        ? 'bg-gradient-to-tr from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/20'
        : 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 hover:border-white/30'
      }
    `}
  >
    <div className="mb-1">{icon}</div>
    <span className="font-bold text-[10px] tracking-wider">{label}</span>
    <span className="text-[9px] opacity-70 bg-black/20 px-2 py-0.5 rounded-full">{cost}</span>
  </motion.button>
);
