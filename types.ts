
export interface Participant {
  id: string;
  name: string;
}

export interface Winner {
  id: string;
  name: string;
  prize?: string;
  timestamp: number;
}

export interface Group {
  id: string;
  name: string;
  members: Participant[];
}

export enum AppTab {
  LIST = 'list',
  DRAW = 'draw',
  GROUPING = 'grouping'
}
