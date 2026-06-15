(() => {
  /* ── Referências ──────────────────────────────────────────────────────── */
  const root       = htmlNode.querySelector('#tl-root');
  const feed       = htmlNode.querySelector('#tl-feed');
  const empty      = htmlNode.querySelector('#tl-empty');
  const subEl      = htmlNode.querySelector('#tl-sub');
  const filterEl   = htmlNode.querySelector('#tl-filter');
  const btnClear   = htmlNode.querySelector('#tl-clear');
  const cntOk      = htmlNode.querySelector('#tl-cnt-ok');
  const cntDown    = htmlNode.querySelector('#tl-cnt-down');
  const footerInfo = htmlNode.querySelector('#tl-footer-info');
  const footerTs   = htmlNode.querySelector('#tl-footer-ts');

  /* ── Tema automático ──────────────────────────────────────────────────── */
  root.dataset.theme = htmlGraphics?.theme?.isDark ? 'dark' : 'light';

  /* ── Estado persistente ───────────────────────────────────────────────── */
  const KEY = '__tl_svc_state__';
  const S = window[KEY] ||= { q: '' };

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const isNil = v =>
    v === null || v === undefined || v === '' ||
    (typeof v === 'number' && !isFinite(v));

  const asNum = v => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return isFinite(n) ? n : null;
  };

  const asStr = v => isNil(v) ? '' : String(v);

  const getVal = (field, i) => {
    const vals = field?.values;
    if (!vals) return null;
    return typeof vals.get === 'function' ? vals.get(i) : vals[i];
  };

  /* ── Leitura de dados ─────────────────────────────────────────────────── */
  const toRows = () => {
    const series = htmlGraphics?.data?.series;
    if (!series?.length) return [];

    const df     = series[0];
    const fields = df.fields || [];
    const idx    = Object.fromEntries(fields.map((f, i) => [f.name, i]));
    const n      = fields[0]?.values?.length ?? 0;
    const need   = ['Servidor', 'Status', 'Uptime'];
    const out    = [];

    for (let i = 0; i < n; i++) {
      const row = {};
      for (const col of need) {
        const f = fields[idx[col]];
        row[col] = f ? getVal(f, i) : null;
      }
      out.push(row);
    }
    return out;
  };

  /* ── Formatações ──────────────────────────────────────────────────────── */
  const isUp = raw => asNum(raw) === 1;

  const formatUptime = raw => {
    const s0 = asNum(raw);
    if (s0 === null || s0 < 0) return '—';
    let s = Math.floor(s0);
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600);  s -= h * 3600;
    const m = Math.floor(s / 60);
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h || d) parts.push(`${h}h`);
    parts.push(`${m}m`);
    return parts.join(' ');
  };

  // Data estimada de início = agora − uptime
  const sinceDate = raw => {
    const s0 = asNum(raw);
    if (s0 === null || s0 < 0) return '—';
    const since = new Date(Date.now() - s0 * 1000);
    return since.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit'
    }) + ' ' + since.toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit'
    });
  };

  /* ── Render ───────────────────────────────────────────────────────────── */
  const render = () => {
    root.dataset.theme = htmlGraphics?.theme?.isDark ? 'dark' : 'light';

    let rows = toRows();
    const now = new Date();
    const ts  = now.toLocaleString('pt-BR');

    if (!rows.length) {
      empty.style.display = 'block';
      feed.querySelectorAll('.tl-item').forEach(r => r.remove());
      subEl.textContent = 'Sem dados';
      cntOk.textContent   = '0 Online';
      cntDown.textContent = '0 Offline';
      return;
    }
    empty.style.display = 'none';

    // contagens totais (antes do filtro)
    let okCount = 0, downCount = 0;
    rows.forEach(r => { isUp(r.Status) ? okCount++ : downCount++; });

    cntOk.textContent   = `${okCount} Online`;
    cntDown.textContent = `${downCount} Offline`;

    // filtro (aplicado antes da máscara, sobre o alias já gerado abaixo)
    // ordenação: DOWN primeiro, depois UP; dentro de cada grupo por nome real
    rows.sort((a, b) => {
      const aUp = isUp(a.Status), bUp = isUp(b.Status);
      if (aUp !== bUp) return aUp ? 1 : -1; // DOWN vem antes
      return asStr(a.Servidor).localeCompare(asStr(b.Servidor), 'pt-BR', {
        numeric: true, sensitivity: 'base'
      });
    });

    // ── Mascara hostnames reais após ordenação final ──────────────────────
    // A numeração reflete a ordem visual exibida na tela.
    rows.forEach((row, i) => {
      row.Servidor = `SRV-LNX-${String(i + 1).padStart(2, '0')}`;
    });

    // filtro sobre os aliases
    if (S.q) {
      const q = S.q.toLowerCase();
      rows = rows.filter(r => asStr(r.Servidor).toLowerCase().includes(q));
    }

    // remove itens anteriores
    feed.querySelectorAll('.tl-item').forEach(r => r.remove());

    const total = rows.length;

    rows.forEach((row, idx) => {
      const up      = isUp(row.Status);
      const stKey   = up ? 'up' : 'down';
      const stLabel = up ? 'UP' : 'DOWN';
      const srv     = asStr(row.Servidor).replace(/[<>]/g, '');
      const uptime  = formatUptime(row.Uptime);
      const since   = sinceDate(row.Uptime);
      const isLast  = idx === total - 1;

      const item = document.createElement('div');
      item.className = `tl-item${!up ? ' is-down' : ''}`;
      item.innerHTML = `
        <div class="tl-timeline">
          <div class="tl-icon ${stKey}">
            <div class="tl-dot ${stKey}"></div>
          </div>
          ${!isLast ? '<div class="tl-line"></div>' : ''}
        </div>
        <div class="tl-content">
          <div class="tl-row1">
            <span class="tl-svc" title="${srv}">${srv}</span>
            <span class="tl-badge ${stKey}">${stLabel}</span>
          </div>
          <div class="tl-meta">
            <span>Uptime</span>
            <span class="tl-meta__sep">·</span>
            <span class="tl-uptime__val">${uptime}</span>
            <span class="tl-meta__sep">·</span>
            <span class="tl-since">desde ${since}</span>
          </div>
        </div>
      `;

      feed.appendChild(item);
    });

    // sub e footer
    subEl.textContent      = `${rows.length} hosts · ${ts}`;
    footerInfo.textContent = `Grafana HTML Graphics · Zabbix MySQL · ${rows.length} hosts`;
    footerTs.textContent   = ts;
  };

  /* ── Eventos ──────────────────────────────────────────────────────────── */
  if (!root.dataset.bound) {
    root.dataset.bound = '1';

    filterEl.addEventListener('input', () => {
      S.q = (filterEl.value || '').trim().toLowerCase();
      render();
    });

    btnClear.addEventListener('click', () => {
      S.q = '';
      filterEl.value = '';
      render();
    });
  }

  filterEl.value = S.q || '';

  /* ── Entry point ──────────────────────────────────────────────────────── */
  onRender = () => { try { render(); } catch(e) { console.error('[tl-svc]', e); } };
  try { render(); } catch(e) { console.error('[tl-svc]', e); }
})();
