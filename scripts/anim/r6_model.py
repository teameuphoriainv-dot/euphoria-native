"""R6 attempt EIGHT, part one: the expected curve, computed offline from Reanimated's OWN maths.

Transcribed from node_modules/react-native-reanimated/src/animation/spring/springUtils.ts,
underDampedSpringCalculations. The important property is that it is a CLOSED FORM evaluated at
absolute t, not an incremental integrator:

    position(t) = toValue + e^(-zeta*omega0*t) * ( sin(omega1*t)*((v0 + zeta*omega0*x0)/omega1)
                                                   + x0*cos(omega1*t) )

Two things follow, and both matter for attempt seven's post-mortem:

  * SAMPLE RATE CANNOT CHANGE THE VALUES. A 13fps sampler reading this curve still reads the exact
    value at whatever t it happens to land on. So the "coarse steps destabilised the integrator"
    story from attempt seven was wrong even as a mechanism -- there is no integrator. What attempt
    seven's control did establish stands: the sampler ran at 11-13fps throughout. But the 1.368 it
    reported cannot be explained by that, and is not explained yet.
  * THE CURVE IS COMPUTABLE. Which is the whole point of attempt eight: predict it here, then spend
    device budget only on confirming a handful of points.

Run: python3 scripts/anim/r6_model.py   (also self-checks; exits non-zero if any check fails)
"""
import math

# REANIMATED 4 DEFAULTS mass TO 4, NOT 1. This single fact is what closed R6.
#
# spring.ts:65-67 builds its default config from GentleSpringConfig, which is
# {damping: 120, mass: 4, stiffness: 900}. Reanimated 3's default was {damping: 10, mass: 1,
# stiffness: 100} and is still exported, as Reanimated3DefaultSpringConfig, but it is no longer
# what you get. So an INLINE `withSpring(x, { stiffness, damping })` that omits mass silently
# runs at mass 4, and zeta = c / (2*sqrt(k*m)) is HALVED against what the author computed.
#
# src/shared/motion/tokens.ts sets `mass: 1` explicitly on all six token springs, so those are
# exactly what the rubric documents. It is only the inline springs that drift.
DEFAULT_MASS = 4.0

def spring(t, to=1.0, start=0.0, v0=0.0, stiffness=220.0, damping=18.0, mass=DEFAULT_MASS):
    x0 = start - to
    zeta = damping / (2 * math.sqrt(stiffness * mass))
    omega0 = math.sqrt(stiffness / mass)
    omega1 = omega0 * math.sqrt(1 - zeta * zeta)     # underdamped only
    env = math.exp(-zeta * omega0 * t)
    return to + env * (math.sin(omega1 * t) * ((v0 + zeta * omega0 * x0) / omega1)
                       + x0 * math.cos(omega1 * t))

STIFF, DAMP, MASS, THROW = 220.0, 18.0, DEFAULT_MASS, 190.0
zeta = DAMP / (2 * math.sqrt(STIFF * MASS))
omega0 = math.sqrt(STIFF / MASS)
omega1 = omega0 * math.sqrt(1 - zeta * zeta)

# ---- self-checks: the model must reproduce identities it was not fitted to ----
assert abs(spring(0.0) - 0.0) < 1e-12, "must start at the start value"
assert abs(spring(10.0) - 1.0) < 1e-6, "must settle at the target"  # 10s: mass 4 settles slowly
peak_t = math.pi / omega1                                   # first peak of an underdamped spring
analytic_os = math.exp(-math.pi * zeta / math.sqrt(1 - zeta * zeta))
assert abs((spring(peak_t) - 1.0) - analytic_os) < 1e-9, "peak must match the overshoot identity"
# the closed form must agree with a fine numerical integration of the same ODE
x, v, dt = 0.0, 0.0, 1e-6
for _ in range(int(0.30 / dt)):
    a = (STIFF * (1.0 - x) - DAMP * v) / MASS
    v += a * dt; x += v * dt
assert abs(x - spring(0.30)) < 1e-3, f"closed form {spring(0.30):.6f} vs integration {x:.6f}"

# THE DEVICE FIXTURE. The banner's own shared value, read on device, peaked at 1.36739 -- the
# highest of ten timed JS reads during a real lesson-feedback mount. The model must reproduce that
# peak, or the mass=4 explanation is wrong and R6 reopens. This is what turns the model from an
# assertion into a measured result.
MEASURED_PEAK = 1.3673927854651562
model_peak = spring(math.pi / (math.sqrt(STIFF / MASS) * math.sqrt(1 - (DAMP / (2 * math.sqrt(STIFF * MASS))) ** 2)))
assert abs(model_peak - MEASURED_PEAK) < 1e-3, f"model peak {model_peak:.6f} vs device {MEASURED_PEAK:.6f}"
print("self-checks passed (start, settle, overshoot identity, independent integration,")
print(f"                   and the device fixture: model {model_peak:.5f} vs measured {MEASURED_PEAK:.5f})")

print(f"\nstiffness {STIFF:.0f}  damping {DAMP:.0f}  mass {MASS:.0f}")
print(f"  zeta   {zeta:.4f}   omega0 {omega0:.3f} rad/s   omega1 {omega1:.3f} rad/s")
print(f"  peak   {spring(peak_t):.4f}  at {peak_t*1000:.0f}ms   -> overshoot {analytic_os*100:.1f}% "
      f"= {analytic_os*THROW:.1f}pt of the {THROW:.0f}pt throw")

def settle(tol):
    t = 10.0
    while t > 0 and abs(spring(t) - 1.0) <= tol:
        t -= 0.001
    return t * 1000
print(f"  2% settle {settle(0.02):.0f}ms      1% settle {settle(0.01):.0f}ms")

# ---- PRE-REGISTERED read points for the device half. Committed BEFORE the run. ----
PROBE_MS = [30, 80, 140, 200, 266, 340, 420, 520, 650, 900]
print("\nPRE-REGISTERED expected values at the device read points:")
for ms in PROBE_MS:
    print(f"  t={ms:>4}ms   t.value = {spring(ms/1000.0):.4f}   translateY = {(1-spring(ms/1000.0))*THROW:+7.2f}pt")
print("\nR2 asks whether the bounce is DELIBERATE. lesson-feedback.tsx states the intent per element:")
print("  'slightly underdamped so the bar overshoots a few pixels and settles: it should feel")
print("   thrown into place, not slid.'")
print("At the mass the author computed for, that intent is 17.3pt of a 190pt throw -- 'a few pixels'.")
print(f"At the mass Reanimated actually uses it is {analytic_os*THROW:.1f}pt, more than a third of the whole")
print("throw, and it wobbles for the better part of two seconds. The bounce is stated, so it passes")
print("the letter of R2; the MAGNITUDE is four times the stated intent, and that is the defect.")
