"""One-line progress formatter for motion-audit.sh. Lives in a file because inline
python inside shell double quotes got mangled by quoting and printed its own source."""
import json, sys
try:
    d = json.loads(sys.stdin.read())
    print(f"{d.get('verdict','?'):11} idlepx={d.get('idle_peak_px',0):<6} "
          f"idle={d.get('idle_pct',0)}%  entry={d.get('longest_ms',0)}ms  payoff={d.get('payoff_ms',0)}ms")
except Exception:
    print("unparseable")
