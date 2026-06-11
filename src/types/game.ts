export interface Hero {
  id: string;
  name: string;
  icon?: string;
  color: string;
}

export interface Player {
  id: string;
  nickname: string;
}

export interface Build {
  id: string;
  heroId: string;
  playerId: string;
  rank: number;
  round: number;
  imageUrl: string;
  createdAt: string;
  notes?: string;
}

export type Screen = 'heroes' | 'players' | 'ranks' | 'rounds' | 'build';
