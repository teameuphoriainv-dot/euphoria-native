Euphoria build 25 - TestFlight purchase verification
September 9, 2026. Physical iPhone 15 Pro, iOS 26.6.

01: Build 25 installed through TestFlight.
02: Annual CTA opened Apple's TestFlight sheet, $79.99/year.
03: Canceling Annual returned to a working paywall; Monthly selected.
04: Monthly CTA opened Apple's TestFlight sheet, $9.99/month.
05: Canceling Monthly returned to a working paywall.
06: Monthly no-charge sandbox purchase completed successfully.
07: Euphoria Pro unlocked in the app.
08: Pro remained active after force-quit and cold relaunch.
09: Profile > Account > Restore purchases returned success.

Both Apple sheets displayed a 3-day free trial and the no-charge TestFlight notice.
The existing app account was on local trial day 3 of 3, so its CTA read
Get Euphoria Pro. This physical-device run used the shared paywall handler;
it was not a fresh-account onboarding run. Annual was opened and canceled,
not purchased. Monthly was purchased successfully. Restore was tested with
the existing account after purchase, not after reinstall or on a second device.

Build 25 fixes the trial CTA that previously navigated instead of initiating
the selected StoreKit purchase. The fresh-trial routing was separately checked
in source regression tests and a simulator run.
