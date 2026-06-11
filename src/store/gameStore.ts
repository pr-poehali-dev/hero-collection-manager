import { useState, useEffect } from 'react';
import { Hero, Player, Build } from '@/types/game';

const STORAGE_KEY = 'buildvault_data';

interface GameData {
  heroes: Hero[];
  players: Player[];
  builds: Build[];
}

const defaultHeroes: Hero[] = [
  { id: '1', name: 'Феникс', color: '#ef4444' },
  { id: '2', name: 'Призрак', color: '#8b5cf6' },
  { id: '3', name: 'Шторм', color: '#3b82f6' },
  { id: '4', name: 'Железо', color: '#6b7280' },
  { id: '5', name: 'Ворон', color: '#1f2937' },
  { id: '6', name: 'Искра', color: '#f59e0b' },
];

const defaultPlayers: Player[] = [
  { id: '1', nickname: 'ProGamer777' },
  { id: '2', nickname: 'ShadowKnight' },
  { id: '3', nickname: 'StormBreaker' },
];

const defaultBuilds: Build[] = [];

function loadData(): GameData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_e) {
    // ignore parse errors
  }
  return { heroes: defaultHeroes, players: defaultPlayers, builds: defaultBuilds };
}

function saveData(data: GameData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useGameStore() {
  const [data, setData] = useState<GameData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addHero = (hero: Omit<Hero, 'id'>) => {
    const newHero: Hero = { ...hero, id: Date.now().toString() };
    setData(d => ({ ...d, heroes: [...d.heroes, newHero] }));
  };

  const updateHero = (id: string, updates: Partial<Hero>) => {
    setData(d => ({ ...d, heroes: d.heroes.map(h => h.id === id ? { ...h, ...updates } : h) }));
  };

  const deleteHero = (id: string) => {
    setData(d => ({
      ...d,
      heroes: d.heroes.filter(h => h.id !== id),
      builds: d.builds.filter(b => b.heroId !== id)
    }));
  };

  const addPlayer = (player: Omit<Player, 'id'>) => {
    const newPlayer: Player = { ...player, id: Date.now().toString() };
    setData(d => ({ ...d, players: [...d.players, newPlayer] }));
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setData(d => ({ ...d, players: d.players.map(p => p.id === id ? { ...p, ...updates } : p) }));
  };

  const deletePlayer = (id: string) => {
    setData(d => ({
      ...d,
      players: d.players.filter(p => p.id !== id),
      builds: d.builds.filter(b => b.playerId !== id)
    }));
  };

  const addBuild = (build: Omit<Build, 'id' | 'createdAt'>) => {
    const newBuild: Build = { ...build, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setData(d => ({ ...d, builds: [...d.builds, newBuild] }));
  };

  const deleteBuild = (id: string) => {
    setData(d => ({ ...d, builds: d.builds.filter(b => b.id !== id) }));
  };

  const getBuildsForHero = (heroId: string) => data.builds.filter(b => b.heroId === heroId);
  const getPlayersForHero = (heroId: string) => {
    const playerIds = new Set(data.builds.filter(b => b.heroId === heroId).map(b => b.playerId));
    return data.players.filter(p => playerIds.has(p.id));
  };
  const getRanksForHeroPlayer = (heroId: string, playerId: string) => {
    const ranks = new Set(data.builds.filter(b => b.heroId === heroId && b.playerId === playerId).map(b => b.rank));
    return Array.from(ranks).sort((a, b) => a - b);
  };
  const getRoundsForHeroPlayerRank = (heroId: string, playerId: string, rank: number) => {
    const rounds = new Set(
      data.builds.filter(b => b.heroId === heroId && b.playerId === playerId && b.rank === rank).map(b => b.round)
    );
    return Array.from(rounds).sort((a, b) => a - b);
  };
  const getBuild = (heroId: string, playerId: string, rank: number, round: number) => {
    return data.builds.find(b => b.heroId === heroId && b.playerId === playerId && b.rank === rank && b.round === round);
  };

  return {
    heroes: data.heroes,
    players: data.players,
    builds: data.builds,
    addHero, updateHero, deleteHero,
    addPlayer, updatePlayer, deletePlayer,
    addBuild, deleteBuild,
    getBuildsForHero, getPlayersForHero,
    getRanksForHeroPlayer, getRoundsForHeroPlayerRank,
    getBuild,
  };
}