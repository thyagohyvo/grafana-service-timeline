# 📡 Service Monitoring Timeline - Grafana HTML Graphics

Um painel de monitoramento de serviços em tempo real, construído com o plugin **Grafana HTML Graphics**, consumindo dados do **Zabbix via MySQL**. Exibe o status de hosts (UP/DOWN), uptime e data de início estimada em uma interface de timeline clean e responsiva.

---
<img width="1839" height="858" alt="image" src="https://github.com/user-attachments/assets/25654257-9f1b-442b-a722-f7ed7cecd5be" />

## ✨ Funcionalidades

- **Timeline visual** com indicadores de status (UP / DOWN)
- **Ordenação automática**: hosts offline aparecem primeiro
- **Filtro em tempo real** por nome do servidor
- **Tema automático** (claro/escuro) sincronizado com o Grafana
- **Contadores** de hosts online e offline no cabeçalho
- **Uptime formatado** (`Xd Xh Xm`) com data estimada de início do estado

---

## 🛠️ Tecnologias

| Camada       | Tecnologia                  |
|--------------|-----------------------------|
| Plataforma   | Grafana                     |
| Plugin       | HTML Graphics               |
| Fonte de dados | Zabbix → MySQL            |
| Tipografia   | IBM Plex Sans / IBM Plex Mono (Google Fonts) |

---

## 📁 Estrutura

```
.
├── panel.html      # Estrutura HTML do painel
├── script.js       # Lógica de renderização e eventos
└── styles.css      # Estilos (variáveis CSS, dark/light theme)
```

---

## ⚙️ Configuração

### Pré-requisitos

- Grafana com o plugin [HTML Graphics](https://grafana.com/grafana/plugins/gapit-htmlgraphics-panel/) instalado
- Fonte de dados Zabbix configurada via MySQL

### Query esperada

O painel espera um `DataFrame` com as seguintes colunas:

| Coluna    | Tipo    | Descrição                            |
|-----------|---------|--------------------------------------|
| `Servidor`| string  | Nome do host                         |
| `Status`  | number  | `1` = UP, `0` = DOWN                 |
| `Uptime`  | number  | Tempo em segundos desde o último boot|

### Instalação

1. No Grafana, adicione um novo painel e selecione o tipo **HTML Graphics**.
2. Cole o conteúdo de `panel.html` no campo **HTML**.
3. Cole o conteúdo de `styles.css` no campo **CSS**.
4. Cole o conteúdo de `script.js` no campo **JavaScript**.
5. Configure a fonte de dados MySQL com a query que retorna as colunas acima.
6. Salve o painel.

---

## 🎨 Temas

O painel detecta automaticamente o tema do Grafana (`htmlGraphics.theme.isDark`) e aplica variáveis CSS correspondentes. Não é necessária nenhuma configuração manual.

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
