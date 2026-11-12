export type CoreId = 'nes' | 'snes' | 'gb' | 'gba' | 'n64' | 'psx' | 'segaMD' | 'segaMS' | 'segaGG' | 'atari2600' | 'mame2003';

export interface GameRecord {
  id: string;
  name: string;
  fileName: string;
  size: number;
  addedAt: number;
  core: CoreId;
  favorite: boolean;
  rom: Blob;
}

export const CORE_OPTIONS: { id: CoreId; label: string; extensions: string[] }[] = [
  { id: 'nes', label: 'Nintendo Entertainment System', extensions: ['nes'] },
  { id: 'snes', label: 'Super Nintendo', extensions: ['sfc', 'smc'] },
  { id: 'gb', label: 'Game Boy / Game Boy Color', extensions: ['gb', 'gbc'] },
  { id: 'gba', label: 'Game Boy Advance', extensions: ['gba'] },
  { id: 'n64', label: 'Nintendo 64', extensions: ['n64', 'z64', 'v64'] },
  { id: 'psx', label: 'PlayStation', extensions: ['iso', 'bin', 'cue', 'pbp'] },
  { id: 'segaMD', label: 'Sega Mega Drive / Genesis', extensions: ['md', 'gen', 'bin'] },
  { id: 'segaMS', label: 'Sega Master System', extensions: ['sms'] },
  { id: 'segaGG', label: 'Sega Game Gear', extensions: ['gg'] },
  { id: 'atari2600', label: 'Atari 2600', extensions: ['a26', 'bin'] },
  { id: 'mame2003', label: 'Arcade (MAME 2003)', extensions: ['zip'] },
];

export function detectCore(fileName: string, header?: Uint8Array): CoreId | null {
  if (header?.length >= 4 && header[0] === 0x4e && header[1] === 0x45 && header[2] === 0x53 && header[3] === 0x1a) return 'nes';
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  const matches = CORE_OPTIONS.filter((core) => core.extensions.includes(ext));
  // Extensions shared by unrelated systems (for example .bin) are intentionally not guessed.
  return matches.length === 1 ? matches[0].id : null;
}
