#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"


class Parser(HTMLParser):
    def error(self, message):
        raise RuntimeError(message)


def read(relative: str) -> str:
    path = ROOT / relative
    if not path.exists():
        raise SystemExit(f"Missing required file: {relative}")
    return path.read_text(encoding="utf-8")


index = read("public/index.html")
readers = read("public/readers/index.html")
contact = read("public/contact.html")
styles = read("public/styles.css")
script = read("public/script.js")
contact_function = read("functions/api/contact.js")

for name, source in [("home", index), ("readers", readers), ("contact", contact)]:
    parser = Parser()
    parser.feed(source)
    parser.close()
    if "<!doctype html>" not in source.lower():
        raise SystemExit(f"{name}: missing HTML doctype")

home_terms = [
    "The empire has orders.",
    "Warlords & War Machines",
    "Four doors into the war.",
    "The Great Insurrection",
    "The Hunter",
    "The War Machine",
    "The Singularity",
    "The darker archive.",
    "Get the next transmission.",
    "data-menu-toggle",
    "data-site-nav",
    "og.png",
]
missing = [term for term in home_terms if term not in index]
if missing:
    raise SystemExit(f"Homepage is missing required terms: {missing}")

core_titles = [
    "Warlord Born", "Warlord Rising", "Warlord Conquering", "Prometheus Wakes",
    "Prometheus Unites", "Prometheus Ascends", "Titan's Return", "Titan's Bloodshed",
    "Titan’s Judgement", "Shadow Contract", "Twilight's Allegiance", "A Light Reborn",
    "Kings", "Gods", "The God-King", "Heretic", "Traitor", "Emissaries",
    "Revolutionary", "Choice", "Fate",
]
missing_titles = [title for title in core_titles if title not in index]
if missing_titles:
    raise SystemExit(f"Reading-order titles missing: {missing_titles}")

homepage_signup = [
    "mlb2-41523129",
    "187925613909116238",
    "ml_webform_success_41523129",
    'data-mailerlite-success="ml_webform_success_41523129"',
    "Double opt-in enabled",
]
missing_home_signup = [term for term in homepage_signup if term not in index]
if missing_home_signup:
    raise SystemExit(f"Homepage signup wiring is incomplete: {missing_home_signup}")

reader_signup = [
    "mlb2-41626330",
    "188109623780181441",
    "ml_webform_success_41626330",
    'data-mailerlite-success="ml_webform_success_41626330"',
    "confirmation link",
]
missing_reader_signup = [term for term in reader_signup if term not in readers]
if missing_reader_signup:
    raise SystemExit(f"Reader-page signup wiring is incomplete: {missing_reader_signup}")

script_terms = [
    "mailerLiteForms.forEach",
    "payload.set('ajax', '1')",
    "fetch(mailerLiteForm.action",
    "menuToggle.setAttribute",
    "siteNav.classList.toggle",
]
missing_script = [term for term in script_terms if term not in script]
if missing_script:
    raise SystemExit(f"Client behavior is incomplete: {missing_script}")

contact_terms = [
    "data-contact-form",
    "0x4AAAAAADInfxBcLDhLz5x-",
    "david@imperiumdominion.org",
]
missing_contact = [term for term in contact_terms if term not in contact]
if missing_contact:
    raise SystemExit(f"Contact page is incomplete: {missing_contact}")
if "onRequestPost" not in contact_function or "TURNSTILE_SECRET_KEY" not in contact_function or "RESEND_API_KEY" not in contact_function:
    raise SystemExit("Contact backend wiring is incomplete")

asset_refs = set(re.findall(r'(?:src|href)="(/[^"?#]+\.(?:jpg|png|css|js))', index + readers + contact))
missing_assets = [asset for asset in sorted(asset_refs) if not (PUBLIC / asset.lstrip("/")).exists()]
if missing_assets:
    raise SystemExit(f"Missing local assets: {missing_assets}")

if "@media (max-width: 640px)" not in styles or ".site-nav.is-open" not in styles:
    raise SystemExit("Responsive navigation styles are missing")

print("OK: David Beers site content, reading orders, forms, contact flow, and local assets verified.")
