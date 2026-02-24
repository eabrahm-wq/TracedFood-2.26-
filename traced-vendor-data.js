/**
 * traced-vendor-data.js  v1.0  —  February 2026
 * ─────────────────────────────────────────────────────────────────────
 * Single source of truth for all Traced local discovery vendor cards.
 *
 * USAGE (homepage / local discovery pages):
 *   <script src="traced-vendor-data.js"></script>
 *   <script>
 *     renderVendorCards(TRACED_VENDORS, container, options);
 *   </script>
 *
 * DATA MODEL per vendor object:
 *   id          {string}   URL slug — e.g. 'dandelion' → vendor-dandelion.html
 *   name        {string}   Display name
 *   type        {string}   'maker' | 'market' | 'shop' | 'csa'
 *   city        {string}   'sf' | 'oc'  — matches data-city filter
 *   distance    {string}   Human-readable distance string
 *   address     {string}   Street address for display
 *   hours       {string}   Hours summary
 *   meta        {string}   One-line descriptor shown on card
 *   profileUrl  {string}   Full profile page URL
 *   note        {string}   Default Traced note (no ?from= param)
 *   notes       {object}   Keyed by investigation slug → contextual note text
 *   badges      {Array}    [{text, type}]  type: 'g'=teal, 'a'=gold, ''=default
 *   tags        {Array}    Keyword strings for search/filter
 *   verified    {string}   ISO date of last Traced editorial verification
 *   score       {number}   Internal sort weight (1–5, 5=highest)
 *
 * INVESTIGATION ROUTING:
 *   When a vendor card is rendered after arriving from an investigation
 *   (via ?from=slug query param), the contextual note from vendor.notes[slug]
 *   is used instead of vendor.note. The profile link also appends ?from=slug
 *   so the full profile page loads the same contextual note.
 *
 * LAST VERIFIED:
 *   Every vendor has a verified date. The renderVendorCards function
 *   automatically appends a "Last verified: [date]" line to each card.
 *   Cards with verified dates older than 180 days show a yellow "Needs review"
 *   indicator. This makes staleness visible rather than invisible.
 */

var TRACED_VENDORS = {

  sf: [
    {
      id: 'dandelion',
      name: 'Dandelion Chocolate',
      type: 'maker',
      city: 'sf',
      distance: '1.4 mi',
      address: '740 Valencia St, Mission District',
      hours: 'Daily 10am–9pm (Fri–Sat until 10pm)',
      meta: 'Bean-to-bar chocolate · Factory + Café open to public',
      profileUrl: 'vendor-dandelion.html',
      note: 'Farm names, harvest dates, and prices paid to farmers published for every origin. Two ingredients only: cacao + cane sugar. No PGPR, no compound coating, no commodity sourcing. The structural answer to ingredient substitution documented in Traced’s chocolate investigations.',
      notes: {
        'reeses-hershey': 'You just read about PGPR replacing cocoa butter and compound coatings replacing milk chocolate in Reese’s line extensions. Dandelion’s two-ingredient model makes that substitution physically impossible. Farm names and prices paid published. Structurally the opposite of Hershey.',
        'chocolate-index': 'Highest-scoring maker in the Chocolate Index on sourcing transparency. Represents what full origin disclosure looks like vs. what conglomerate brands actually publish.',
        'annies': 'Dandelion is the contrast case for the Annie’s story applied to food: 14-year independent history, no acquisition event, no ownership change, no incentive drift.'
      },
      badges: [
        {text: 'Bean-to-bar', type: 'g'},
        {text: 'SF-founded 2010', type: ''},
        {text: 'Factory tours open', type: ''}
      ],
      tags: ['chocolate', 'bean-to-bar', 'cacao', 'maker', 'independent', 'sourcing'],
      verified: '2026-02-01',
      score: 5
    },

    {
      id: 'birite',
      name: 'Bi-Rite Market',
      type: 'shop',
      city: 'sf',
      distance: '1.6 mi',
      address: '3639 18th St, Mission District',
      hours: 'Daily 9am–9pm',
      meta: 'Independent grocery · B Corp certified · Family-owned since 1964',
      profileUrl: 'vendor-birite.html',
      note: 'Family-owned since 1964, B Corp certified, staff curate every shelf by sourcing and ownership standard. Carries independent alternatives across categories Traced has investigated: ice cream (vs. Wells Enterprises Halo Top), chocolate (vs. Hershey), pasta (vs. General Mills Annie’s), supplements (vs. Nestlé Health Science).',
      notes: {
        'halotop': 'Bi-Rite’s ice cream aisle is the local answer to the Halo Top story. They carry Bi-Rite Creamery (their own) and Salt & Straw (independently-owned) — not Wells Enterprises brands. The shelf is the editorial judgment made visible.',
        'annies': 'B Corp certified, family-owned. Staff curate independent pasta brands. Every product was chosen by a person with a name, not an acquisition thesis. The sourcing philosophy is the structural opposite of what General Mills brought to Annie’s.',
        'vital-proteins': 'Bi-Rite evaluates supplements by sourcing standard rather than shelf deal. Vital Proteins (Nestlé Health Science) is not on their supplement shelf. Independent brands with published COAs preferred.',
        'reeses-hershey': 'Carries Dandelion, TCHO, and other bean-to-bar brands. No Hershey family products per curation policy. The chocolate aisle here is the local answer to what we documented in the Reese’s investigation.'
      },
      badges: [
        {text: 'B Corp', type: 'a'},
        {text: 'Family-owned', type: 'g'},
        {text: 'Since 1964', type: ''}
      ],
      tags: ['shop', 'grocery', 'ice cream', 'pasta', 'chocolate', 'independent', 'b-corp'],
      verified: '2026-02-10',
      score: 4
    },

    {
      id: 'pasta-supply',
      name: 'Pasta Supply Co.',
      type: 'maker',
      city: 'sf',
      distance: '1.1 mi',
      address: 'Mission District, SF',
      hours: 'Thu–Sun 11am–5pm',
      meta: 'Fresh pasta studio · Small batch · Regional grain sourcing',
      profileUrl: 'vendor-pasta-supply.html',
      note: 'Founder-operated fresh pasta studio, no outside investors, regional semolina from named mills. The direct local alternative to Annie’s pasta, which has been a General Mills brand since 2014. The sourcing is transparent because the person making the pasta chose the flour.',
      notes: {
        'annies': 'Annie’s was acquired by General Mills for $820M in 2014. Pasta Supply Co. is what independent pasta production looks like in 2026: founder-controlled, no acquisition track, regional grain you can verify at the mill level. You can ask the maker directly where the flour came from.',
        'chocolate-index': 'Same sourcing transparency standard Traced looks for across all food producers — Pasta Supply demonstrates it in a non-chocolate category.'
      },
      badges: [
        {text: 'Specialty maker', type: 'g'},
        {text: 'Founder-operated', type: ''},
        {text: 'Regional grains', type: ''}
      ],
      tags: ['pasta', 'maker', 'fresh pasta', 'regional', 'independent'],
      verified: '2026-01-20',
      score: 4
    },

    {
      id: 'ferry-plaza',
      name: 'Ferry Plaza Farmers Market',
      type: 'market',
      city: 'sf',
      distance: '0.8 mi',
      address: 'The Embarcadero at Market St',
      hours: 'Tue + Thu 10am–2pm · Sat 8am–2pm',
      meta: 'Flagship SF market · 100+ producers · CUESA-operated',
      profileUrl: 'vendor-ferry-plaza.html',
      note: '100+ producers where every vendor sells what they personally grow or make. No resellers permitted. Multiple direct-trade cacao vendors, independent cheesemakers, and regional grain farmers. Operated by CUESA, a non-profit. EBT accepted.',
      notes: {
        'reeses-hershey': 'Multiple direct-trade cacao and chocolate vendors here can tell you exactly which farm their cacao came from. The exact opposite of Hershey’s commodity sourcing model. You can ask the vendor at the table.',
        'annies': 'Several vendors sell locally-made pasta from regional grains. Zero General Mills supply chain involvement. The "homegrown" claim is literal here.',
        'rxbar': 'Independent protein snack and nut vendors. No Kellogg’s distribution chain. Direct from producer to you.'
      },
      badges: [
        {text: 'CUESA-operated', type: ''},
        {text: 'EBT accepted', type: 'g'},
        {text: 'Year-round', type: ''}
      ],
      tags: ['market', 'produce', 'farmers market', 'chocolate', 'pasta', 'nuts'],
      verified: '2026-01-15',
      score: 5
    },

    {
      id: 'rainbow',
      name: 'Rainbow Grocery Co-op',
      type: 'csa',
      city: 'sf',
      distance: '1.9 mi',
      address: '1745 Folsom St, Mission District',
      hours: 'Daily 9am–9pm',
      meta: 'Worker co-op · Collectively owned · No investor extraction since 1975',
      profileUrl: 'vendor-rainbow.html',
      note: 'Worker-owned since 1975. No private equity, no acquisition risk, no investor extraction. Decision-making is collective — structurally immune to the ownership changes Traced documents in Annie’s, Halo Top, and RXBar. Every product carries the implicit endorsement of a worker who voted to stock it.',
      notes: {
        'annies': 'Worker-owned. Structurally immune to acquisition. Staff curate by sourcing standard and worker vote, not by General Mills distribution agreements.',
        'halotop': 'No PE-owned wellness brands per collective sourcing policy. The ice cream and supplement shelves here are curated by workers, not executives optimizing for post-acquisition EBITDA.',
        'rxbar': 'Kellogg’s acquired RXBar for $600M in 2017. Rainbow Grocery curates protein bars by founder ownership and ingredient integrity, not brand recognition.',
        'vital-proteins': 'Nestlé Health Science brands are not carried per collective buying policy. Workers choose independently-owned wellness brands.'
      },
      badges: [
        {text: 'Worker-owned', type: 'g'},
        {text: 'Co-op since 1975', type: 'a'},
        {text: 'No PE', type: ''}
      ],
      tags: ['co-op', 'worker-owned', 'grocery', 'supplements', 'pasta', 'independent'],
      verified: '2026-01-28',
      score: 4
    }
  ],

  oc: [
    {
      id: 'oc-farmers-market',
      name: 'Irvine Farmers Market',
      type: 'market',
      city: 'oc',
      distance: '2.1 mi',
      address: 'Irvine Spectrum, Irvine',
      hours: 'Sat 8am–1pm',
      meta: 'Weekly market · 50+ local vendors',
      profileUrl: 'vendor-oc-farmers-market.html',
      note: 'Southern California’s weekly producer market. Several direct-trade vendors. Independent alternatives to the mass-distributed brands Traced has investigated, including local chocolate makers and independent snack producers.',
      notes: {
        'reeses-hershey': 'Several local chocolate vendors operate here with farm-level cacao sourcing. Direct-trade origin transparency the Hershey supply chain does not offer.',
        'annies': 'Multiple produce and grain vendors. Fresh pasta makers at rotating market positions. Zero General Mills affiliation.'
      },
      badges: [
        {text: 'Year-round', type: ''},
        {text: 'EBT accepted', type: 'g'},
        {text: '50+ vendors', type: ''}
      ],
      tags: ['market', 'produce', 'oc', 'irvine', 'farmers market'],
      verified: '2026-01-10',
      score: 4
    },

    {
      id: 'oc-chocolate-grove',
      name: 'Chocolate Grove',
      type: 'maker',
      city: 'oc',
      distance: '3.4 mi',
      address: 'Laguna Beach, OC',
      hours: 'Wed–Sun 11am–6pm',
      meta: 'Small-batch bean-to-bar · OC’s only local chocolate maker',
      profileUrl: 'vendor-chocolate-grove.html',
      note: 'OC’s only verified bean-to-bar chocolate maker. Direct sourcing from cacao farms in Ecuador and Peru, farm names published. Two-to-four ingredient model. No PGPR, no compound coating. Independent alternative to every conglomerate-owned chocolate brand Traced has documented.',
      notes: {
        'reeses-hershey': 'Bean-to-bar with direct farm sourcing — the OC equivalent of what Dandelion represents in SF. Farm names, harvest dates published. No emulsifier substitution possible with a two-ingredient model.',
        'chocolate-index': 'Highest sourcing transparency score among OC chocolate producers in Traced’s index. Same standard as Dandelion, different geography.'
      },
      badges: [
        {text: 'Bean-to-bar', type: 'g'},
        {text: 'OC-founded', type: ''},
        {text: 'Direct trade', type: ''}
      ],
      tags: ['chocolate', 'bean-to-bar', 'oc', 'laguna', 'maker', 'independent'],
      verified: '2026-01-18',
      score: 4
    }
  ]

};


/**
 * renderVendorCards(vendors, container, options)
 * ─────────────────────────────────────────────
 * Renders vendor cards into `container` (HTMLElement).
 * Reads ?from= and ?category= query params automatically.
 *
 * options:
 *   city      {string}   'sf' | 'oc' | 'all'  (default: 'all')
 *   type      {string}   'maker' | 'market' | 'shop' | 'csa' | 'all'
 *   from      {string}   investigation slug (overrides URL param)
 *   maxCards  {number}   max cards to render (default: all)
 */
function renderVendorCards(vendorData, container, options) {
  options = options || {};
  var sp = new URLSearchParams(window.location.search);
  var fromSlug = options.from || sp.get('from') || '';
  var cityFilter = options.city || sp.get('city') || 'all';
  var typeFilter = options.type || sp.get('category') || 'all';

  // flatten all vendors
  var all = [];
  var cities = Object.keys(vendorData);
  for (var ci = 0; ci < cities.length; ci++) {
    var city = cities[ci];
    var arr = vendorData[city];
    for (var vi = 0; vi < arr.length; vi++) {
      all.push(arr[vi]);
    }
  }

  // filter
  var filtered = all.filter(function(v) {
    var cityOk = (cityFilter === 'all' || v.city === cityFilter);
    var typeOk = (typeFilter === 'all' || v.type === typeFilter || v.tags.indexOf(typeFilter) !== -1);
    return cityOk && typeOk;
  });

  // sort by score desc
  filtered.sort(function(a, b) { return b.score - a.score; });

  if (options.maxCards) {
    filtered = filtered.slice(0, options.maxCards);
  }

  // staleness threshold: 180 days
  var now = new Date();
  var STALE_MS = 180 * 24 * 60 * 60 * 1000;

  container.innerHTML = '';

  filtered.forEach(function(v) {
    var note = (fromSlug && v.notes && v.notes[fromSlug]) ? v.notes[fromSlug] : v.note;
    var profileHref = v.profileUrl + (fromSlug ? '?from=' + fromSlug : '');

    // staleness check
    var verifiedDate = new Date(v.verified);
    var isStale = (now - verifiedDate) > STALE_MS;
    var verifiedLabel = isStale
      ? '<span style="color:#b07a00;font-weight:700">⚠ Needs review — ' + v.verified + '</span>'
      : '<span style="color:#9a948b">' + v.verified + '</span>';

    var badgesHtml = '';
    v.badges.forEach(function(b) {
      badgesHtml += '<span class="badge' + (b.type ? ' ' + b.type : '') + '">' + b.text + '</span>';
    });

    var card = document.createElement('a');
    card.href = profileHref;
    card.className = 'v-card';
    card.setAttribute('data-city', v.city);
    card.setAttribute('data-type', v.type);
    card.innerHTML =
      '<div class="v-top">'
      + '<div class="v-name">' + v.name + '</div>'
      + '<div class="v-dist">' + v.distance + '</div>'
      + '</div>'
      + '<div class="v-meta">' + v.address + ' · ' + v.hours + '</div>'
      + '<div class="v-why"><strong>Traced note:</strong> ' + note + '</div>'
      + '<div class="v-badges">' + badgesHtml + '</div>'
      + '<div class="v-actions">'
      + '<span class="v-btn">View profile →</span>'
      + '<span style="font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.10em;text-transform:uppercase;color:var(--dim);padding:8px 0;margin-left:auto">'
      + 'Verified: ' + verifiedLabel
      + '</span>'
      + '</div>';
    container.appendChild(card);
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="v-empty" style="display:block">No vendors match the current filter. <a href="index.html#local" style="color:var(--accent)">Clear filters →</a></div>';
  }
}
