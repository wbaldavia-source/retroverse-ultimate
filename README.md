# RetroVerse — Ultimate Emulator

Aplicação web responsiva em React, TypeScript e Vite para organizar e executar arquivos de jogos que o usuário tem direito de usar. O player integra o loader EmulatorJS sob demanda; não incluímos ROMs ou BIOS.

## Executar

Requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Abra a URL mostrada pelo Vite. Para validar o bundle de produção:

```bash
npm run build
npm run preview
```

## Como jogar

1. Abra **Importar jogo** e selecione um arquivo compatível que você tenha direito de usar.
2. Confirme ou selecione manualmente o sistema/núcleo.
3. Adicione à biblioteca e escolha **Jogar agora**.
4. A interface guarda a ROM no IndexedDB do navegador. O EmulatorJS e o núcleo são carregados da CDN quando o player abre; portanto, jogar requer conexão e o carregamento pode ser bloqueado por rede/CSP.

A integração define as opções globais antes de carregar `loader.js`. Controles e opções do núcleo são fornecidos pelo próprio EmulatorJS. Tela cheia usa a Fullscreen API do navegador.

## Limites e segurança

- Não há ROMs ou BIOS no repositório. Use somente conteúdo que você está autorizado a usar.
- O limite imposto pelo importador é 128 MB por arquivo; o espaço real disponível é definido pelo navegador.
- A extensão é uma sugestão, não prova o formato. Arquivos não identificados requerem seleção manual; arquivos compartilhando extensão (`.bin`) não são autodetectados.
- Saturn e Neo Geo não estão habilitados nesta integração. A lista de núcleos no app não significa validação de cada sistema.
- Play online permanece sem jogos de terceiros até serem confirmados URLs e licenças de distribuição adequados.
- PWA faz cache do shell da aplicação, não dos núcleos/ROMs; a emulação não é offline nesta versão.
- Salvar/carregar estados é controlado pelo EmulatorJS/core. Não foi implementado gerenciador próprio de saves nesta etapa.

## Testes e status

A integração está implementada, mas não foi possível executar navegador, instalar dependências ou validar ROMs reais nesta sessão. Assim, nenhum console é declarado testado ou garantido como funcional. Antes de hospedar, rode `npm run build` e valide com ROMs homebrew/de teste licenciadas em cada navegador-alvo. Confirme os identificadores de núcleo e a política de CDN da versão EmulatorJS escolhida.

## Licenças

O app é distribuído sob MIT; consulte as licenças do EmulatorJS, dos núcleos e de quaisquer jogos separadamente. O uso de um núcleo não concede direitos sobre jogos ou BIOS.
