# STATE.md — daily-hero-wod

> Fonte canônica de verdade do projeto. Ler no início de toda sessão. Histórico de chat NÃO é estado.

## O que é

**DailyHeroWod** — tracker de Hero WODs (CrossFit) e recordes de Hyrox. Log de tempo, peso e repetições, com histórico, destaque de recordes pessoais, e sincronização em nuvem quando logado. Projeto de portfólio.

## Stack

- **Front:** React + Vite + TypeScript. UI com **Material-UI** (`@mui/material`, `@mui/x-charts`, `@mui/x-date-pickers`).
- **Dados:** Firebase (Auth + Firestore), sincronização em nuvem quando logado; suporte a armazenamento local.
- **PWA:** `vite-plugin-pwa` instalado.
- **Datas:** Moment.js.
- **Testes:** Vitest.
- **Deploy:** GitHub Pages, branch `gh-pages` — **live:** https://flavioricardo.github.io/daily-hero-wod/ (sincronizado: build 21s após o commit da main)
- **Repo:** https://github.com/flavioricardo/daily-hero-wod (público, branch main)

## Funcionalidades

- Registrar recordes (tipo: tempo/peso/reps, data, valor)
- Ver e filtrar histórico, com destaque de recordes pessoais
- Modo escuro/claro
- Treinos customizados (além dos Hero WODs padrão)
- Design responsivo (desktop e mobile)

## Correções feitas (sessão 2026-07-07)

- Fix de violação de regra dos hooks na listagem de recordes
- Correção de bugs nos gráficos de tempo e ordenação
- Captura do ID do documento Firestore logo após `addDoc` (evitava re-fetch)
- Tipagem TypeScript dos recordes
- Aplicado design system "whiteboard do box" (tema MUI)

## Pendências

1. **Revogar o fine-grained PAT do GitHub** usado nesta sessão (STATE.md criado via chat) — https://github.com/settings/tokens | Bloqueia: segurança da conta | Aberto desde: 2026-07-28
2. **README ainda tem placeholders de screenshot** (`via.placeholder.com`) e link de clone genérico (`your-repo`) — cosmético, mas passa impressão de projeto incompleto para quem vê o portfólio | Aberto desde: 2026-07-28
