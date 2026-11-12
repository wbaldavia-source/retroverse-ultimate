import { useEffect, useMemo, useRef, useState } from 'react';
import { Gamepad2, Search, Upload, Star, Play, Trash2, Monitor, ShieldCheck, Menu, X, Clock3, Globe2, Settings, Joystick } from 'lucide-react';
import Emulator from './Emulator';
import { formatSize, listGames, removeGame, saveGame, updateGame } from './library';
import { CORE_OPTIONS, detectCore, type CoreId, type GameRecord } from './types';

const MAX_ROM_BYTES = 128 * 1024 * 1024;

type View = 'home' | 'library' | 'consoles' | 'online' | 'settings';

export default function App() {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [active, setActive] = useState<GameRecord | null>(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('home');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingCore, setPendingCore] = useState<CoreId | ''>('');
  const [message, setMessage] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function refresh() {
    try { setGames(await listGames()); }
    catch { setMessage('Este navegador não disponibilizou o armazenamento IndexedDB.'); }
  }
  useEffect(() => { void refresh(); }, []);

  const visibleGames = useMemo(() => games.filter((game) =>
    (filter !== 'favorites' || game.favorite) && `${game.name} ${game.fileName}`.toLowerCase().includes(query.toLowerCase()),
  ), [games, filter, query]);

  async function acceptFile(file?: File) {
    if (!file) return;
    setMessage('');
    if (file.size === 0 || file.size > MAX_ROM_BYTES) {
      setMessage('Arquivo inválido ou maior que o limite de 128 MB.');
      return;
    }
    const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const detected = detectCore(file.name, header);
    setPendingFile(file);
    setPendingCore(detected ?? '');
  }

  async function importGame() {
    if (!pendingFile || !pendingCore) return;
    try {
      const game = await saveGame(pendingFile, pendingCore);
      setPendingFile(null);
      setPendingCore('');
      if (fileInput.current) fileInput.current.value = '';
      setMessage(`“${game.name}” adicionado à sua biblioteca.`);
      await refresh();
      setView('library');
    } catch {
      setMessage('Não foi possível salvar. Verifique o espaço disponível no navegador.');
    }
  }

  async function toggleFavorite(game: GameRecord) {
    const updated = { ...game, favorite: !game.favorite };
    await updateGame(updated);
    await refresh();
  }

  async function deleteGame(game: GameRecord) {
    if (!window.confirm(`Remover “${game.name}” deste dispositivo?`)) return;
    await removeGame(game.id);
    await refresh();
  }

  const navItems: { id: View; label: string; icon: typeof Gamepad2 }[] = [
    { id: 'home', label: 'Início', icon: Monitor },
    { id: 'library', label: 'Minha biblioteca', icon: Gamepad2 },
    { id: 'consoles', label: 'Consoles', icon: Joystick },
    { id: 'online', label: 'Jogar online', icon: Globe2 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  if (active) return <Emulator game={active} onClose={() => { setActive(null); void refresh(); }} />;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <a className="brand" href="#home" onClick={() => { setView('home'); setMobileNav(false); }}><span className="brand-mark"><Gamepad2 size={22} /></span><span>RETRO<span className="brand-accent">VERSE</span><small>ULTIMATE EMULATOR</small></span></a>
      <div className="nav-caption">MENU</div>
      <nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${view === id ? 'selected' : ''}`} onClick={() => { setView(id); setMobileNav(false); }}><Icon size={18} />{label}{id === 'library' && games.length > 0 && <span className="nav-count">{games.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="legal-card"><ShieldCheck size={18} /><div><strong>Seus jogos, suas regras</strong><p>Importe apenas arquivos que você tem direito de usar.</p></div></div><span className="version-label">RETROVERSE · 0.1.0</span></div>
    </aside>
    {mobileNav && <button className="scrim" aria-label="Fechar menu" onClick={() => setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" aria-label="Abrir menu" onClick={() => setMobileNav(true)}><Menu /></button><div className="breadcrumbs">INÍCIO <span>/</span> {view.toUpperCase()}</div><div className="top-actions"><button className="upload-button" onClick={() => fileInput.current?.click()}><Upload size={16} /> Importar jogo</button><input ref={fileInput} hidden type="file" accept=".nes,.sfc,.smc,.gb,.gbc,.gba,.n64,.z64,.v64,.iso,.bin,.cue,.pbp,.md,.gen,.sms,.gg,.a26,.zip" onChange={(e) => void acceptFile(e.target.files?.[0])} /></div></header>
      <div className="content">
        {message && <div className="notice" role="status">{message}<button aria-label="Fechar aviso" onClick={() => setMessage('')}>×</button></div>}
        {pendingFile && <div className="import-card"><div><strong>Importar {pendingFile.name}</strong><p>{formatSize(pendingFile.size)} · O arquivo ficará armazenado somente neste navegador.</p></div><select value={pendingCore} onChange={(e) => setPendingCore(e.target.value as CoreId)} aria-label="Escolha o sistema"><option value="">Escolha ou confirme o sistema</option>{CORE_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select><button className="primary-button" disabled={!pendingCore} onClick={() => void importGame()}>Adicionar</button><button className="close-import" onClick={() => setPendingFile(null)} aria-label="Cancelar">×</button></div>}
        {view === 'home' && <>
          <section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="live-dot" /> JOGUE NO SEU NAVEGADOR</span><h1>Seu próximo<br /><span>continue?</span></h1><p>Uma casa para seus clássicos. Importe seus próprios jogos e jogue direto no navegador — sem instalar um emulador.</p><div className="hero-buttons"><button className="primary-button" onClick={() => fileInput.current?.click()}><Upload size={17} /> Importar um jogo</button><button className="secondary-button" onClick={() => setView('library')}>Abrir biblioteca <span>→</span></button></div><div className="hero-legal"><ShieldCheck size={15} /> Sem ROMs comerciais distribuídas. Você fornece seus próprios arquivos.</div></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="pixel-console"><div className="console-light"/><Gamepad2 size={84} strokeWidth={1.2} /></div><span className="float-pixel p1">✦</span><span className="float-pixel p2">◆</span><span className="float-pixel p3">✳</span></div></section>
          <section className="section-block"><div className="section-heading"><div><span className="eyebrow">COMECE A JOGAR</span><h2>Sua coleção</h2></div><button className="text-button" onClick={() => setView('library')}>Ver biblioteca <span>→</span></button></div>{games.length ? <GameGrid games={games.slice(0, 4)} onPlay={setActive} onFavorite={toggleFavorite} onDelete={deleteGame} /> : <EmptyState onImport={() => fileInput.current?.click()} />}</section>
          <section className="feature-row"><div><span className="feature-icon"><Joystick /></span><strong>Seu arquivo, seu jogo</strong><p>ROMs ficam no armazenamento local do seu navegador.</p></div><div><span className="feature-icon"><Monitor /></span><strong>Emulação no browser</strong><p>Motor EmulatorJS carregado sob demanda com conexão ativa.</p></div><div><span className="feature-icon"><ShieldCheck /></span><strong>Privacidade primeiro</strong><p>Seus arquivos não são enviados a um servidor.</p></div></section>
        </>}
        {view === 'library' && <><PageHeading eyebrow="SUA COLEÇÃO" title="Minha biblioteca" /><div className="library-tools"><div className="search-box"><Search size={17} /><input placeholder="Buscar jogos…" value={query} onChange={(e) => setQuery(e.target.value)} /></div><button className={`filter-button ${filter === 'favorites' ? 'filter-on' : ''}`} onClick={() => setFilter(filter === 'all' ? 'favorites' : 'all')}><Star size={15} /> Favoritos</button><span className="game-total">{visibleGames.length} jogos</span></div>{visibleGames.length ? <GameGrid games={visibleGames} onPlay={setActive} onFavorite={toggleFavorite} onDelete={deleteGame} /> : <EmptyState onImport={() => fileInput.current?.click()} />}</>}
        {view === 'consoles' && <><PageHeading eyebrow="PLATAFORMAS" title="Consoles" description="Escolha um sistema ao importar seu arquivo. A disponibilidade depende do núcleo EmulatorJS e do formato do jogo." /><div className="console-grid">{CORE_OPTIONS.map((core, i) => <button className="console-card" key={core.id} onClick={() => { setPendingCore(core.id); fileInput.current?.click(); }}><span className={`console-symbol hue-${i % 5}`}>{['◈','▦','◆','◉','⌘'][i % 5]}</span><strong>{core.label}</strong><span>{core.extensions.map((ext) => `.${ext}`).join(' · ')}</span><small>Núcleo: {core.id}</small></button>)}</div><div className="known-limit"><ShieldCheck size={17} /> Atari, NES, SNES, Master System, Mega Drive, Game Boy, Game Boy Advance, Nintendo 64, PlayStation e Arcade têm opções de núcleo. Saturn e Neo Geo ainda não estão habilitados nesta primeira integração.</div></>}
        {view === 'online' && <><PageHeading eyebrow="CATÁLOGO AUTORIZADO" title="Jogar online" description="Não hospedamos ROMs nem distribuímos jogos comerciais. Adicione somente jogos com licença que permita a distribuição e execução online." /><div className="online-card"><span className="online-icon"><Globe2 size={24} /></span><div><strong>Catálogo online ainda não configurado</strong><p>Para evitar links sem licença verificável, esta versão não apresenta ROMs de terceiros. O player já aceita arquivos locais; jogos de domínio público ou homebrew poderão ser incluídos quando houver autorização e URL oficial confirmadas.</p></div><a href="https://github.com/wbaldavia-source/retroverse-ultimate" target="_blank" rel="noreferrer">Ver projeto ↗</a></div><div className="online-note"><ShieldCheck size={17} /> Não use cópias de jogos sem autorização. Respeite as leis aplicáveis e os termos de licença.</div></>}
        {view === 'settings' && <><PageHeading eyebrow="PREFERÊNCIAS" title="Configurações" description="Preferências do navegador e informações sobre esta versão." /><div className="settings-card"><div><strong>Motor de emulação</strong><p>EmulatorJS stable via CDN — conexão necessária para carregar loader e núcleo.</p></div><span className="status-pill">Carrega ao iniciar jogo</span><div><strong>Armazenamento</strong><p>Biblioteca IndexedDB deste navegador/dispositivo. Limpar dados do site pode apagar seus arquivos.</p></div><span className="status-pill">Local</span><div><strong>Arquivos de jogo</strong><p>Limite de importação desta interface: 128 MB por arquivo. O navegador também impõe limites de cota.</p></div><span className="status-pill">128 MB</span><div><strong>Compatibilidade ainda não validada</strong><p>O carregamento do núcleo depende do sistema, do formato, de BIOS quando exigida e da versão do navegador. Não foram executados testes de jogos nesta sessão.</p></div><span className="status-pill status-warn">Em validação</span></div></>}
      </div>
    </main>
  </div>;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>;
}

function EmptyState({ onImport }: { onImport: () => void }) {
  return <div className="empty-state"><span className="empty-icon"><Gamepad2 size={27} /></span><h3>Sua aventura começa aqui</h3><p>Importe um arquivo de jogo compatível para começar. O jogo não será enviado para nenhum servidor.</p><button className="secondary-button" onClick={onImport}><Upload size={15} /> Escolher arquivo</button></div>;
}

function GameGrid({ games, onPlay, onFavorite, onDelete }: { games: GameRecord[]; onPlay: (game: GameRecord) => void; onFavorite: (game: GameRecord) => void; onDelete: (game: GameRecord) => void }) {
  return <div className="game-grid">{games.map((game) => <article className="game-card" key={game.id}><div className="game-cover"><span className="cover-mark"><Gamepad2 size={36} /></span><span className="system-chip">{game.core}</span><div className="cover-actions"><button title={game.favorite ? 'Remover favorito' : 'Favoritar'} onClick={() => void onFavorite(game)}><Star size={16} fill={game.favorite ? 'currentColor' : 'none'} /></button><button title="Remover da biblioteca" onClick={() => void onDelete(game)}><Trash2 size={15} /></button></div></div><div className="game-info"><strong title={game.name}>{game.name}</strong><span>{formatSize(game.size)} <i /> {new Date(game.addedAt).toLocaleDateString('pt-BR')}</span><button className="play-button" onClick={() => onPlay(game)}><Play size={14} fill="currentColor" /> Jogar agora</button></div></article>)}</div>;
}
