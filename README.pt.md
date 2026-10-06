<div align="center">

<img src=".github/logo.svg" alt="Logo do LinkedIn Insights" width="120" height="120">

# LinkedIn Insights

**Transforme a exportação de analytics do LinkedIn num dashboard para quem posta.**<br>
Melhor dia para postar, temas que performam, momentum e posts "double win". Tudo roda no seu navegador. Nada é enviado.

[![Demo ao vivo](https://img.shields.io/badge/Demo_ao_vivo-abrir-4DA3FF?style=for-the-badge&logo=vercel&logoColor=white)](https://linkedin-insights-eight.vercel.app)

[![CI](https://github.com/obrenoalvim/linkedin-insights/actions/workflows/ci.yml/badge.svg)](https://github.com/obrenoalvim/linkedin-insights/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/obrenoalvim/linkedin-insights?style=flat&logo=github&color=4da3ff)](https://github.com/obrenoalvim/linkedin-insights/stargazers)
[![100% client-side](https://img.shields.io/badge/privacidade-100%25_client--side-34d399)](#funcionalidades)

[English](README.md) · **Português**

[Funcionalidades](#funcionalidades) · [Como começar](#como-começar) · [Tecnologias](#tecnologias) · [Notas de design](#notas-de-design) · [Perguntas frequentes](#perguntas-frequentes)

</div>

---

O **Sinal** transforma a exportação de "Análise de conteúdo" do próprio LinkedIn
(`AggregateAnalytics_*.xlsx`) em um dashboard feito para quem posta. Vai além de impressões e
número de seguidores, e responde as perguntas que quem cria conteúdo realmente tem: em qual dia
da semana devo postar, quais temas performam melhor, quais posts renderam acima do esperado.

Tudo roda no seu navegador. O `.xlsx` é processado no client-side com SheetJS, nada é enviado
para lugar nenhum, não existe back-end.

## Funcionalidades

- **Estatísticas gerais**: impressões, alcance, seguidores, taxa de engajamento do período exportado.
- **Melhor dia para postar**: taxa média de engajamento por dia da semana, comparada com a
  frequência real de posts em cada dia.
- **Momentum**: últimos 7 dias vs. os 7 anteriores, para saber se o alcance está subindo ou caindo.
- **Eficiência de alcance**: impressões por seguidor, um indicativo de alcance além da sua própria rede.
- **Temas que performam**: hashtags extraídas diretamente da URL de cada post, ranqueadas por
  engajamento e impressões médias.
- **Posts "double win"**: posts que aparecem nas listas de top-engajamento e top-impressões ao
  mesmo tempo.
- **Maior intervalo sem postar**, tabelas de top posts e dados demográficos da audiência (empresa,
  senioridade, indústria, localização...).
- **Qualquer localidade de exportação**: nomes de planilhas, ordem de data (`DD/MM` vs `MM/DD`)
  e formatação de porcentagem ("< 1%" vs "menos de 1%") são detectados automaticamente; testado
  com exportações em inglês e em português (Brasil).
- Modo escuro/claro, sem conta, sem tracking.

## Como começar

Teste sem instalar nada: abra a [demo ao vivo](https://linkedin-insights-eight.vercel.app) e solte seu `.xlsx` na página.

Para rodar localmente:

```bash
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) e solte seu arquivo `.xlsx` na página (ou
clique em "Selecionar arquivo").

Obtenha a exportação no LinkedIn: seu perfil → **Análises** → **Análise de conteúdo** →
**Exportar** (últimos 90 dias, ou até um ano em algumas contas).

## Tecnologias

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** com um kit de UI próprio copiado para o repo (`src/components/ui`)
- **[xlsx (SheetJS)](https://sheetjs.com/)**: processa a exportação no navegador (build oficial
  via CDN, não o pacote npm vulnerável)
- **[Recharts](https://recharts.org)** para os gráficos
- **Zod** para validar/normalizar os números vindos da planilha
- **Vitest** para testes unitários

## Estrutura do projeto

```
src/
  lib/
    linkedin-export.ts   # parseia as 5 planilhas da exportação (por posição, agnóstico de idioma)
    dates.ts              # detecta DD/MM vs MM/DD por arquivo e normaliza para ISO local
    weekday-insights.ts, topics.ts, extra-insights.ts
    format.ts              # formatação de número/data/porcentagem pt-BR
  components/
    file-drop.tsx           # tela de upload / arrastar-e-soltar
    engagement-chart.tsx, followers-chart.tsx, weekday-chart.tsx, topics-chart.tsx
    extra-insights.tsx, top-posts.tsx, demographics.tsx
    stat-tile.tsx, insight-card.tsx, chart-card.tsx, chart-tooltip.tsx, bar-list.tsx
    ui/                       # kit copiado do front-template-react
  pages/dashboard.tsx        # controla o estado (arquivo carregado ou não) e o layout da página
```

## Scripts

| Script              | Descrição                            |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Inicia o servidor de desenvolvimento |
| `npm run build`     | Build de produção                    |
| `npm run preview`   | Pré-visualiza o build de produção    |
| `npm run lint`      | oxlint + checagem do Prettier        |
| `npm run format`    | Formata com Prettier                 |
| `npm run test:unit` | Vitest                               |

## Notas de design

- **Começou a partir do `front-template-react`**, depois removeu tudo que aquele template
  precisava mas uma ferramenta local de uma tela só não precisa: auth, i18n multi-idioma,
  TanStack Query, zustand, react-hook-form, react-router. O que sobrou (Tailwind v4, o kit de UI
  copiado, modo escuro, uma `Table` ordenável/paginada) foi reaproveitado como estava.
- **Sem gráficos de eixo duplo.** Impressões e engajamentos ficam em escalas muito diferentes
  (centenas vs. dezenas), então em vez de um gráfico com dois eixos Y (um anti-padrão de
  dataviz), "Impressões por dia" e "Taxa de engajamento por dia" são dois small-multiples
  compartilhando o mesmo eixo X.
- **Paleta dos gráficos** é uma paleta categórica/sequencial pré-validada (checada quanto a
  contraste e segurança para deuteranopia/protanopia), não escolhida no olho. Veja
  `--series-1..8` em `src/index.css`.
- **Parser à prova de idioma.** O LinkedIn envia o mesmo layout de planilha em qualquer idioma de
  exportação, só os rótulos mudam. Então `linkedin-export.ts` lê as planilhas por posição em vez
  de casar nomes em inglês, detecta a ordem de data (`DD/MM` vs `MM/DD`) escaneando todas as datas
  do arquivo em busca de um valor acima de 12, e extrai porcentagens por regex em vez de casar
  palavras como "less than". Uma data `YYYY-MM-DD` pura também recebe um sufixo explícito de
  horário local, senão ela é interpretada como UTC meia-noite e volta um dia em fusos negativos
  (Brasil incluso).
- **Extração de tópicos é uma heurística.** O LinkedIn codifica as hashtags de um post no slug da
  URL (`.../author_tag-um-tag-dois-share-123`); `topics.ts` faz o split nisso, então só enxerga
  hashtags usadas em posts que entraram nas listas de Top Posts (máx. ~50 cada), não no seu
  histórico completo de posts.

---

## Perguntas frequentes

**Meus dados são enviados para algum lugar?**
Não. O `.xlsx` é processado no seu navegador com SheetJS, e não existe back-end.

**Onde pego a exportação?**
No LinkedIn: seu perfil, depois **Análises**, **Análise de conteúdo**, **Exportar**. Cobre os últimos 90 dias, ou até um ano em algumas contas.

**Funciona com exportação em português ou outro idioma?**
Sim. O parser lê as planilhas por posição, então funciona em qualquer idioma de exportação. Foi testado com exportações em inglês e em português (Brasil).

**Por que o ranking de temas cobre só parte dos meus posts?**
O LinkedIn coloca as hashtags de um post na URL dele, e só posts que entraram nas listas de Top Posts (cerca de 50 cada) vêm na exportação. Veja as notas de design.

## Mais ferramentas para criadores do mesmo autor

- [**github-wrapped**](https://github.com/obrenoalvim/github-wrapped): um poster estilo Spotify Wrapped para o seu ano no GitHub.
- [**youtube-live-analyzer**](https://github.com/obrenoalvim/youtube-live-analyzer): lê o chat de lives do YouTube e mostra os assuntos discutidos.
- [**spoti-paper**](https://github.com/obrenoalvim/spoti-paper): cria wallpapers a partir das suas músicas favoritas do Spotify.

## Contribuindo

Achou um bug ou uma exportação que quebra o parser? Abra uma issue ou um PR. Veja o [CONTRIBUTING.md](CONTRIBUTING.md) e o [changelog](CHANGELOG.md).

## Licença

[MIT](LICENSE)

---

<div align="center">

Se isso te mostrou o melhor dia para postar, uma ⭐ ajuda outras pessoas que criam conteúdo a encontrar o projeto.

<sub>**Tópicos:** linkedin · linkedin-analytics · content-analytics · creator-tools · dashboard · data-visualization · privacy · client-side · react · recharts · xlsx</sub>

</div>
