import { useEffect, useRef, useState } from 'react';
import type { GameRecord } from './types';

const DATA_PATH = 'https://cdn.emulatorjs.org/stable/data/';

export default function Emulator({ game, onClose }: { game: GameRecord; onClose: () => void }) {
  const [status, setStatus] = useState('Preparando o emulador…');
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const romUrl = URL.createObjectURL(game.rom);
    const host = playerRef.current;
    if (!host) return;

    host.replaceChildren();
    const mount = document.createElement('div');
    mount.id = 'retroverse-emulator-player';
    mount.className = 'emulator-player';
    host.appendChild(mount);

    // EmulatorJS reads these globals before loader.js is evaluated.
    window.EJS_player = '#retroverse-emulator-player';
    window.EJS_gameUrl = romUrl;
    window.EJS_gameName = game.name;
    window.EJS_core = game.core;
    window.EJS_pathtodata = DATA_PATH;
    window.EJS_startOnLoaded = true;
    window.EJS_color = '#a78bfa';
    window.EJS_onLoad = () => { if (active) setStatus('Emulador carregado'); };
    window.EJS_onGameStart = () => { if (active) setStatus('Jogo em execução'); };

    const script = document.createElement('script');
    script.src = `${DATA_PATH}loader.js`;
    script.async = true;
    script.onload = () => { if (active) setStatus('Inicializando núcleo…'); };
    script.onerror = () => { if (active) setStatus('Falha ao carregar o motor. Verifique a conexão e tente novamente.'); };
    document.body.appendChild(script);

    return () => {
      active = false;
      script.remove();
      host.replaceChildren();
      URL.revokeObjectURL(romUrl);
      delete window.EJS_player;
      delete window.EJS_gameUrl;
      delete window.EJS_gameName;
      delete window.EJS_core;
      delete window.EJS_pathtodata;
      delete window.EJS_startOnLoaded;
      delete window.EJS_onLoad;
      delete window.EJS_onGameStart;
    };
  }, [game]);

  return <section className="play-overlay" aria-label="Emulador">
    <div className="play-topbar">
      <button className="back-button" onClick={onClose}>← Biblioteca</button>
      <div><strong>{game.name}</strong><span>{game.core} · {status}</span></div>
      <button className="icon-button" title="Tela cheia" onClick={() => void document.querySelector('.emulator-player')?.requestFullscreen?.()}>⛶</button>
    </div>
    <div className="emulator-frame" ref={playerRef} />
    <p className="emulator-note">O motor EmulatorJS é carregado da CDN oficial. Uma conexão com a internet é necessária para carregar o núcleo.</p>
  </section>;
}
