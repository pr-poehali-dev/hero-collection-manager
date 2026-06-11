import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { useGameStore } from '@/store/gameStore';
import { Hero, Player, Screen } from '@/types/game';
import AddModal from '@/components/AddModal';

export default function Index() {
  const store = useGameStore();
  const [screen, setScreen] = useState<Screen>('heroes');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHero, setEditingHero] = useState<Hero | null>(null);
  const [editHeroName, setEditHeroName] = useState('');
  const [editHeroIcon, setEditHeroIcon] = useState<string | null>(null);
  const [deletingHero, setDeletingHero] = useState<Hero | null>(null);
  const editIconRef = useRef<HTMLInputElement>(null);

  const goBack = () => {
    if (screen === 'build') { setSelectedRound(null); setScreen('rounds'); }
    else if (screen === 'rounds') { setSelectedRank(null); setScreen('ranks'); }
    else if (screen === 'ranks') { setSelectedPlayer(null); setScreen('players'); }
    else if (screen === 'players') { setSelectedHero(null); setScreen('heroes'); }
  };

  const handleAddBuild = (raw: {
    heroId: string; playerId: string; rank: number; round: number; imageUrl: string; notes?: string;
  }) => {
    let { playerId } = raw;
    if (playerId.startsWith('new_')) {
      const nick = playerId.replace('new_', '');
      const existing = store.players.find(p => p.nickname === nick);
      if (existing) {
        playerId = existing.id;
      } else {
        store.addPlayer({ nickname: nick });
        playerId = `${Date.now()}`;
      }
    }
    store.addBuild({ ...raw, playerId });
  };

  const activeBuild = selectedHero && selectedPlayer && selectedRank !== null && selectedRound !== null
    ? store.getBuild(selectedHero.id, selectedPlayer.id, selectedRank, selectedRound)
    : null;

  const buildCount = (heroId: string) => store.builds.filter(b => b.heroId === heroId).length;

  const breadcrumbs = [
    { label: 'Герои', screen: 'heroes' as Screen },
    ...(selectedHero ? [{ label: selectedHero.name, screen: 'players' as Screen }] : []),
    ...(selectedPlayer ? [{ label: selectedPlayer.nickname, screen: 'ranks' as Screen }] : []),
    ...(selectedRank !== null ? [{ label: `Ранг ${selectedRank}`, screen: 'rounds' as Screen }] : []),
    ...(selectedRound !== null ? [{ label: `Раунд ${selectedRound}`, screen: 'build' as Screen }] : []),
  ];

  return (
    <div className="min-h-screen bg-background bg-grid-pattern relative">
      {/* Ambient glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }} />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 backdrop-blur-xl"
        style={{ background: 'rgba(10, 14, 26, 0.85)' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {screen !== 'heroes' && (
              <button onClick={goBack}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-cyan-400">
                <Icon name="ChevronLeft" size={20} />
              </button>
            )}
            <span className="font-rajdhani font-bold text-xl tracking-widest neon-text-cyan">BUILD</span>
            <span className="font-rajdhani font-bold text-xl tracking-widest text-white/70">VAULT</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition-all hover:scale-110 animate-pulse-neon"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #0088cc)', color: '#0a0e1a' }}
          >
            <Icon name="Plus" size={20} />
          </button>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div className="max-w-2xl mx-auto px-4 pb-2 flex items-center gap-1 overflow-x-auto">
            {breadcrumbs.map((b, i) => (
              <span key={b.screen} className="flex items-center gap-1 shrink-0">
                {i > 0 && <Icon name="ChevronRight" size={12} className="text-white/20" />}
                <span className={`text-xs ${i === breadcrumbs.length - 1 ? 'text-cyan-400' : 'text-muted-foreground'}`}>
                  {b.label}
                </span>
              </span>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* ===== HEROES SCREEN ===== */}
        {screen === 'heroes' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h1 className="font-rajdhani font-bold text-2xl tracking-wider text-white">ГЕРОИ</h1>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                {store.heroes.length} персонажей
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {store.heroes.map((hero, i) => (
                <div key={hero.id} className="relative group" style={{ animationDelay: `${i * 0.05}s` }}>
                  <button
                    onClick={() => { setSelectedHero(hero); setScreen('players'); }}
                    className="w-full aspect-square rounded-2xl hero-card-hover relative overflow-hidden"
                    style={{ border: `1px solid ${hero.color}44` }}
                  >
                    {/* Background */}
                    {hero.icon ? (
                      <img src={hero.icon} alt={hero.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${hero.color}33, ${hero.color}11)` }}>
                        <span className="font-rajdhani font-bold text-5xl opacity-60"
                          style={{ color: hero.color }}>
                          {hero.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay + name */}
                    <div className="absolute inset-x-0 bottom-0 pt-6 pb-2 px-2 flex items-end justify-center"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)' }}>
                      <span className="font-rajdhani font-bold text-sm text-white leading-tight text-center w-full drop-shadow">
                        {hero.name}
                      </span>
                    </div>

                    {/* Build count badge */}
                    {buildCount(hero.id) > 0 && (
                      <span className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${hero.color}88`, color: '#fff', fontSize: '10px' }}>
                        {buildCount(hero.id)}
                      </span>
                    )}
                  </button>
                  {/* Edit/Delete overlay */}
                  <div className="absolute top-1 left-1 hidden group-hover:flex gap-1 z-10">
                    <button
                      onClick={e => { e.stopPropagation(); setEditingHero(hero); setEditHeroName(hero.name); setEditHeroIcon(hero.icon || null); }}
                      className="w-6 h-6 rounded-md bg-black/60 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Icon name="Pencil" size={11} className="text-white" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeletingHero(hero); }}
                      className="w-6 h-6 rounded-md bg-black/60 flex items-center justify-center hover:bg-red-500/60 transition-colors"
                    >
                      <Icon name="Trash2" size={11} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
              {/* Add hero shortcut */}
              <button
                onClick={() => setShowModal(true)}
                className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-cyan-400/40 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-cyan-400 transition-all"
              >
                <Icon name="Plus" size={24} />
                <span className="text-xs">Добавить</span>
              </button>
            </div>

            {/* Players quick list */}
            {store.players.length > 0 && (
              <div className="mt-8 pt-5 border-t border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-rajdhani font-bold text-base tracking-wider text-white/50">ИГРОКИ</h3>
                  <span className="text-xs text-muted-foreground">{store.players.length} чел.</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {store.players.map(p => (
                    <div key={p.id} className="flex items-center gap-1.5 glass-card px-3 py-1.5 rounded-full">
                      <span className="text-sm text-white/70">{p.nickname}</span>
                      <button onClick={() => store.deletePlayer(p.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PLAYERS SCREEN ===== */}
        {screen === 'players' && selectedHero && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-rajdhani font-bold text-lg overflow-hidden"
                style={{ background: `${selectedHero.color}33`, color: selectedHero.color }}>
                {selectedHero.icon
                  ? <img src={selectedHero.icon} alt={selectedHero.name} className="w-full h-full object-cover" />
                  : selectedHero.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-rajdhani font-bold text-xl tracking-wider text-white">{selectedHero.name}</h2>
                <p className="text-xs text-muted-foreground">Выберите игрока</p>
              </div>
            </div>

            {(() => {
              const players = store.getPlayersForHero(selectedHero.id);
              return (
                <div className="space-y-2">
                  {players.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="Users" size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Нет сборок для этого героя</p>
                      <p className="text-xs mt-1 opacity-70">Нажмите + чтобы добавить первую</p>
                    </div>
                  )}
                  {players.map((player, i) => {
                    const count = store.builds.filter(b => b.heroId === selectedHero.id && b.playerId === player.id).length;
                    return (
                      <button
                        key={player.id}
                        onClick={() => { setSelectedPlayer(player); setScreen('ranks'); }}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl glass-card hover:border-cyan-400/30 transition-all hover:bg-cyan-400/5 animate-fade-in group"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-rajdhani font-bold text-sm"
                            style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                            {player.nickname.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">{player.nickname}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {count} {count === 1 ? 'сборка' : 'сборок'}
                          </span>
                          <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ===== RANKS SCREEN ===== */}
        {screen === 'ranks' && selectedHero && selectedPlayer && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-rajdhani font-bold text-lg overflow-hidden"
                style={{ background: `${selectedHero.color}33`, color: selectedHero.color }}>
                {selectedHero.icon
                  ? <img src={selectedHero.icon} alt={selectedHero.name} className="w-full h-full object-cover" />
                  : selectedHero.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-rajdhani font-bold text-xl tracking-wider text-white">{selectedPlayer.nickname}</h2>
                <p className="text-xs text-muted-foreground">Выберите ранг</p>
              </div>
            </div>

            {(() => {
              const ranks = store.getRanksForHeroPlayer(selectedHero.id, selectedPlayer.id);
              return (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {ranks.map((rank, i) => (
                    <button
                      key={rank}
                      onClick={() => { setSelectedRank(rank); setScreen('rounds'); }}
                      className="aspect-square rounded-2xl rank-badge flex items-center justify-center hero-card-hover animate-scale-in"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div className="text-center">
                        <div className="font-rajdhani font-bold text-3xl neon-text-gold">{rank}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">ранг</div>
                      </div>
                    </button>
                  ))}
                  {ranks.length === 0 && (
                    <div className="col-span-4 text-center py-12 text-muted-foreground">
                      <Icon name="Star" size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Нет сборок</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ===== ROUNDS SCREEN ===== */}
        {screen === 'rounds' && selectedHero && selectedPlayer && selectedRank !== null && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl rank-badge flex items-center justify-center font-rajdhani font-bold text-xl neon-text-gold">
                {selectedRank}
              </div>
              <div>
                <h2 className="font-rajdhani font-bold text-xl tracking-wider text-white">Ранг {selectedRank}</h2>
                <p className="text-xs text-muted-foreground">Выберите раунд</p>
              </div>
            </div>

            {(() => {
              const rounds = store.getRoundsForHeroPlayerRank(selectedHero.id, selectedPlayer.id, selectedRank);
              return (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {rounds.map((round, i) => (
                    <button
                      key={round}
                      onClick={() => { setSelectedRound(round); setScreen('build'); }}
                      className="aspect-square rounded-2xl flex items-center justify-center hero-card-hover animate-scale-in neon-border-purple"
                      style={{ background: 'rgba(168,85,247,0.1)', animationDelay: `${i * 0.06}s` }}
                    >
                      <div className="text-center">
                        <div className="font-rajdhani font-bold text-3xl neon-text-purple">{round}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">раунд</div>
                      </div>
                    </button>
                  ))}
                  {rounds.length === 0 && (
                    <div className="col-span-4 text-center py-12 text-muted-foreground">
                      <Icon name="Hash" size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Нет раундов</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ===== BUILD SCREEN ===== */}
        {screen === 'build' && activeBuild && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-rajdhani font-bold text-xl tracking-wider text-white">
                  Раунд {activeBuild.round}
                </h2>
                {activeBuild.notes && (
                  <p className="text-sm text-muted-foreground mt-0.5">{activeBuild.notes}</p>
                )}
              </div>
              <button
                onClick={() => { store.deleteBuild(activeBuild.id); goBack(); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all"
              >
                <Icon name="Trash2" size={18} />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden neon-border-cyan">
              <img
                src={activeBuild.imageUrl}
                alt="Build"
                className="w-full object-contain"
                style={{ maxHeight: '65vh', background: 'rgba(0,0,0,0.5)' }}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <div className="flex-1 glass-card rounded-xl px-3 py-2 flex items-center gap-2">
                <Icon name="Shield" size={13} className="text-cyan-400 shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{selectedHero?.name}</span>
              </div>
              <div className="flex-1 glass-card rounded-xl px-3 py-2 flex items-center gap-2">
                <Icon name="User" size={13} className="text-purple-400 shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{selectedPlayer?.nickname}</span>
              </div>
              <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-1.5">
                <Icon name="Star" size={13} className="text-amber-400 shrink-0" />
                <span className="text-xs text-muted-foreground font-rajdhani font-bold">{selectedRank}</span>
              </div>
            </div>
          </div>
        )}

        {screen === 'build' && !activeBuild && (
          <div className="text-center py-20 text-muted-foreground animate-fade-in">
            <Icon name="ImageOff" size={48} className="mx-auto mb-4 opacity-30" />
            <p>Сборка не найдена</p>
          </div>
        )}
      </main>

      {/* Edit Hero modal */}
      {editingHero && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditingHero(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs glass-card rounded-2xl p-5 animate-scale-in"
            style={{ border: '1px solid rgba(168,85,247,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-rajdhani font-bold text-lg text-white mb-4">Редактировать героя</h3>

            {/* Avatar picker */}
            <div className="flex items-center gap-4 mb-4">
              <input
                ref={editIconRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setEditHeroIcon(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }}
              />
              <button
                type="button"
                onClick={e => { e.preventDefault(); e.stopPropagation(); editIconRef.current?.click(); }}
                className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/20 hover:border-purple-400/50 flex items-center justify-center overflow-hidden transition-all shrink-0"
                style={{ background: editHeroIcon ? 'transparent' : `${editingHero.color}22` }}
              >
                {editHeroIcon ? (
                  <img src={editHeroIcon} alt="icon" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="ImagePlus" size={20} className="text-muted-foreground" />
                )}
              </button>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Аватарка героя</p>
                {editHeroIcon && (
                  <button
                    type="button"
                    onClick={() => setEditHeroIcon(null)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Удалить иконку
                  </button>
                )}
              </div>
            </div>

            <input
              type="text"
              value={editHeroName}
              onChange={e => setEditHeroName(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-400/60 mb-4"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditingHero(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-white bg-secondary transition-colors">
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editHeroName.trim()) {
                    store.updateHero(editingHero.id, { name: editHeroName.trim(), icon: editHeroIcon || undefined });
                    setEditingHero(null);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors"
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff' }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Hero confirm */}
      {deletingHero && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeletingHero(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs glass-card rounded-2xl p-5 animate-scale-in"
            style={{ border: '1px solid rgba(239,68,68,0.35)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <Icon name="Trash2" size={18} className="text-red-400" />
              </div>
              <h3 className="font-rajdhani font-bold text-lg text-white">Удалить героя?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Герой <span className="text-white font-medium">«{deletingHero.name}»</span> будет удалён.
            </p>
            <p className="text-sm text-red-400/80 mb-5">
              Все сборки этого героя ({buildCount(deletingHero.id)} шт.) тоже будут удалены безвозвратно.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDeletingHero(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-white bg-secondary transition-colors">
                Отмена
              </button>
              <button
                type="button"
                onClick={() => { store.deleteHero(deletingHero.id); setDeletingHero(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors bg-red-500/80 hover:bg-red-500 text-white"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <AddModal
          heroes={store.heroes}
          players={store.players}
          onAddHero={store.addHero}
          onAddPlayer={store.addPlayer}
          onAddBuild={handleAddBuild}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}