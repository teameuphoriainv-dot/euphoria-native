#!/usr/bin/env python3
"""Resumable, evidence-honest web/native lesson parity capture coordinator.

The live web lane is intentionally an ingestion boundary. Chrome control can be flaky and the
production site has no stable automation-only lesson URL, so this program never turns a local web
render or a missing browser capture into "live verified". A live Chrome recording is accepted only
with an identity sidecar, a valid video, the production host, and explicit route/title/completion
attestations. The evidence grade remains `operator_attested` until a future Chrome adapter can
provide machine-verifiable DOM checkpoints.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess as sp
import sys
import tempfile
import threading
import time
from urllib.parse import urlparse


REPO = Path(__file__).resolve().parents[2]
DEFAULT_OUT = REPO / "artifacts" / "lesson-parity"
EXPECTED = {"courses": 12, "lessons": 300, "authoredSteps": 4050, "expandedScreens": 4050}
LIVE_HOSTS = {"euphoriainv.com", "www.euphoriainv.com"}
PRODUCTION_WEB_COMMIT = "49e91490e19318f9be5919ab604346a9fa4d04d9"
NATIVE_BASELINE_COMMIT = "2b2408e7edd29f5164c9fee3a59d53c5d07f51d6"


def atomic_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)
        handle.write("\n")
        temp = Path(handle.name)
    os.replace(temp, path)


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def check_plan(plan: dict) -> None:
    expected_pins = {"productionWebCommit": PRODUCTION_WEB_COMMIT,
                     "nativeBaselineCommit": NATIVE_BASELINE_COMMIT}
    if plan.get("schemaVersion") != 2 or plan.get("sourcePins") != expected_pins:
        raise ValueError("Invalid parity plan: source commits are missing or stale")
    summary = plan.get("summary", {})
    failures = [f"{key}: expected {value}, found {summary.get(key)}"
                for key, value in EXPECTED.items() if summary.get(key) != value]
    if failures:
        raise ValueError("Invalid parity plan: " + "; ".join(failures))
    lessons = plan.get("lessons", [])
    if len(lessons) != EXPECTED["lessons"] or len({row.get("id") for row in lessons}) != len(lessons):
        raise ValueError("Invalid parity plan: lesson list is incomplete or has duplicate IDs")
    if len({row.get("courseId") for row in lessons}) != EXPECTED["courses"]:
        raise ValueError("Invalid parity plan: lesson list does not contain exactly 12 courses")
    if sum(row.get("authoredSteps", 0) for row in lessons) != EXPECTED["authoredSteps"]:
        raise ValueError("Invalid parity plan: lesson entries do not total 4,050 authored steps")
    if sum(row.get("expandedScreens", 0) for row in lessons) != EXPECTED["expandedScreens"]:
        raise ValueError("Invalid parity plan: lesson entries do not total 4,050 outer screens")
    for row in lessons:
        if len(row.get("lessonDigest", "")) != 64:
            raise ValueError(f"Invalid parity plan: {row.get('id')} has no lesson fingerprint")
        screens = row.get("screens", [])
        expected_indices = list(range(1, row.get("expandedScreens", 0) + 1))
        if [screen.get("screenIndex") for screen in screens] != expected_indices:
            raise ValueError(f"Invalid parity plan: {row.get('id')} has an incomplete screen directory")


def plan_path(out: Path) -> Path:
    return out / "plan.json"


def get_plan(out: Path) -> dict:
    path = plan_path(out)
    if not path.exists():
        raise FileNotFoundError(f"No plan at {path}; run `init` first")
    plan = load_json(path)
    check_plan(plan)
    return plan


def lesson_by_id(plan: dict, lesson_id: str) -> dict:
    found = next((row for row in plan["lessons"] if row["id"] == lesson_id), None)
    if not found:
        raise ValueError(f"Unknown lesson ID {lesson_id!r}")
    return found


def checkpoint_path(out: Path, lesson_id: str) -> Path:
    return out / "checkpoints" / f"{lesson_id}.json"


def blank_lane() -> dict:
    return {"status": "pending", "failureReasons": []}


def get_checkpoint(out: Path, lesson: dict) -> dict:
    path = checkpoint_path(out, lesson["id"])
    if path.exists():
        payload = load_json(path)
        if payload.get("lessonId") != lesson["id"]:
            raise ValueError(f"Checkpoint identity mismatch in {path}")
        if payload.get("lessonDigest") == lesson["lessonDigest"]:
            return payload
        invalidated = {
            "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "reason": "lesson_plan_changed",
            "priorLessonDigest": payload.get("lessonDigest"),
        }
    else:
        invalidated = None
    fresh = {
        "schemaVersion": 1,
        "lessonId": lesson["id"],
        "lessonDigest": lesson["lessonDigest"],
        "title": lesson["title"],
        "updatedAt": None,
        "native": blank_lane(),
        "webLive": blank_lane(),
        "webCanonicalLocal": blank_lane(),
        "audit": blank_lane(),
    }
    if invalidated:
        fresh["invalidatedPriorEvidence"] = invalidated
    return fresh


def save_checkpoint(out: Path, payload: dict) -> None:
    payload["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    atomic_json(checkpoint_path(out, payload["lessonId"]), payload)


def video_probe(path: Path) -> dict:
    if not path.is_file() or path.stat().st_size == 0:
        raise ValueError(f"Video is missing or empty: {path}")
    result = sp.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=codec_name,width,height,nb_frames:format=duration", "-of", "json", str(path)],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise ValueError(f"ffprobe rejected {path}: {(result.stderr or '').strip()[:240]}")
    payload = json.loads(result.stdout or "{}")
    streams = payload.get("streams", [])
    if not streams:
        raise ValueError(f"No video stream in {path}")
    duration = float(payload.get("format", {}).get("duration") or 0)
    if duration <= 0:
        raise ValueError(f"Video has no measurable duration: {path}")
    stream = streams[0]
    return {
        "bytes": path.stat().st_size,
        "durationSeconds": round(duration, 3),
        "codec": stream.get("codec_name"),
        "width": stream.get("width"),
        "height": stream.get("height"),
        "frames": int(stream["nb_frames"]) if str(stream.get("nb_frames", "")).isdigit() else None,
        "sha256": sha256(path),
    }


def raw_h264_probe(path: Path, wall_seconds: float) -> dict:
    if not path.is_file() or path.stat().st_size == 0:
        raise ValueError(f"Native recording is missing or empty: {path}")
    result = sp.run(["ffmpeg", "-nostdin", "-i", str(path), "-f", "null", "-"],
                    capture_output=True, text=True)
    import re
    matches = re.findall(r"frame=\s*(\d+)", result.stderr or "")
    frames = int(matches[-1]) if matches else 0
    if frames < 2:
        raise ValueError(f"Native recording decoded only {frames} frame(s): {path}")
    return {
        "bytes": path.stat().st_size,
        "durationSeconds": round(wall_seconds, 3),
        "codec": "h264",
        "frames": frames,
        "effectiveFps": round(frames / wall_seconds, 2) if wall_seconds else 0,
        "sha256": sha256(path),
    }


def init_command(args) -> None:
    args.out.mkdir(parents=True, exist_ok=True)
    cmd = ["node", "--import", "./scripts/ts-resolve-hooks.mjs",
           "scripts/parity/build-plan.mjs", "--out", str(plan_path(args.out))]
    sp.run(cmd, cwd=REPO, check=True)
    plan = get_plan(args.out)
    for lesson in plan["lessons"]:
        save_checkpoint(args.out, get_checkpoint(args.out, lesson))
    write_report(args.out, plan)
    print(f"initialized {len(plan['lessons'])} resumable lesson checkpoints in {args.out}")


def prepare_answers() -> None:
    sp.run(["node", "scripts/anim/lesson-answers.mjs", "--json"], cwd=REPO, check=True)
    sp.run(["node", "--import", "./scripts/ts-resolve-hooks.mjs",
            "scripts/anim/answers-augment.mjs"], cwd=REPO, check=True)


def course_key(course_id: str) -> str:
    head, *tail = course_id.split("-")
    return head + "".join(part.title() for part in tail)


def normalized_title_present(title: str, labels: set[str]) -> bool:
    needle = "".join(title.lower().split())[:28]
    return any(needle and needle in "".join(label.lower().split()) for label in labels)


def lesson_intro_present(labels: set[str]) -> bool:
    # Current native lessons begin with the canonical 3-beat warmup. Keep the legacy step-count
    # marker accepted for older/release builds, but a title alone is never enough to verify entry.
    # `Warm up` only renders when the recall pool is non-empty; a fresh device with no
    # completed lessons legitimately shows the same warmup CTA as `Start lesson`.
    # Both are warmup-owned control labels, so a bare title still never verifies entry.
    return ("Warm up" in labels or "Start lesson" in labels
            or any("steps ·" in label.lower() for label in labels))


def observed_interaction_kind(action: str) -> str | None:
    """Translate a driver-log action into the plan's authored interaction taxonomy."""
    if action.startswith("unsolved:"):
        return None
    if action.startswith("reveal"):
        return "tap_reveal"
    if "calculator" in action:
        return "numeric_input"
    if "interactive_graph_controls" in action:
        return "interactive_graph_controls"
    if "decisionTree" in action:
        return "decision_tree"
    if any(token in action for token in ("quiz", "fillBlank", "visual", "challenge", "scenario")):
        return "single_choice"
    if "solved:match" in action:
        return "matching_pairs"
    if "slider" in action:
        return "slider"
    if "vocabAsk" in action:
        return "atlas_vocabulary_conversation"
    if "inline_terms" in action:
        return "inline_term_popovers"
    if "trueFalse" in action:
        # The authored taxonomy has no `multi_select` anywhere in the corpus; this interaction is
        # `true_false_sequence` (273 authored). The old label reported a kind nothing authors and
        # left every true/false lesson short one observed interaction.
        return "true_false_sequence"
    if "dragSort" in action:
        return "reorder"
    if "buildIt" in action:
        return "tile_builder"
    return None


def observed_graph_control_evidence(action: str) -> tuple[str, int, int] | None:
    """Read verified renderer-control evidence from a driver action.

    The action is deliberately machine-readable. A graph merely appearing in the recording does
    not count, and a repeated loop over the same graph family is de-duplicated by the caller so it
    cannot inflate coverage.
    """
    match = re.search(r"interactive_graph_controls:([A-Za-z0-9_-]+)\[(\d+)/(\d+)\]", action)
    if not match:
        return None
    family, observed, expected = match.groups()
    return family, int(observed), int(expected)


def native_capture(out: Path, lesson: dict, timeout: int) -> dict:
    sys.path.insert(0, str(REPO / "scripts" / "anim"))
    import drive  # pylint: disable=import-error,import-outside-toplevel
    import solve  # pylint: disable=import-error,import-outside-toplevel

    started = time.time()
    lane = {"status": "running", "failureReasons": [], "startedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    if drive.at_launcher() and not drive.reconnect():
        lane.update(status="failed", failureReasons=["dev_client_reconnect_failed"])
        return lane
    navigated = drive.goto_lesson(course_key(lesson["courseId"]), lesson["lessonNumber"], title=lesson["title"])
    # Expo Router briefly exposes a hybrid accessibility tree during the home -> lesson push:
    # the new title is present while the old home nodes remain and intro metadata has not mounted.
    # A single read therefore rejected a correct route milliseconds before `20 steps · 30 XP`
    # appeared. Poll the complete intro contract, never title alone, for a bounded window.
    entry_labels: set[str] = set()
    title_verified = intro_verified = False
    deadline = time.time() + 5
    while navigated and time.time() < deadline:
        entry_labels = drive.labels()
        title_verified = normalized_title_present(lesson["title"], entry_labels)
        intro_verified = lesson_intro_present(entry_labels)
        if title_verified and intro_verified:
            break
        time.sleep(0.25)
    lane["routeVerification"] = {"navigated": navigated, "titleVisible": title_verified,
                                 "introVisible": intro_verified, "expectedRoute": lesson["route"]}
    if not navigated or not title_verified or not intro_verified:
        reasons = []
        if not navigated: reasons.append("native_route_not_verified")
        if not title_verified: reasons.append("native_title_not_visible")
        if not intro_verified: reasons.append("native_lesson_intro_not_visible")
        lane.update(status="failed", failureReasons=reasons,
                    entryLabels=sorted(entry_labels)[:30], seconds=round(time.time() - started, 2))
        return lane

    target = out / "native" / f"{lesson['id']}.h264"
    target.parent.mkdir(parents=True, exist_ok=True)
    temp = target.with_name(f".{target.name}.{os.getpid()}.tmp")
    if temp.exists():
        temp.unlink()  # exact process-owned temp only
    recorder = sp.Popen(["idb", "video-stream", "--fps", "60", "--format", "h264",
                         "--udid", drive.U, str(temp)], stdout=sp.DEVNULL, stderr=sp.DEVNULL)
    time.sleep(1.2)
    stop = threading.Event()
    result: dict = {}
    lesson_answers = next((row for row in solve.load(course_key(lesson["courseId"]))
                           if row.get("num") == lesson["lessonNumber"]), None)
    if lesson_answers is None:
        recorder.terminate()
        recorder.wait(timeout=10)
        lane.update(status="failed", failureReasons=["driver_answers_missing"])
        return lane

    def drive_lesson() -> None:
        done, log = drive.run_lesson(
            lesson_answers,
            solve,
            max_steps=max(64, lesson["expandedScreens"] * 4),
            stall_limit=3,
            stop=stop,
        )
        result.update(done=done, log=log)

    worker = threading.Thread(target=drive_lesson, daemon=True)
    recording_started = time.time()
    worker.start()
    worker.join(timeout=timeout)
    timed_out = worker.is_alive()
    stop.set()
    worker.join(timeout=12)
    worker_did_not_stop = worker.is_alive()
    recorder.terminate()
    try:
        recorder.wait(timeout=10)
    except sp.TimeoutExpired:
        recorder.kill()
        recorder.wait(timeout=5)
    recording_wall = time.time() - recording_started
    wall = time.time() - started

    # Never validate media while a stale driver is still tapping the simulator. The prior path
    # noticed the live thread but then spent ~45 seconds decoding raw H.264 before returning; the
    # daemon kept interacting throughout that decode window. Returning immediately ends the
    # process and its daemon before another lesson or retry can begin.
    if worker_did_not_stop:
        if temp.exists():
            temp.unlink()  # exact temp owned by this capture attempt
        reasons = ["native_worker_did_not_stop"]
        if timed_out:
            reasons.insert(0, "native_capture_timeout")
        lane.update(status="failed", failureReasons=reasons, completed=False,
                    detail="driver thread did not honor the capture stop event",
                    seconds=round(wall, 2))
        return lane

    try:
        media = raw_h264_probe(temp, recording_wall)
        os.replace(temp, target)
    except Exception as error:
        if temp.exists():
            temp.unlink()
        lane.update(status="failed", failureReasons=["native_recording_invalid"], detail=str(error), seconds=round(wall, 2))
        return lane

    log = result.get("log", [])
    moved = sum(1 for _, _, did_move in log if did_move)
    observed = sorted({kind for _, how, _ in log if (kind := observed_interaction_kind(how))})
    authored_kinds = set(lesson["interactions"])
    coverage_complete = authored_kinds.issubset(observed)
    authored_graph_controls = sum(screen.get("graphControls", 0) for screen in lesson["screens"])
    graph_evidence: dict[str, tuple[int, int]] = {}
    for _, how, _ in log:
        evidence = observed_graph_control_evidence(how)
        if evidence:
            family, verified, expected = evidence
            previous = graph_evidence.get(family, (0, expected))
            graph_evidence[family] = (max(previous[0], verified), max(previous[1], expected))
    observed_graph_controls = sum(verified for verified, _ in graph_evidence.values())
    graph_controls_complete = (authored_graph_controls == 0
                               or observed_graph_controls >= authored_graph_controls)
    reasons = []
    if timed_out: reasons.append("native_capture_timeout")
    if worker_did_not_stop: reasons.append("native_worker_did_not_stop")
    if not result.get("done"): reasons.append("lesson_not_completed")
    if log and sum(1 for _, _, did_move in log[-3:] if not did_move) >= 3: reasons.append("driver_stall_detected")
    if any(how.startswith("route_escape:") for _, how, _ in log): reasons.append("native_route_escape_detected")
    if any(how.startswith("step_regression:") for _, how, _ in log): reasons.append("native_step_regression_detected")
    if not coverage_complete: reasons.append("native_interaction_coverage_incomplete")
    if not graph_controls_complete: reasons.append("native_graph_control_coverage_incomplete")
    lane.update(
        status="accepted" if not reasons else "failed",
        failureReasons=reasons,
        completed=result.get("done", False),
        recording=str(target.relative_to(out)),
        media=media,
        screensExpected=lesson["expandedScreens"],
        driverActions=moved,
        driverLog=[{"index": i, "action": how, "moved": did_move} for i, how, did_move in log],
        interactionCoverage={"authored": lesson["interactions"], "observedKinds": observed,
                             "grade": "driver_observed", "complete": coverage_complete},
        graphControlCoverage={
            "authored": authored_graph_controls,
            "observed": observed_graph_controls,
            "complete": graph_controls_complete,
            "families": {family: {"observed": values[0], "expected": values[1]}
                         for family, values in sorted(graph_evidence.items())},
        },
        motionCoverage={"recorded": True, "frames": media["frames"],
                        "effectiveFps": media["effectiveFps"], "adjudication": "pending"},
        seconds=round(wall, 2),
    )
    return lane


def native_command(args) -> None:
    plan = get_plan(args.out)
    prepare_answers()
    selected = [row for row in plan["lessons"]
                if (not args.lesson or row["id"] == args.lesson)
                and (not args.course or row["courseId"] == args.course)]
    if args.limit:
        selected = selected[:args.limit]
    for index, lesson in enumerate(selected, 1):
        checkpoint = get_checkpoint(args.out, lesson)
        if checkpoint["native"].get("status") == "accepted" and not args.force:
            print(f"skip {lesson['id']} — native recording already accepted")
            continue
        print(f"[{index}/{len(selected)}] native {lesson['id']} · {lesson['title']}", flush=True)
        try:
            checkpoint["native"] = native_capture(args.out, lesson, args.timeout)
        except Exception as error:  # checkpoint an unexpected tooling failure, then continue
            checkpoint["native"] = {"status": "failed", "failureReasons": ["native_tooling_exception"],
                                    "detail": f"{type(error).__name__}: {error}"}
        save_checkpoint(args.out, checkpoint)
        print(f"  {checkpoint['native']['status']} {', '.join(checkpoint['native'].get('failureReasons', []))}")
        if "native_worker_did_not_stop" in checkpoint["native"].get("failureReasons", []):
            print("  stopping the run because a stale driver could interfere with the next lesson", file=sys.stderr)
            break
    write_report(args.out, plan)


def validate_web_metadata(lesson: dict, metadata: dict, source: str) -> list[str]:
    reasons = []
    if metadata.get("lessonId") != lesson["id"]: reasons.append("web_lesson_id_mismatch")
    if metadata.get("courseId") != lesson["courseId"]: reasons.append("web_course_id_mismatch")
    if metadata.get("lessonNumber") != lesson["lessonNumber"]: reasons.append("web_lesson_number_mismatch")
    if metadata.get("title", "").strip() != lesson["title"].strip(): reasons.append("web_title_mismatch")
    if not metadata.get("routeVerified"): reasons.append("web_route_not_attested")
    if not metadata.get("titleVerified"): reasons.append("web_title_not_attested")
    if not metadata.get("completionVerified"): reasons.append("web_completion_not_attested")
    if metadata.get("screensObserved") != lesson["expandedScreens"]: reasons.append("web_screen_count_mismatch")
    route = urlparse(metadata.get("route", ""))
    if source == "live-chrome":
        if route.scheme != "https" or route.hostname not in LIVE_HOSTS:
            reasons.append("web_not_live_production_host")
        if metadata.get("captureMethod") != "chrome-live-session":
            reasons.append("web_capture_method_not_live_chrome")
        if metadata.get("productionCommit") != PRODUCTION_WEB_COMMIT:
            reasons.append("live_web_commit_mismatch")
    elif source == "local-canonical-web":
        commit = metadata.get("canonicalCommit", "")
        if commit != PRODUCTION_WEB_COMMIT:
            reasons.append("canonical_commit_mismatch")
    else:
        reasons.append("unknown_web_source")
    return reasons


def ingest_web_command(args) -> None:
    plan = get_plan(args.out)
    lesson = lesson_by_id(plan, args.lesson)
    checkpoint = get_checkpoint(args.out, lesson)
    metadata = load_json(args.metadata)
    source = metadata.get("source")
    lane_name = "webLive" if source == "live-chrome" else "webCanonicalLocal"
    reasons = validate_web_metadata(lesson, metadata, source)
    try:
        media = video_probe(args.video)
        if media["durationSeconds"] < max(5.0, lesson["expandedScreens"] * 0.5):
            reasons.append("web_recording_implausibly_short")
    except Exception as error:
        media = None
        reasons.append("web_recording_invalid")
        metadata["mediaError"] = str(error)
    if reasons:
        checkpoint[lane_name] = {"status": "failed", "failureReasons": reasons,
                                 "metadata": metadata, "media": media}
        save_checkpoint(args.out, checkpoint)
        write_report(args.out, plan)
        raise ValueError("Web capture rejected: " + ", ".join(reasons))

    suffix = args.video.suffix.lower() or ".mp4"
    target = args.out / ("web-live" if source == "live-chrome" else "web-canonical-local") / f"{lesson['id']}{suffix}"
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=target.parent, delete=False) as handle:
        temp = Path(handle.name)
    shutil.copy2(args.video, temp)
    os.replace(temp, target)
    prior_recording = checkpoint[lane_name].get("recording")
    if prior_recording and prior_recording != str(target.relative_to(args.out)):
        prior = (args.out / prior_recording).resolve()
        if args.out in prior.parents and prior.is_file():
            prior.unlink()  # exact prior recording for this lesson/lane; preserves the one-file invariant
    media["sha256"] = sha256(target)
    checkpoint[lane_name] = {
        "status": "accepted",
        "failureReasons": [],
        "evidenceGrade": "operator_attested" if source == "live-chrome" else "local_reproduction",
        "satisfiesLiveWebCoverage": source == "live-chrome",
        "recording": str(target.relative_to(args.out)),
        "media": media,
        "routeVerification": {"route": metadata["route"], "routeVerified": True,
                              "titleVerified": True, "completionVerified": True},
        "interactionCoverage": metadata.get("interactionCoverage", {"grade": "not_reported"}),
        "motionCoverage": metadata.get("motionCoverage", {"adjudication": "pending"}),
        "metadata": metadata,
    }
    save_checkpoint(args.out, checkpoint)
    write_report(args.out, plan)
    print(f"accepted {source} recording for {lesson['id']} -> {target}")


def ingest_audit_command(args) -> None:
    plan = get_plan(args.out)
    lesson = lesson_by_id(plan, args.lesson)
    checkpoint = get_checkpoint(args.out, lesson)
    payload = load_json(args.audit)
    reasons = []
    if checkpoint["native"].get("status") != "accepted": reasons.append("native_recording_not_accepted")
    if checkpoint["webLive"].get("status") != "accepted": reasons.append("live_web_recording_not_accepted")
    if payload.get("lessonId") != lesson["id"]: reasons.append("audit_lesson_id_mismatch")
    verdict = payload.get("verdict")
    if verdict not in {"match", "native_missing", "behavior_diff", "blocked"}: reasons.append("audit_verdict_invalid")
    checks = payload.get("componentChecks", [])
    screen_checks = payload.get("screenChecks", [])
    if verdict == "match":
        by_index = {row.get("screenIndex"): row for row in screen_checks}
        if set(by_index) != set(range(1, lesson["expandedScreens"] + 1)):
            reasons.append("audit_screen_coverage_incomplete")
        else:
            for screen in lesson["screens"]:
                check = by_index[screen["screenIndex"]]
                if check.get("stepType") != screen["stepType"] or check.get("renderedKind") != screen["renderedKind"]:
                    reasons.append("audit_screen_identity_mismatch")
                    break
                if check.get("verdict") != "match":
                    reasons.append("audit_match_contains_nonmatching_screen")
                    break
                if not isinstance(check.get("webTime"), (int, float)) or not isinstance(check.get("nativeTime"), (int, float)):
                    reasons.append("audit_screen_timestamps_missing")
                    break
        motion_types = {row.get("type") for row in payload.get("motionChecks", [])
                        if row.get("verdict") in {"match", "not_applicable"}}
        required_motion = {"screen_entry"}
        if lesson["motionExpectations"]["atlasTap"]: required_motion.add("atlas_tap")
        if lesson["motionExpectations"]["authoredAtlas"]: required_motion.add("authored_atlas")
        if lesson["motionExpectations"]["animatedVisuals"]: required_motion.add("animated_visual")
        if lesson["motionExpectations"]["graphTransitions"]: required_motion.add("interactive_graph")
        if not required_motion.issubset(motion_types): reasons.append("audit_motion_coverage_incomplete")
        interaction_types = {row.get("type") for row in payload.get("interactionChecks", [])
                             if row.get("verdict") == "match"}
        if not set(lesson["interactions"]).issubset(interaction_types):
            reasons.append("audit_interaction_coverage_incomplete")
    checkpoint["audit"] = {
        "status": "accepted" if not reasons else "failed",
        "failureReasons": reasons,
        "verdict": verdict,
        "evidenceGrade": "human_video_adjudication",
        "componentChecks": checks,
        "screenChecks": screen_checks,
        "motionChecks": payload.get("motionChecks", []),
        "interactionChecks": payload.get("interactionChecks", []),
        "notes": payload.get("notes", ""),
    }
    save_checkpoint(args.out, checkpoint)
    write_report(args.out, plan)
    if reasons:
        raise ValueError("Audit rejected: " + ", ".join(reasons))
    print(f"accepted parity audit for {lesson['id']}: {verdict}")


def next_command(args) -> None:
    plan = get_plan(args.out)
    lane_name = {"native": "native", "web-live": "webLive", "audit": "audit"}[args.lane]
    for lesson in plan["lessons"]:
        status = get_checkpoint(args.out, lesson)[lane_name].get("status")
        if status != "accepted":
            print(json.dumps({"lessonId": lesson["id"], "courseId": lesson["courseId"],
                              "lessonNumber": lesson["lessonNumber"], "title": lesson["title"],
                              "expandedScreens": lesson["expandedScreens"], "laneStatus": status}, indent=2))
            return
    print(f"all {len(plan['lessons'])} lessons accepted for lane {args.lane}")


def write_report(out: Path, plan: dict) -> dict:
    counts = {lane: {"pending": 0, "running": 0, "accepted": 0, "failed": 0}
              for lane in ("native", "webLive", "webCanonicalLocal", "audit")}
    rows = []
    failure_counts = {}
    for lesson in plan["lessons"]:
        checkpoint = get_checkpoint(out, lesson)
        lanes = {}
        for lane in counts:
            state = checkpoint[lane]
            status = state.get("status", "pending")
            counts[lane][status] = counts[lane].get(status, 0) + 1
            lanes[lane] = state
            for reason in state.get("failureReasons", []):
                failure_counts[reason] = failure_counts.get(reason, 0) + 1
        rows.append({
            "lessonId": lesson["id"], "courseId": lesson["courseId"],
            "lessonNumber": lesson["lessonNumber"], "title": lesson["title"],
            "expandedScreens": lesson["expandedScreens"], "components": lesson["components"],
            "interactionsAuthored": lesson["interactions"],
            "motionExpected": lesson["motionExpectations"], "lanes": lanes,
        })
    manifest = {
        "schemaVersion": 1,
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "corpusDigest": plan["corpusDigest"],
        "summary": plan["summary"],
        "componentInventory": plan["corpusComponents"],
        "coverage": counts,
        "failureReasons": failure_counts,
        "truthRules": {
            "liveWeb": "Only accepted live-chrome captures on euphoriainv.com count.",
            "localWeb": "Local canonical-web captures are labeled local reproduction and never satisfy live coverage.",
            "parity": "A lesson is parity-verified only after accepted native + live web recordings and an accepted video adjudication.",
        },
        "lessons": rows,
    }
    atomic_json(out / "manifest.json", manifest)
    lines = [
        "# Lesson parity evidence status", "",
        f"Corpus: **{plan['summary']['courses']} courses / {plan['summary']['lessons']} lessons / {plan['summary']['expandedScreens']} expanded screens**", "",
        "| Lane | Accepted | Failed | Pending |", "|---|---:|---:|---:|",
    ]
    labels = {"native": "Native recordings", "webLive": "Live Chrome recordings",
              "webCanonicalLocal": "Local canonical-web recordings", "audit": "Video adjudications"}
    for lane, label in labels.items():
        lines.append(f"| {label} | {counts[lane]['accepted']} | {counts[lane]['failed']} | {counts[lane]['pending'] + counts[lane]['running']} |")
    lines.extend(["", "Local canonical-web evidence never counts as live production coverage.", ""])
    if failure_counts:
        lines.extend(["## Failure reasons", ""])
        lines.extend(f"- {reason}: {amount}" for reason, amount in sorted(failure_counts.items()))
        lines.append("")
    (out / "REPORT.md").write_text("\n".join(lines), encoding="utf-8")
    return manifest


def status_command(args) -> None:
    plan = get_plan(args.out)
    manifest = write_report(args.out, plan)
    print(json.dumps({"summary": manifest["summary"], "coverage": manifest["coverage"],
                      "failureReasons": manifest["failureReasons"]}, indent=2))


def selftest_command(_args) -> None:
    assert lesson_intro_present({"20 steps · 30 XP"})
    assert lesson_intro_present({"Warm up", "Introduction to Investing"})
    assert lesson_intro_present({"Start lesson", "Introduction to Investing"})
    assert not lesson_intro_present({"Introduction to Investing", "Continue"})
    assert observed_interaction_kind("reveal") == "tap_reveal"
    assert observed_interaction_kind("reveal(3)+button") == "tap_reveal"
    assert observed_interaction_kind("solved:scenario") == "single_choice"
    assert observed_interaction_kind("solved:calculator(3/3)") == "numeric_input"
    graph_action = "exercised:interactive_graph_controls:portfolioMixer[5/5]+button"
    assert observed_interaction_kind(graph_action) == "interactive_graph_controls"
    assert observed_graph_control_evidence(graph_action) == ("portfolioMixer", 5, 5)
    assert observed_graph_control_evidence("button") is None
    assert observed_interaction_kind("solved:decisionTree") == "decision_tree"
    assert observed_interaction_kind("solved:trueFalse(2 set, 1 kept)") == "true_false_sequence"
    assert observed_interaction_kind("solved:vocabAsk") == "atlas_vocabulary_conversation"
    assert observed_interaction_kind("inline_terms(2)+button") == "inline_term_popovers"
    assert observed_interaction_kind("solved:dragSort") == "reorder"
    assert observed_interaction_kind("unsolved:no-match") is None
    with tempfile.TemporaryDirectory(prefix="euphoria-parity-selftest-") as temp_dir:
        out = Path(temp_dir)
        plan = {
            "schemaVersion": 2, "corpusDigest": "selftest",
            "sourcePins": {"productionWebCommit": PRODUCTION_WEB_COMMIT,
                           "nativeBaselineCommit": NATIVE_BASELINE_COMMIT},
            "summary": EXPECTED.copy(),
            "corpusComponents": {"rawStepTypes": {}, "renderedKinds": {}, "visualFamilies": {}, "interactions": {}},
            "lessons": [{
                "id": f"selftest-{(number - 1) // 25 + 1:02}--{(number - 1) % 25 + 1:02}",
                "lessonDigest": f"{number:064x}",
                "courseId": f"selftest-{(number - 1) // 25 + 1:02}", "courseTitle": "Selftest",
                "lessonNumber": (number - 1) % 25 + 1, "title": f"Lesson {number}",
                "route": "euphorianative://lesson",
                "authoredSteps": 14 if number <= 150 else 13,
                "expandedScreens": 14 if number <= 150 else 13,
                "screens": [{"screenIndex": screen, "stepType": "quiz", "renderedKind": "choice",
                             "interaction": "single_choice", "title": "Question", "graphControls": 0}
                            for screen in range(1, (14 if number <= 150 else 13) + 1)],
                "components": {"rawStepTypes": {"quiz": 14 if number <= 150 else 13},
                               "renderedKinds": {"choice": 14 if number <= 150 else 13},
                               "visualFamilies": {}},
                "interactions": {"single_choice": 14 if number <= 150 else 13},
                "motionExpectations": {"screenEntry": 14 if number <= 150 else 13,
                                       "atlasTap": 14 if number <= 150 else 13, "authoredAtlas": 0,
                                       "animatedVisuals": 0, "graphTransitions": 0},
            } for number in range(1, 301)],
        }
        check_plan(plan)
        bad = {**plan, "summary": {**plan["summary"], "expandedScreens": 4178}}
        try:
            check_plan(bad)
            raise AssertionError("partial corpus passed validation")
        except ValueError:
            pass
        lesson = plan["lessons"][0]
        live = {"source": "live-chrome", "captureMethod": "chrome-live-session",
                "productionCommit": PRODUCTION_WEB_COMMIT,
                "lessonId": lesson["id"], "courseId": lesson["courseId"],
                "lessonNumber": lesson["lessonNumber"], "title": lesson["title"],
                "route": "https://euphoriainv.com/lesson", "routeVerified": True,
                "titleVerified": True, "completionVerified": True,
                "screensObserved": lesson["expandedScreens"]}
        assert not validate_web_metadata(lesson, live, "live-chrome")
        stale_live = {**live, "productionCommit": "0" * 40}
        assert "live_web_commit_mismatch" in validate_web_metadata(lesson, stale_live, "live-chrome")
        local_labeled_live = {**live, "route": "http://localhost:3000/lesson"}
        assert "web_not_live_production_host" in validate_web_metadata(lesson, local_labeled_live, "live-chrome")
        checkpoint = get_checkpoint(out, lesson)
        checkpoint["native"] = {"status": "accepted", "failureReasons": []}
        checkpoint["webLive"] = {"status": "accepted", "failureReasons": []}
        save_checkpoint(out, checkpoint)
        assert load_json(checkpoint_path(out, lesson["id"]))["lessonId"] == lesson["id"]
        stale = get_checkpoint(out, {**lesson, "lessonDigest": "f" * 64})
        assert stale["native"]["status"] == "pending" and stale["invalidatedPriorEvidence"]["reason"] == "lesson_plan_changed"
        save_checkpoint(out, checkpoint)
        atomic_json(plan_path(out), plan)
        incomplete = out / "incomplete-audit.json"
        atomic_json(incomplete, {"lessonId": lesson["id"], "verdict": "match",
                                 "screenChecks": [], "motionChecks": [], "interactionChecks": []})
        audit_args = argparse.Namespace(out=out, lesson=lesson["id"], audit=incomplete)
        try:
            ingest_audit_command(audit_args)
            raise AssertionError("incomplete 1:1 screen audit passed validation")
        except ValueError:
            pass
        complete = out / "complete-audit.json"
        atomic_json(complete, {
            "lessonId": lesson["id"], "verdict": "match",
            "screenChecks": [{"screenIndex": screen["screenIndex"], "stepType": screen["stepType"],
                              "renderedKind": screen["renderedKind"], "verdict": "match",
                              "webTime": float(screen["screenIndex"]), "nativeTime": float(screen["screenIndex"])}
                             for screen in lesson["screens"]],
            "motionChecks": [{"type": "screen_entry", "verdict": "match"},
                             {"type": "atlas_tap", "verdict": "match"}],
            "interactionChecks": [{"type": "single_choice", "verdict": "match"}],
        })
        checkpoint = get_checkpoint(out, lesson)
        checkpoint["native"] = {"status": "accepted", "failureReasons": []}
        checkpoint["webLive"] = {"status": "accepted", "failureReasons": []}
        save_checkpoint(out, checkpoint)
        ingest_audit_command(argparse.Namespace(out=out, lesson=lesson["id"], audit=complete))
        assert get_checkpoint(out, lesson)["audit"]["status"] == "accepted"
        good_video = out / "good.mp4"
        made = sp.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-f", "lavfi", "-i",
                       "color=c=black:s=32x32:d=0.2", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                       str(good_video)], capture_output=True)
        if made.returncode != 0:
            raise AssertionError("selftest could not create its disposable video fixture")
        assert video_probe(good_video)["durationSeconds"] > 0
        empty_video = out / "empty.mp4"
        empty_video.touch()
        try:
            video_probe(empty_video)
            raise AssertionError("empty recording passed validation")
        except ValueError:
            pass
        print("parity coordinator selftest ok — partial corpus/screen audit rejected, live/local boundary enforced, stale evidence invalidated, media checked")


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description=__doc__)
    root.add_argument("--out", type=Path, default=DEFAULT_OUT)
    commands = root.add_subparsers(dest="command", required=True)
    commands.add_parser("init")
    native = commands.add_parser("native")
    native.add_argument("--lesson")
    native.add_argument("--course")
    native.add_argument("--limit", type=int)
    native.add_argument("--timeout", type=int, default=240)
    native.add_argument("--force", action="store_true")
    ingest = commands.add_parser("ingest-web")
    ingest.add_argument("--lesson", required=True)
    ingest.add_argument("--video", required=True, type=Path)
    ingest.add_argument("--metadata", required=True, type=Path)
    audit = commands.add_parser("ingest-audit")
    audit.add_argument("--lesson", required=True)
    audit.add_argument("--audit", required=True, type=Path)
    nxt = commands.add_parser("next")
    nxt.add_argument("--lane", choices=("native", "web-live", "audit"), required=True)
    commands.add_parser("status")
    commands.add_parser("selftest")
    return root


def main() -> None:
    args = parser().parse_args()
    args.out = args.out.resolve()
    commands = {
        "init": init_command, "native": native_command, "ingest-web": ingest_web_command,
        "ingest-audit": ingest_audit_command, "next": next_command,
        "status": status_command, "selftest": selftest_command,
    }
    try:
        commands[args.command](args)
    except (ValueError, FileNotFoundError, sp.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()
