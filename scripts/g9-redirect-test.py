#!/usr/bin/env python3
"""
G9 redirect emulator —— 模拟 Azure Static Web Apps 路由匹配，验证 wc/cl/en 路径返回 301。

不是真实 SWA runtime，但路由匹配规则与 SWA 文档一致：
  - 完全匹配
  - 通配符 `*` 匹配后续任意路径段

输出：T-8 用例的 PASS/FAIL，并打印每条期望与实测。
"""
import json, sys, re, os, fnmatch
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "public" / "staticwebapp.config.json"
OUT = ROOT / "out"

def to_regex(route: str) -> re.Pattern:
    """SWA route pattern -> regex. /* matches any continuation including empty."""
    # Escape regex specials except *
    parts = []
    for ch in route:
        if ch == "*":
            parts.append(".*")
        elif ch in r".+?^${}()|[]\\":
            parts.append(re.escape(ch))
        else:
            parts.append(ch)
    pat = "^" + "".join(parts) + "$"
    return re.compile(pat)

def emulate(path: str, cfg: dict, has_static: bool):
    routes = cfg.get("routes", [])
    for r in routes:
        if "route" not in r or "redirect" not in r:
            continue
        if to_regex(r["route"]).match(path):
            return ("redirect", r.get("statusCode", 302), r["redirect"])
    if has_static:
        return ("ok", 200, path)
    # Fall back to navigationFallback (SPA): rewrite to /index.html → 200
    nav = cfg.get("navigationFallback")
    if nav:
        excl = nav.get("exclude", [])
        for ex in excl:
            if fnmatch.fnmatch(path, ex):
                return ("notfound", 404, path)
        return ("rewrite", 200, nav["rewrite"])
    return ("notfound", 404, path)

def static_exists(path: str) -> bool:
    # Convert /foo/bar → out/foo/bar/index.html or out/foo/bar.html
    p = path.lstrip("/")
    candidates = [
        OUT / p / "index.html",
        OUT / (p + ".html"),
        OUT / p,
    ]
    return any(c.exists() and c.is_file() for c in candidates)

def main():
    cfg = json.loads(CONFIG.read_text())

    cases = [
        # (path, expected_kind, expected_status_or_200, expected_target_prefix)
        ("/en", "redirect", 301, "/"),
        ("/en/", "redirect", 301, "/"),
        ("/en/about/", "redirect", 301, "/"),
        ("/en/competitions/", "redirect", 301, "/"),
        ("/competitions/world_cup_2026", "redirect", 301, "/competitions/premier_league/"),
        ("/competitions/world_cup_2026/", "redirect", 301, "/competitions/premier_league/"),
        ("/competitions/world_cup_2026/anything", "redirect", 301, "/competitions/premier_league/"),
        ("/competitions/champions_league", "redirect", 301, "/competitions/premier_league/"),
        ("/competitions/champions_league/", "redirect", 301, "/competitions/premier_league/"),
        ("/tournament-simulator", "redirect", 301, "/competitions/premier_league/"),
        ("/tournament-simulator/world_cup_2026", "redirect", 301, "/competitions/premier_league/"),
        # Positive cases (should NOT redirect; should serve static)
        ("/", "ok", 200, "/"),
        ("/competitions/", "ok", 200, "/competitions/"),
        ("/competitions/premier_league/", "ok", 200, "/competitions/premier_league/"),
        ("/about/", "ok", 200, "/about/"),
    ]

    fails = []
    for path, kind_exp, code_exp, tgt_prefix in cases:
        has = static_exists(path)
        kind, code, tgt = emulate(path, cfg, has)
        ok = (kind == kind_exp) and (code == code_exp) and tgt.startswith(tgt_prefix)
        marker = "PASS" if ok else "FAIL"
        if not ok:
            fails.append((path, kind_exp, code_exp, tgt_prefix, kind, code, tgt))
        print(f"  [{marker}] {path:50s} -> {kind} {code} {tgt}")

    print()
    if fails:
        print(f"FAIL: {len(fails)} cases failed (G9 fail)")
        sys.exit(1)
    print(f"PASS: all {len(cases)} G9 redirect cases (T-8 PASS)")

if __name__ == "__main__":
    main()
