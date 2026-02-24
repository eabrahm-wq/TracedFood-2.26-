/**
 * traced-share-card.js  v1.0  —  February 2026
 * ─────────────────────────────────────────────────────────────────────
 * Drop-in share card system for Traced investigation pages.
 *
 * USAGE — add to any investigation page before </body>:
 *   <script src="traced-share-card.js"></script>
 *
 * The script reads from the page's existing DOM:
 *   - .product-name or <h1>           → brand name
 *   - .hero-category                  → category label
 *   - .score-count.red/yellow/green   → score dot counts
 *   - .score-pill or .score-row       → dimension names + colors
 *   - data-share-fact attribute       → key shareable fact (set on <body> or .hero)
 *   - data-share-owner                → owner name
 *   - data-share-year                 → acquisition/key year
 *   - data-share-url                  → canonical URL (falls back to window.location)
 *
 * If data-share-fact is not set, falls back to the first .verdict-text paragraph.
 *
 * INJECTS:
 *   - A floating "Share" button (bottom-right)
 *   - A fullscreen overlay with the rendered share card
 *   - Copy text button for plain-text version
 *   - Screenshot prompt (card is screenshot-optimized at 600x380)
 */

(function() {
  'use strict';

  // ── 1. EXTRACT DATA FROM PAGE ─────────────────────────────────────

  function getData() {
    var body = document.body;

    var brand = '';
    var brandEl = document.querySelector('.product-name') || document.querySelector('h1');
    if (brandEl) brand = brandEl.textContent.trim().replace(/\s+/g, ' ');

    var cat = '';
    var catEl = document.querySelector('.hero-category');
    if (catEl) cat = catEl.textContent.trim();

    // score counts — read from DOM
    var reds = 0, yellows = 0, greens = 0;
    document.querySelectorAll('.score-count.red').forEach(function(el) {
      var m = el.textContent.match(/\d+/);
      if (m) reds = parseInt(m[0]);
    });
    document.querySelectorAll('.score-count.yellow').forEach(function(el) {
      var m = el.textContent.match(/\d+/);
      if (m) yellows = parseInt(m[0]);
    });
    document.querySelectorAll('.score-count.green').forEach(function(el) {
      var m = el.textContent.match(/\d+/);
      if (m) greens = parseInt(m[0]);
    });

    // overall zone
    var zone = 'yellow';
    if (greens >= 5) zone = 'green';
    else if (reds >= 3) zone = 'red';

    // dimension names + scores (up to 7)
    var dims = [];
    document.querySelectorAll('.score-row').forEach(function(row) {
      var nameEl = row.querySelector('.score-dim');
      var pillEl = row.querySelector('.score-pill');
      if (nameEl && pillEl) {
        var color = 'yellow';
        if (pillEl.classList.contains('red') || pillEl.textContent.trim() === 'Red') color = 'red';
        else if (pillEl.classList.contains('green') || pillEl.textContent.trim() === 'Green') color = 'green';
        dims.push({ name: nameEl.textContent.trim(), color: color });
      }
    });

    // key fact — prefer data attribute, fallback to verdict text
    var fact = body.getAttribute('data-share-fact') || '';
    if (!fact) {
      var verdictEl = document.querySelector('.verdict-text');
      if (verdictEl) {
        fact = verdictEl.textContent.trim().replace(/\s+/g, ' ').substring(0, 200);
        // trim to sentence
        var period = fact.indexOf('. ', 80);
        if (period > 0) fact = fact.substring(0, period + 1);
      }
    }

    var owner = body.getAttribute('data-share-owner') || '';
    var year = body.getAttribute('data-share-year') || '';
    var url = body.getAttribute('data-share-url') || window.location.href.split('?')[0];
    // clean up url for display
    var displayUrl = url.replace('https://', '').replace('http://', '');

    return { brand, cat, zone, reds, yellows, greens, dims, fact, owner, year, url, displayUrl };
  }

  // ── 2. ZONE COLORS ────────────────────────────────────────────────

  var ZONE_COLORS = {
    red:    { primary: '#D94F3D', dim: 'rgba(217,79,61,.12)', border: 'rgba(217,79,61,.30)' },
    yellow: { primary: '#D4A84B', dim: 'rgba(212,168,75,.12)', border: 'rgba(212,168,75,.30)' },
    green:  { primary: '#4E9B6F', dim: 'rgba(78,155,111,.12)', border: 'rgba(78,155,111,.30)' }
  };

  var DIM_COLORS = {
    red:    '#D94F3D',
    yellow: '#D4A84B',
    green:  '#4E9B6F'
  };

  // ── 3. RENDER CARD HTML ───────────────────────────────────────────

  function buildCardHTML(d) {
    var zc = ZONE_COLORS[d.zone];

    // score bar — 7 segments
    var segHtml = '';
    for (var i = 0; i < d.dims.length; i++) {
      segHtml += '<div style="flex:1;height:100%;background:' + DIM_COLORS[d.dims[i].color] + ';opacity:.85"></div>';
      if (i < d.dims.length - 1) {
        segHtml += '<div style="width:2px;height:100%;background:#080808"></div>';
      }
    }

    // dim pills — max 7, abbreviated to fit
    var pillsHtml = '';
    for (var j = 0; j < d.dims.length && j < 7; j++) {
      var dim = d.dims[j];
      pillsHtml += '<span style="'
        + 'display:inline-flex;align-items:center;gap:4px;'
        + 'font-family:"DM Mono",monospace;font-size:8px;letter-spacing:.10em;text-transform:uppercase;'
        + 'padding:3px 7px;border:1px solid ' + ZONE_COLORS[dim.color].border + ';'
        + 'color:' + DIM_COLORS[dim.color] + ';background:' + ZONE_COLORS[dim.color].dim + ';'
        + 'white-space:nowrap;overflow:hidden;max-width:120px;'
        + '">'
        + '<span style="width:4px;height:4px;border-radius:50%;background:' + DIM_COLORS[dim.color] + ';flex-shrink:0"></span>'
        + dim.name
        + '</span>';
    }

    // score dots row
    var dotScore = '';
    if (d.reds)    dotScore += '<span style="color:#D94F3D;font-family:monospace;font-size:11px;font-weight:500">' + d.reds + ' Red</span>';
    if (d.yellows) dotScore += (dotScore?'<span style="color:#4a4642;margin:0 5px">&middot;</span>':'') + '<span style="color:#D4A84B;font-family:monospace;font-size:11px;font-weight:500">' + d.yellows + ' Yellow</span>';
    if (d.greens)  dotScore += (dotScore?'<span style="color:#4a4642;margin:0 5px">&middot;</span>':'') + '<span style="color:#4E9B6F;font-family:monospace;font-size:11px;font-weight:500">' + d.greens + ' Green</span>';

    // zone label
    var zoneLabel = d.zone.charAt(0).toUpperCase() + d.zone.slice(1) + ' Zone';

    var html = ''
      + '<div id="tsc-card" style="'
      + 'width:620px;max-width:100%;'
      + 'background:#080808;'
      + 'border:1px solid ' + zc.border + ';'
      + 'font-family:"DM Sans","DM Mono",system-ui,sans-serif;'
      + 'position:relative;overflow:hidden;'
      + 'box-shadow:0 24px 60px rgba(0,0,0,.6);'
      + '">'

      // top accent bar — full width, zone color
      + '<div style="height:3px;background:linear-gradient(90deg,' + zc.primary + ',transparent);width:100%"></div>'

      // header row
      + '<div style="padding:22px 26px 18px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(255,255,255,.07);">'
        + '<div>'
          + '<div style="font-family:monospace;font-size:8.5px;letter-spacing:.20em;text-transform:uppercase;color:#4a4642;margin-bottom:6px">'
            + 'TRACED' + (d.cat ? ' &mdash; ' + d.cat : '')
          + '</div>'
          + '<div style="font-family:Georgia,serif;font-size:28px;font-weight:900;line-height:1;letter-spacing:-.02em;color:#e8e4dc">' + d.brand + '</div>'
          + (d.owner ? '<div style="font-size:11px;color:#4a4642;margin-top:5px;font-family:monospace;letter-spacing:.08em">' + d.owner + (d.year ? ' &mdash; ' + d.year : '') + '</div>' : '')
        + '</div>'
        + '<div style="text-align:right;flex-shrink:0">'
          + '<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:' + zc.dim + ';border:1px solid ' + zc.border + ';">'
            + '<span style="width:7px;height:7px;border-radius:50%;background:' + zc.primary + ';flex-shrink:0"></span>'
            + '<span style="font-family:monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:' + zc.primary + '">' + zoneLabel + '</span>'
          + '</div>'
          + '<div style="margin-top:8px;font-size:11px;color:#7a7570">' + dotScore + '</div>'
        + '</div>'
      + '</div>'

      // key fact
      + '<div style="padding:20px 26px;border-bottom:1px solid rgba(255,255,255,.07);">'
        + '<div style="font-family:Georgia,serif;font-size:15px;font-weight:700;line-height:1.45;color:#e8e4dc;">'
          + '\u201c' + d.fact + '\u201d'
        + '</div>'
      + '</div>'

      // score bar + dim pills
      + '<div style="padding:16px 26px 18px;">'
        + '<div style="font-family:monospace;font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:#4a4642;margin-bottom:8px">7-Dimension Score</div>'
        + '<div style="display:flex;height:6px;border-radius:0;overflow:hidden;gap:0;margin-bottom:10px;background:rgba(255,255,255,.04)">' + segHtml + '</div>'
        + '<div style="display:flex;gap:5px;flex-wrap:wrap">' + pillsHtml + '</div>'
      + '</div>'

      // footer
      + '<div style="padding:12px 26px;background:rgba(255,255,255,.03);border-top:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:space-between;">'
        + '<span style="font-family:monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#C9A84C">TRACED</span>'
        + '<span style="font-family:monospace;font-size:9px;letter-spacing:.06em;color:#4a4642">' + d.displayUrl + '</span>'
      + '</div>'

      + '</div>';

    return html;
  }

  // ── 4. PLAIN TEXT VERSION ─────────────────────────────────────────

  function buildPlainText(d) {
    var score = [];
    if (d.reds) score.push(d.reds + 'R');
    if (d.yellows) score.push(d.yellows + 'Y');
    if (d.greens) score.push(d.greens + 'G');
    var scoreStr = score.join(' \u00b7 ');

    var lines = [
      d.brand + (d.owner ? ' \u2014 ' + d.owner + (d.year ? ', ' + d.year : '') : ''),
      d.zone.toUpperCase() + ' ZONE' + (scoreStr ? ' (' + scoreStr + ')' : ''),
      '',
      d.fact,
      '',
      'Full investigation: ' + d.url,
      'Scoring methodology: https://traced.com/traced-methodology.html'
    ];
    return lines.join('\n');
  }

  // ── 5. INJECT STYLES ─────────────────────────────────────────────

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '#tsc-trigger{',
        'position:fixed;bottom:28px;right:28px;z-index:900;',
        'display:flex;align-items:center;gap:8px;',
        'padding:11px 18px;',
        'background:#C9A84C;color:#080808;',
        'border:none;border-radius:0;',
        'font-family:"DM Mono",monospace;font-size:10px;',
        'letter-spacing:.16em;text-transform:uppercase;font-weight:500;',
        'cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.5);',
        'transition:opacity .15s,transform .15s;',
      '}',
      '#tsc-trigger:hover{opacity:.88;transform:translateY(-1px)}',
      '#tsc-trigger svg{width:14px;height:14px;fill:none;stroke:#080808;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',

      '#tsc-overlay{',
        'position:fixed;inset:0;z-index:1000;',
        'background:rgba(0,0,0,.88);backdrop-filter:blur(12px);',
        'display:none;align-items:center;justify-content:center;',
        'padding:20px;',
      '}',
      '#tsc-overlay.open{display:flex}',

      '#tsc-modal{',
        'max-width:680px;width:100%;',
        'display:flex;flex-direction:column;gap:16px;',
      '}',

      '#tsc-actions{',
        'display:flex;gap:8px;flex-wrap:wrap;align-items:center;',
      '}',

      '.tsc-btn{',
        'display:inline-flex;align-items:center;gap:7px;',
        'padding:10px 16px;',
        'font-family:"DM Mono",monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:500;',
        'border:1px solid rgba(255,255,255,.15);',
        'background:rgba(255,255,255,.06);color:#e8e4dc;',
        'cursor:pointer;transition:all .15s;',
      '}',
      '.tsc-btn:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.3)}',
      '.tsc-btn.primary{background:#C9A84C;border-color:#C9A84C;color:#080808}',
      '.tsc-btn.primary:hover{opacity:.88}',
      '.tsc-btn.copied{background:rgba(78,155,111,.2);border-color:rgba(78,155,111,.5);color:#4E9B6F}',

      '#tsc-hint{',
        'font-family:"DM Mono",monospace;font-size:9px;letter-spacing:.12em;',
        'text-transform:uppercase;color:#4a4642;',
        'margin-left:auto;',
      '}',

      '#tsc-close-row{display:flex;justify-content:flex-end}',
      '#tsc-close{',
        'background:none;border:none;color:#4a4642;cursor:pointer;',
        'font-family:"DM Mono",monospace;font-size:9px;letter-spacing:.14em;',
        'text-transform:uppercase;padding:4px;transition:color .15s;',
      '}',
      '#tsc-close:hover{color:#e8e4dc}',

      '@media(max-width:640px){',
        '#tsc-trigger{bottom:16px;right:16px;padding:10px 14px}',
        '#tsc-modal{gap:12px}',
        '#tsc-hint{display:none}',
      '}'
    ].join('');
    document.head.appendChild(style);
  }

  // ── 6. BUILD UI ───────────────────────────────────────────────────

  function buildUI(d) {
    // floating trigger button
    var trigger = document.createElement('button');
    trigger.id = 'tsc-trigger';
    trigger.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share card';
    document.body.appendChild(trigger);

    // overlay
    var overlay = document.createElement('div');
    overlay.id = 'tsc-overlay';
    overlay.innerHTML = ''
      + '<div id="tsc-modal">'
        + '<div id="tsc-close-row"><button id="tsc-close">Close &times;</button></div>'
        + buildCardHTML(d)
        + '<div id="tsc-actions">'
          + '<button class="tsc-btn primary" id="tsc-copy-text">Copy text snapshot</button>'
          + '<button class="tsc-btn" id="tsc-copy-url">Copy URL</button>'
          + '<a href="' + d.url + '" class="tsc-btn" style="text-decoration:none">Open full investigation &rarr;</a>'
          + '<span id="tsc-hint">Screenshot this card to share as image</span>'
        + '</div>'
      + '</div>';
    document.body.appendChild(overlay);

    // events
    trigger.addEventListener('click', function() {
      overlay.classList.add('open');
    });

    document.getElementById('tsc-close').addEventListener('click', function() {
      overlay.classList.remove('open');
    });

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    document.getElementById('tsc-copy-text').addEventListener('click', function() {
      var btn = this;
      navigator.clipboard.writeText(buildPlainText(d)).then(function() {
        btn.textContent = 'Copied \u2713';
        btn.classList.add('copied');
        btn.classList.remove('primary');
        setTimeout(function() {
          btn.textContent = 'Copy text snapshot';
          btn.classList.remove('copied');
          btn.classList.add('primary');
        }, 2400);
      });
    });

    document.getElementById('tsc-copy-url').addEventListener('click', function() {
      var btn = this;
      navigator.clipboard.writeText(d.url).then(function() {
        btn.textContent = 'Copied \u2713';
        btn.classList.add('copied');
        setTimeout(function() {
          btn.textContent = 'Copy URL';
          btn.classList.remove('copied');
        }, 2400);
      });
    });

    // escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') overlay.classList.remove('open');
    });
  }

  // ── 7. INIT ───────────────────────────────────────────────────────

  function init() {
    var d = getData();
    if (!d.brand) return; // not an investigation page, bail
    injectStyles();
    buildUI(d);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
