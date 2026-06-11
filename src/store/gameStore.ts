import { useState, useEffect } from 'react';
import { Hero, Player, Build } from '@/types/game';

const STORAGE_KEY = 'buildvault_data';

interface GameData {
  heroes: Hero[];
  players: Player[];
  builds: Build[];
}

const defaultHeroes: Hero[] = [
  { id: '1', name: 'Харкон', color: '#a78b5c', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/84c60e99-e58b-4763-a09c-b545dd945e1a.png' },
  { id: '2', name: 'Дорф', color: '#f59e0b', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/1bc3535e-4f5b-47bc-b245-ea1f989c9d49.png' },
  { id: '3', name: 'Базз', color: '#84cc16', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/61f28718-1f3c-4f79-a245-dcba1283c55c.png' },
  { id: '4', name: 'Селеста', color: '#3b82f6', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/b08c7982-9ede-4ae9-bc06-be23b17647f9.png' },
  { id: '5', name: 'Чана', color: '#06b6d4', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/e53c958f-b500-43f5-b3cf-82503f703254.png' },
  { id: '6', name: 'Енох', color: '#f97316', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/3d0b2116-89c7-45b2-a992-9c66200e9dd2.png' },
  { id: '7', name: 'Ферн', color: '#8b5cf6', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/e01643c3-0c2b-4df6-addd-8732ff25aaae.png' },
  { id: '8', name: 'Крагг', color: '#ef4444', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/ec43bec0-4d20-46c0-a454-60400f6d546a.png' },
  { id: '9', name: 'Морроу', color: '#7c3aed', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/919dfb4a-6eaa-415e-a31d-521087d8b0a6.png' },
  { id: '10', name: 'Нимфа', color: '#10b981', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/b4d79ba0-4e94-4165-b319-81871c4f8bc6.png' },
  { id: '11', name: 'Пеппер', color: '#f97316', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/1a414950-084b-41d9-8def-309cc2ee1b6c.png' },
  { id: '12', name: 'Ронан', color: '#84cc16', icon: 'https://cdn.poehali.dev/projects/e30d8fab-35c1-42bd-b39e-568266ee863b/bucket/c5e4c999-3b8e-4370-b2ae-59f13d94da81.png' },
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