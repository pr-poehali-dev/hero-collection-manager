import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Hero, Player } from '@/types/game';

interface AddModalProps {
  heroes: Hero[];
  players: Player[];
  onAddHero: (hero: Omit<Hero, 'id'>) => void;
  onAddPlayer: (player: Omit<Player, 'id'>) => void;
  onAddBuild: (build: {
    heroId: string;
    playerId: string;
    rank: number;
    round: number;
    imageUrl: string;
    notes?: string;
  }) => void;
  onClose: () => void;
}

const HERO_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
  '#84cc16', '#6b7280',
];

type Tab = 'build' | 'hero' | 'player';

export default function AddModal({ heroes, players, onAddHero, onAddPlayer, onAddBuild, onClose }: AddModalProps) {
  const [tab, setTab] = useState<Tab>('build');

  // Build form
  const [heroId, setHeroId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [newPlayerNick, setNewPlayerNick] = useState('');
  const [rank, setRank] = useState('');
  const [round, setRound] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Hero form
  const [heroName, setHeroName] = useState('');
  const [heroColor, setHeroColor] = useState(HERO_COLORS[0]);
  const [heroIconPreview, setHeroIconPreview] = useState<string | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  // Player form
  const [playerNick, setPlayerNick] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitBuild = () => {
    const finalPlayerId = playerId === '__new__' ? '' : playerId;
    if (!heroId || (!finalPlayerId && !newPlayerNick) || !rank || !round || !imagePreview) return;
    onAddBuild({
      heroId,
      playerId: finalPlayerId || `new_${newPlayerNick}`,
      rank: parseInt(rank),
      round: parseInt(round),
      imageUrl: imagePreview,
      notes: notes || undefined,
    });
    onClose();
  };

  const handleSubmitHero = () => {
    if (!heroName.trim()) return;
    onAddHero({ name: heroName.trim(), color: heroColor, icon: heroIconPreview || undefined });
    onClose();
  };

  const handleSubmitPlayer = () => {
    if (!playerNick.trim()) return;
    onAddPlayer({ nickname: playerNick.trim() });
    onClose();
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'build', label: 'Сборка', icon: 'Layers' },
    { id: 'hero', label: 'Герой', icon: 'Shield' },
    { id: 'player', label: 'Игрок', icon: 'User' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md glass-card rounded-2xl overflow-hidden animate-slide-up"
        style={{ border: '1px solid rgba(0,212,255,0.25)', boxShadow: '0 0 40px rgba(0,212,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <span className="font-rajdhani font-bold text-lg neon-text-cyan tracking-wider">ДОБАВИТЬ</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
                tab === t.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5'
                  : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Icon name={t.icon} size={15} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* ===== BUILD TAB ===== */}
          {tab === 'build' && (
            <>
              {/* Hero select */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Герой</label>
                <select
                  value={heroId}
                  onChange={e => setHeroId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
                >
                  <option value="">Выберите героя...</option>
                  {heroes.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              {/* Player select */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Игрок</label>
                <select
                  value={playerId}
                  onChange={e => setPlayerId(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
                >
                  <option value="">Выберите игрока...</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.nickname}</option>
                  ))}
                  <option value="__new__">+ Новый игрок</option>
                </select>
                {playerId === '__new__' && (
                  <input
                    type="text"
                    placeholder="Никнейм нового игрока"
                    value={newPlayerNick}
                    onChange={e => setNewPlayerNick(e.target.value)}
                    className="mt-2 w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
                  />
                )}
              </div>

              {/* Rank + Round */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Ранг</label>
                  <input
                    type="number"
                    placeholder="1"
                    min="1"
                    value={rank}
                    onChange={e => setRank(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Раунд</label>
                  <input
                    type="number"
                    placeholder="1"
                    min="1"
                    value={round}
                    onChange={e => setRound(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Заметки (необязательно)</label>
                <input
                  type="text"
                  placeholder="Описание сборки..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Скриншот сборки</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setImagePreview)} />
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); fileRef.current?.click(); }}
                  className={`w-full rounded-xl border-2 border-dashed transition-all ${imagePreview ? 'border-cyan-400/40 p-1' : 'border-white/15 hover:border-cyan-400/40 p-8'}`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full rounded-lg object-contain max-h-48" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Icon name="ImagePlus" size={28} />
                      <span className="text-sm">Нажмите для загрузки</span>
                    </div>
                  )}
                </button>
              </div>

              <button
                onClick={handleSubmitBuild}
                disabled={!heroId || (!playerId && !newPlayerNick) || !rank || !round || !imagePreview}
                className="w-full py-3 rounded-xl font-rajdhani font-bold text-base tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #0088cc)', color: '#0a0e1a' }}
              >
                СОХРАНИТЬ СБОРКУ
              </button>
            </>
          )}

          {/* ===== HERO TAB ===== */}
          {tab === 'hero' && (
            <>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Иконка героя (необязательно)</label>
                <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageChange(e, setHeroIconPreview)} />
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); heroFileRef.current?.click(); }}
                    className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-400/40 flex items-center justify-center transition-all overflow-hidden"
                    style={{ background: heroIconPreview ? 'transparent' : `${heroColor}22` }}
                  >
                    {heroIconPreview ? (
                      <img src={heroIconPreview} alt="Hero" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="ImagePlus" size={24} className="text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">Цвет героя</p>
                    <div className="flex flex-wrap gap-2">
                      {HERO_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setHeroColor(c)}
                          className={`w-7 h-7 rounded-full transition-transform ${heroColor === c ? 'scale-125 ring-2 ring-white/60' : 'hover:scale-110'}`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Имя героя</label>
                <input
                  type="text"
                  placeholder="Название персонажа..."
                  value={heroName}
                  onChange={e => setHeroName(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
                />
              </div>

              <button
                onClick={handleSubmitHero}
                disabled={!heroName.trim()}
                className="w-full py-3 rounded-xl font-rajdhani font-bold text-base tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff' }}
              >
                ДОБАВИТЬ ГЕРОЯ
              </button>
            </>
          )}

          {/* ===== PLAYER TAB ===== */}
          {tab === 'player' && (
            <>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Никнейм</label>
                <input
                  type="text"
                  placeholder="Введите никнейм..."
                  value={playerNick}
                  onChange={e => setPlayerNick(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmitPlayer()}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30"
                />
              </div>

              <button
                onClick={handleSubmitPlayer}
                disabled={!playerNick.trim()}
                className="w-full py-3 rounded-xl font-rajdhani font-bold text-base tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}
              >
                ДОБАВИТЬ ИГРОКА
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}