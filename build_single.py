#!/usr/bin/env python3
"""Build single-file index.html with all CSS + JS inlined."""
import re
from pathlib import Path

root = Path("/home/user/g-land")
html = (root / "index.html").read_text()

# CSS の <link> を <style> に置換
def replace_css(match):
    href = match.group(1)
    css_path = root / href
    if css_path.exists():
        return f'<style>\n/* == {href} == */\n{css_path.read_text()}\n</style>'
    return match.group(0)

html = re.sub(r'<link\s+rel="stylesheet"\s+href="([^"]+)"\s*>', replace_css, html)

# <script src="..."> を <script>...</script> に置換
def replace_js(match):
    src = match.group(1)
    js_path = root / src
    if js_path.exists():
        return f'<script>\n/* == {src} == */\n{js_path.read_text()}\n</script>'
    return match.group(0)

html = re.sub(r'<script\s+src="([^"]+)"\s*></script>', replace_js, html)

out_path = root / "index_single.html"
out_path.write_text(html)
print(f"Built: {out_path}  ({out_path.stat().st_size:,} bytes)")
