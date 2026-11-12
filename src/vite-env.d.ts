/// <reference types="vite/client" />
interface Window {
  EJS_player?: string;
  EJS_gameUrl?: string;
  EJS_gameName?: string;
  EJS_core?: string;
  EJS_pathtodata?: string;
  EJS_startOnLoaded?: boolean;
  EJS_color?: string;
  EJS_onGameStart?: () => void;
  EJS_onLoad?: () => void;
}
