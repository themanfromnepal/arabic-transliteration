#!/usr/bin/env python3
"""Replace the typography section in design.html"""
import os

file_path = os.path.join("docs", "design", "design.html")
content = open(file_path, encoding="utf-8").read()

start_marker = '    <section id="typography">'
end_marker = "    </section>"

start = content.index(start_marker)
end = content.index(end_marker, start + len(start_marker)) + len(end_marker)

print(f"Replacing chars {start}–{end}")

new_section = '''    <section id="typography">
      <h2>2. Typography</h2>
      <p>
        Two font families only: <strong>Inter</strong> (all UI and English text) and
        <strong>Scheherazade New</strong> (all Quranic Arabic text). Amiri is kept as a local backup
        but is not loaded by the app.
      </p>

      <!-- Font pairing table -->
      <h3>Font Pairing &amp; Loading Strategy</h3>
      <table style="width:100%;border-collapse:collapse;font-size:0.875rem;margin-bottom:var(--space-lg);">
        <thead>
          <tr style="background:var(--color-primary);color:#fff;">
            <th style="padding:8px 12px;text-align:left;">Family</th>
            <th style="padding:8px 12px;text-align:left;">Role</th>
            <th style="padding:8px 12px;text-align:left;">Format</th>
            <th style="padding:8px 12px;text-align:left;">font-display</th>
            <th style="padding:8px 12px;text-align:left;">Fallback stack</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid var(--color-border);"><strong>Inter</strong> (variable)</td>
            <td style="padding:8px 12px;border-bottom:1px solid var(--color-border);">UI, labels, English copy, metadata</td>
            <td style="padding:8px 12px;border-bottom:1px solid var(--color-border);">Variable TTF \u2192 woff2 (via next/font)</td>
            <td style="padding:8px 12px;border-bottom:1px solid var(--color-border);"><code>swap</code> \u2014 text always visible</td>
            <td style="padding:8px 12px;border-bottom:1px solid var(--color-border);">\u2018Segoe UI\u2019, Arial, sans-serif</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;"><strong>Scheherazade New</strong></td>
            <td style="padding:8px 12px;">Quranic Arabic display text</td>
            <td style="padding:8px 12px;">4 weights \u00b7 subsetted woff2</td>
            <td style="padding:8px 12px;"><code>optional</code> \u2014 no layout shift; fallback if slow</td>
            <td style="padding:8px 12px;">\u2018Amiri\u2019, serif</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size:var(--font-size-sm);color:var(--color-muted);">
        <strong>Why <code>optional</code> for Arabic?</strong> Quranic Arabic text is large (2\u20134rem). Loading it with <code>swap</code> would cause visible font swap flash on first load. <code>optional</code> shows fallback on first load and the correct font from cache on every subsequent visit \u2014 no layout shift ever.
      </p>
      <p style="font-size:var(--font-size-sm);color:var(--color-muted);">
        <strong>Why Scheherazade New?</strong> Purpose-built for Quranic Arabic \u2014 comprehensive diacritic (tashkeel/harakat) support, optimised for Uthmani script rendering. Cleaner single family (4 weights) vs Amiri. Better for a Quranic vocabulary app.
      </p>

      <!-- Subsetting -->
      <h3>Arabic Font Subsetting</h3>
      <p style="font-size:var(--font-size-sm);color:var(--color-muted);">
        Scheherazade New is subsetted using <code>pyftsubset</code> (fonttools) against the full Quranic Unicode range before shipping. Run once from the project root: <code>npm run subset-fonts</code>. Output: <code>public/fonts/Scheherazade_New/ScheherazadeNew-{weight}-quran-subset.woff2</code>.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;margin-bottom:var(--space-md);">
        <thead>
          <tr style="background:var(--color-surface-alt);">
            <th style="padding:6px 12px;text-align:left;">Unicode Block</th>
            <th style="padding:6px 12px;text-align:left;">Range</th>
            <th style="padding:6px 12px;text-align:left;">Contents</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);">Arabic</td><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);"><code>U+0600\u201306FF</code></td><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);">Core Arabic letters + diacritics</td></tr>
          <tr><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);">Arabic Supplement</td><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);"><code>U+0750\u2013077F</code></td><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);">Extended Arabic letters</td></tr>
          <tr><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);">Arabic Extended-A</td><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);"><code>U+08A0\u201308FF</code></td><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);">Quranic annotations</td></tr>
          <tr><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);">Arabic Presentation Forms-A</td><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);"><code>U+FB50\u2013FDFF</code></td><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);">Ligatures, positional forms</td></tr>
          <tr><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);">Arabic Presentation Forms-B</td><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);"><code>U+FE70\u2013FEFF</code></td><td style="padding:5px 12px;border-bottom:1px solid var(--color-border);">Positional forms</td></tr>
          <tr><td style="padding:5px 12px;">Arabic Mathematical / Rumi</td><td style="padding:5px 12px;"><code>U+10E60\u201310E7F</code></td><td style="padding:5px 12px;">Rumi numeral signs</td></tr>
        </tbody>
      </table>

      <!-- Type scale -->
      <h3>Type Scale</h3>
      <table style="width:100%;border-collapse:collapse;font-size:0.875rem;margin-bottom:var(--space-lg);">
        <thead>
          <tr style="background:var(--color-primary);color:#fff;">
            <th style="padding:8px 12px;text-align:left;">Token</th>
            <th style="padding:8px 12px;text-align:left;">Size</th>
            <th style="padding:8px 12px;text-align:left;">Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);"><code>--font-size-sm</code></td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">0.75rem</td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">Labels, metadata, captions</td></tr>
          <tr><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);"><code>--font-size-base</code></td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">1rem</td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">Body copy, inputs</td></tr>
          <tr><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);"><code>--font-size-lg</code></td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">1.25rem</td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">Subheadings, transliteration</td></tr>
          <tr><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);"><code>--font-size-xl</code></td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">1.5rem</td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">Section headings</td></tr>
          <tr><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);font-weight:600;color:var(--color-primary);">Arabic S</td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);font-weight:600;">1.75rem</td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">Arabic text \u2014 compact / small screens</td></tr>
          <tr><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);font-weight:600;color:var(--color-primary);">Arabic M \u2746 default</td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);font-weight:600;">2.25rem</td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">Arabic text \u2014 default</td></tr>
          <tr><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);font-weight:600;color:var(--color-primary);">Arabic L</td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);font-weight:600;">3rem</td><td style="padding:6px 12px;border-bottom:1px solid var(--color-border);">Arabic text \u2014 comfortable reading</td></tr>
          <tr><td style="padding:6px 12px;font-weight:600;color:var(--color-primary);">Arabic XL</td><td style="padding:6px 12px;font-weight:600;">3.75rem</td><td style="padding:6px 12px;">Arabic text \u2014 accessibility / large display</td></tr>
        </tbody>
      </table>

      <!-- FontSizeControl explanation -->
      <h3>FontSizeControl (S / M / L / XL)</h3>
      <p style="font-size:var(--font-size-sm);color:var(--color-muted);">
        Four buttons let the user resize Arabic text. Tapping a level changes <code>--font-size-arabic</code> on the <code>&lt;html&gt;</code> element. The choice is saved to <code>localStorage</code> and restored on every visit. All Arabic text elements read <code>font-size: var(--font-size-arabic)</code>.
      </p>
      <div style="display:flex;gap:var(--space-sm);align-items:center;margin-bottom:var(--space-md);">
        <button style="padding:6px 14px;border-radius:0.375rem;border:1.5px solid var(--color-border);background:var(--color-surface);font-family:var(--font-sans);font-size:0.875rem;cursor:pointer;">S</button>
        <button style="padding:6px 14px;border-radius:0.375rem;border:1.5px solid var(--color-primary);background:var(--color-primary);color:#fff;font-family:var(--font-sans);font-size:0.875rem;cursor:pointer;">M</button>
        <button style="padding:6px 14px;border-radius:0.375rem;border:1.5px solid var(--color-border);background:var(--color-surface);font-family:var(--font-sans);font-size:0.875rem;cursor:pointer;">L</button>
        <button style="padding:6px 14px;border-radius:0.375rem;border:1.5px solid var(--color-border);background:var(--color-surface);font-family:var(--font-sans);font-size:0.875rem;cursor:pointer;">XL</button>
        <span style="font-size:var(--font-size-sm);color:var(--color-muted);">\u2190 M is default (highlighted)</span>
      </div>

      <!-- Visual demos -->
      <h3>Inter \u2014 UI Font Samples</h3>
      <div style="display:flex;flex-direction:column;gap:var(--space-sm);background:var(--color-surface);border:1px solid var(--color-border);border-radius:8px;padding:var(--space-lg);">
        <span style="font-size:0.75rem;font-family:var(--font-sans);">0.75rem \u2014 Label / metadata / caption text</span>
        <span style="font-size:1rem;font-family:var(--font-sans);">1rem \u2014 Body copy. Type phonetic English to search.</span>
        <span style="font-size:1.25rem;font-family:var(--font-sans);">1.25rem \u2014 Transliteration: ra-\u1e25-m\u0101n</span>
        <span style="font-size:1.5rem;font-family:var(--font-sans);">1.5rem \u2014 Section heading</span>
        <span style="font-size:0.75rem;color:var(--color-muted);font-family:var(--font-sans);margin-top:var(--space-xs);">Inter variable font \u00b7 weights 100\u2013900 \u00b7 optical sizing (opsz) \u00b7 font-display: swap</span>
      </div>

      <h3 style="margin-top:var(--space-lg);">Scheherazade New \u2014 Arabic Font Samples</h3>
      <div style="display:flex;flex-direction:column;gap:var(--space-md);background:var(--color-surface-arabic);border:1px solid var(--color-border);border-radius:8px;padding:var(--space-lg);">
        <div style="text-align:right;direction:rtl;">
          <div style="font-size:1.75rem;font-family:\'Scheherazade New\',\'Amiri\',serif;line-height:1.8;">\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650</div>
          <div style="font-size:0.75rem;color:var(--color-muted);text-align:left;direction:ltr;margin-top:2px;">S \u2014 1.75rem</div>
        </div>
        <div style="text-align:right;direction:rtl;border-top:1px solid var(--color-border);padding-top:var(--space-md);">
          <div style="font-size:2.25rem;font-family:\'Scheherazade New\',\'Amiri\',serif;line-height:1.8;">\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u064f</div>
          <div style="font-size:0.75rem;color:var(--color-muted);text-align:left;direction:ltr;margin-top:2px;">M \u2014 2.25rem (default) \u00b7 ar-ra\u1e25m\u0101n \u00b7 The Most Merciful</div>
        </div>
        <div style="text-align:right;direction:rtl;border-top:1px solid var(--color-border);padding-top:var(--space-md);">
          <div style="font-size:3rem;font-family:\'Scheherazade New\',\'Amiri\',serif;line-height:1.8;">\u0627\u0644\u0644\u0651\u064e\u0647\u0650</div>
          <div style="font-size:0.75rem;color:var(--color-muted);text-align:left;direction:ltr;margin-top:2px;">L \u2014 3rem</div>
        </div>
        <div style="text-align:right;direction:rtl;border-top:1px solid var(--color-border);padding-top:var(--space-md);">
          <div style="font-size:3.75rem;font-family:\'Scheherazade New\',\'Amiri\',serif;line-height:1.6;">\u0643\u0650\u062a\u064e\u0627\u0628\u064c</div>
          <div style="font-size:0.75rem;color:var(--color-muted);text-align:left;direction:ltr;margin-top:2px;">XL \u2014 3.75rem \u00b7 Scheherazade New \u00b7 font-display: optional</div>
        </div>
      </div>

      <!-- Dark mode demo -->
      <div style="margin-top:var(--space-md);background:var(--theme-dark-bg);border-radius:8px;padding:var(--space-lg);">
        <p style="color:var(--theme-dark-muted);font-size:var(--font-size-sm);margin:0 0 var(--space-md) 0;">Dark mode \u2014 Arabic M default (2.25rem)</p>
        <div style="text-align:right;direction:rtl;font-size:2.25rem;font-family:\'Scheherazade New\',\'Amiri\',serif;line-height:1.8;color:var(--theme-dark-fg);">\u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u064f</div>
        <div style="font-size:0.875rem;color:var(--theme-dark-muted);margin-top:var(--space-xs);">ar-ra\u1e25\u012bm \u00b7 The Most Compassionate</div>
      </div>

      <!-- Rules -->
      <h3 style="margin-top:var(--space-lg);">Rules</h3>
      <ul style="font-size:var(--font-size-sm);">
        <li>Use <code>var(--font-size-arabic)</code> for all Arabic text elements \u2014 never hardcode a size.</li>
        <li>Arabic text always has <code>dir="rtl"</code> and <code>lang="ar"</code>.</li>
        <li>Use <code>font-family: var(--font-scheherazade), \'Amiri\', serif</code> for Arabic.</li>
        <li>Use <code>font-family: var(--font-inter), \'Segoe UI\', Arial, sans-serif</code> for UI/English.</li>
        <li>Do not load Amiri or static Inter weight files in the app \u2014 one variable Inter + subsetted Scheherazade New only.</li>
        <li>Run <code>npm run subset-fonts</code> once before building for production. Re-run only if the glyph inventory changes.</li>
      </ul>
    </section>'''

new_content = content[:start] + new_section + content[end:]
open(file_path, "w", encoding="utf-8").write(new_content)
print("Done. File written.")
