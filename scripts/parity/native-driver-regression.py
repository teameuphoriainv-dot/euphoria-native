#!/usr/bin/env python3
"""Device-free regressions for the native lesson parity driver."""
from __future__ import annotations

import json
import os
from pathlib import Path
from types import SimpleNamespace
import sys


REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "scripts" / "anim"))
# Importing drive must not depend on whichever simulators happen to be booted for this pure test.
os.environ["EUPHORIA_SIM_UDID"] = "driver-regression-no-device"

import drive  # noqa: E402
import solve  # noqa: E402

REAL_TAP = drive.tap
REAL_BUTTON = drive.button


def assert_answer_metadata() -> None:
    with Path("/tmp/lesson-answers.json").open(encoding="utf-8") as handle:
        lesson = json.load(handle)["investingFundamentals"][0]
    calc = next((step for step in lesson["steps"] if step.get("kind") == "calculator"), None)
    assert calc and [blank["answer"] for blank in calc["blanks"]] == [9, 24, 6]
    scenario = next((step for step in lesson["steps"] if step.get("kind") == "scenario"), None)
    assert scenario and len(scenario.get("options", [])) == 3 and scenario["correct"] == 1
    bond = next((step for step in lesson["steps"]
                 if step.get("options", [None])[0] == "Bought a small ownership stake in the government"), None)
    assert bond and bond["kind"] == "quiz" and bond["correct"] == 1
    tree = next((step for step in lesson["steps"] if step.get("kind") == "decisionTree"), None)
    assert tree and len(tree.get("decisions", [])) == 2
    assert all(decision["correct"] >= 0 for decision in tree["decisions"])
    graphs = [step for step in lesson["steps"] if step.get("kind") == "explorable"]
    assert {step.get("widget") for step in graphs} >= {"inflationEroder", "portfolioMixer"}
    lesson_three = json.load(Path("/tmp/lesson-answers.json").open(encoding="utf-8"))["investingFundamentals"][2]
    numeric = solve.find_step(lesson_three, [
        "The Rule of 72 says that at 8% annual return, your money doubles approximately every ___ years.",
        "9", "15", "12", "6", "Check",
    ])
    assert numeric and numeric["kind"] == "fillBlank" and numeric["options"][numeric["correct"]] == "9"


def assert_no_blind_guess() -> None:
    check = (0, 700, 300, 50, "Check", "AXButton", "")
    option = (0, 300, 300, 50, "The first arbitrary option", "AXButton", "")
    tapped = []
    drive.at_launcher = lambda: False
    drive.dismiss_logbox = lambda: False
    drive.dismiss_sheet = lambda: False
    drive.nodes = lambda: [option]
    drive.button = lambda *_labels: [check]

    def fake_tap(node, _settle=1.6):
        tapped.append(node)
        return False

    drive.tap = fake_tap
    moved, how = drive.advance(allow_guess=False)
    assert (moved, how) == (False, "stuck")
    assert tapped == [check], "parity driver guessed an option before the answer solver"


def assert_button_label_priority() -> None:
    check = (0, 500, 300, 50, "Check", "AXButton", "")
    lower_continue = (0, 750, 300, 50, "Continue", "AXButton", "")
    finish = (0, 650, 300, 50, "Finish decision path", "AXButton", "")
    drive.nodes = lambda: [check, lower_continue, finish]
    assert drive.button("check", "continue") == [check]
    assert drive.button("continue", "check") == [lower_continue]
    drive.nodes = lambda: [finish]
    assert drive.post_solve_button() == [finish]
    static_continue = (0, 750, 300, 50, "Continue", "AXStaticText", "")
    prose = (0, 300, 300, 50, "Select all that apply, then check.", "AXStaticText", "")
    drive.nodes = lambda: [prose, static_continue]
    assert drive.button("check") == []
    assert drive.button("continue") == [static_continue]
    assert drive.node_is_tappable(static_continue)
    offscreen_continue = (57, 848, 288, 48, "Continue", "AXButton", "")
    assert not drive.node_is_tappable(offscreen_continue)
    begin = (16, 620, 370, 48, "Begin", "AXButton", "")
    begin_prose = (16, 300, 370, 48, "Before you begin, read this.", "AXStaticText", "")
    drive.nodes = lambda: [begin_prose, begin]
    assert REAL_BUTTON("begin") == [begin]


def assert_lesson_loop_disables_guessing() -> None:
    advance_args = []
    drive.labels = lambda: {"an unanswered interaction"}
    drive.find = lambda _label: []
    drive.advance = lambda allow_guess=True: (advance_args.append(allow_guess) or (False, "stuck"))
    drive.button = lambda *_labels: None

    class NoAnswer:
        @staticmethod
        def answer(_lesson):
            return False, "none"

    done, log = drive.run_lesson({"steps": []}, NoAnswer(), max_steps=1, stall_limit=1)
    assert not done and log == [(0, "unsolved:none", False)]
    assert advance_args == [False], "run_lesson re-enabled arbitrary-row guessing"


def assert_route_escape_is_explicit() -> None:
    drive.labels = lambda: {"Home", "Learn", "Trade", "Digest", "Games"}
    done, log = drive.run_lesson({"steps": []}, object(), max_steps=3, stall_limit=3)
    assert not done and log == [(0, "route_escape:tab-bar", False)]


def assert_authored_step_parser() -> None:
    assert drive.authored_step_position({"Euphoria", "10/14", "Continue"}) == (10, 14)
    assert drive.authored_step_position({"20 steps · 30 XP"}) is None


def assert_graph_evidence_contract() -> None:
    """The device exercise must cover every synthesized IF1 graph control, not just show it."""
    source = Path(solve.__file__).read_text(encoding="utf-8")
    assert "visible = ensure_node_visible(n[4])" in source
    assert "interactive_graph_controls:inflationEroder[3/3]" in source
    assert "interactive_graph_controls:portfolioMixer[5/5]" in source
    assert "interactive_graph_controls:compoundGrowthLab[3/3]" in source
    assert "interactive_graph_controls:{family}[{changed}/{expected}]" in source
    for label in ("2008 crash", "Dot-com bust", "2022 inflation shock"):
        assert label in source
    visible = (10, 120, 100, 40, "control", "AXButton", "")
    behind_footer = (10, 710, 100, 40, "control", "AXButton", "")
    above_viewport = (10, 80, 100, 20, "control", "AXButton", "")
    assert solve.node_is_unobscured(visible)
    assert not solve.node_is_unobscured(behind_footer)
    assert not solve.node_is_unobscured(above_viewport)
    duplicate_labels = [
        (10, 120, 100, 20, "Inflation rate", "AXStaticText", ""),
        (10, 150, 100, 40, "Inflation rate", "AXButton", "4%"),
    ]
    assert solve.accessible_value(duplicate_labels, "Inflation rate") == "4%"
    question = "At 8% a year, roughly how many years does it take for money to double?"
    initial_number_line = [
        (24, 239, 354, 96, question, "AXStaticText", ""),
        (24, 425, 354, 52, question, "AXButton", "No value placed yet"),
    ]
    assert solve.slider_track_node(initial_number_line, question) == initial_number_line[1]
    assert solve.compound_handle_values("8%, 25 years") == (8.0, 25.0)


def assert_slider_track_must_be_visible() -> None:
    question = "$10,000 invested at 10% annual return for 40 years grows to approximately:"
    heading = (17, 256, 368, 96, question, "AXStaticText", "")
    hidden = (17, 776, 368, 52, question, "AXButton", "No value placed yet")
    visible = (17, 442, 368, 52, question, "AXButton", "No value placed yet")
    state = {"scrolled": False}
    old_nodes, old_run, old_sleep = solve.nodes, solve.sp.run, solve.time.sleep

    def fake_run(args, **_kwargs):
        if "swipe" in args:
            state["scrolled"] = True
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    try:
        solve.nodes = lambda: [heading, visible if state["scrolled"] else hidden]
        solve.sp.run, solve.time.sleep = fake_run, lambda _seconds: None
        assert solve.ensure_slider_track_visible(question) == visible
    finally:
        solve.nodes, solve.sp.run, solve.time.sleep = old_nodes, old_run, old_sleep
    assert "slider(unverified)" not in Path(solve.__file__).read_text(encoding="utf-8")


def assert_sequential_true_false_contract() -> None:
    with Path("/tmp/lesson-answers.json").open(encoding="utf-8") as handle:
        lesson = json.load(handle)["investingFundamentals"][1]
    statement = "The S&P 500 has lost money over every 20-year rolling period in history"
    matched = solve.find_truefalse(lesson, [f"Statement 1 of 5. {statement}"])
    assert matched and matched["visibleStatement"] == {"text": statement, "a": False}
    old_nodes, old_button = drive.nodes, drive.button
    try:
        drive.button = REAL_BUTTON
        next_statement = (10, 610, 300, 50, "Next Statement", "AXButton", "")
        finish = (10, 610, 300, 50, "Finish", "AXButton", "")
        drive.nodes = lambda: [next_statement]
        assert drive.post_solve_button() == [next_statement]
        drive.nodes = lambda: [finish]
        assert drive.post_solve_button() == [finish]
    finally:
        drive.nodes, drive.button = old_nodes, old_button


def assert_standard_graph_metadata_contract() -> None:
    with Path("/tmp/lesson-answers.json").open(encoding="utf-8") as handle:
        lesson = json.load(handle)["investingFundamentals"][1]
    graph = solve.find_interactive_graph(
        lesson, ["Conservative vs. Aggressive: 30-Year Comparison"])
    assert graph and graph["graphType"] == "comparison"
    assert [slider["label"] for slider in graph["sliders"]] == ["Stock Allocation", "Time Period"]


def assert_exact_warmup_sequence() -> None:
    labels = ("Warm up", "Curious, let's go", "Yes, let's do it")
    actions = ("warmup:intro", "warmup:primer-1", "warmup:primer-2")
    old_labels, old_nodes, old_tap = drive.labels, drive.nodes, drive.tap
    try:
        for label, action in zip(labels, actions, strict=True):
            # The same canonical pressable has been exposed as AXButton and AXStaticText across
            # stable visual-shell builds. Exact labels make both safe; substring prose is never used.
            role = "AXStaticText" if label == "Warm up" else "AXButton"
            node = (10, 300, 300, 50, label, role, "")
            drive.labels = lambda label=label: {label}
            drive.nodes = lambda node=node: [node]
            tapped = []
            drive.tap = lambda target, _settle=1.6: (tapped.append(target) or True)
            assert drive.advance_warmup() == (True, action)
            assert tapped == [node]
        drive.labels = lambda: {"A real lesson step"}
        assert drive.advance_warmup() is None
    finally:
        drive.labels, drive.nodes, drive.tap = old_labels, old_nodes, old_tap
    source = Path(drive.__file__).read_text(encoding="utf-8")
    assert "target = bring_into_view(btn[0])" in source
    assert "revealed, remaining = reveal_hidden_cards()" in source


def assert_offscreen_reveal_uses_transformed_target() -> None:
    offscreen = (17, 784, 368, 280, "Bear markets. Not revealed yet.", "AXButton", "")
    visible = (17, 276, 368, 280, offscreen[4], "AXButton", "")
    next_screen = (16, 170, 370, 40, "Next screen", "AXStaticText", "")
    state = {"scrolled": False, "tapped": False}
    calls = []
    old_labels, old_nodes, old_run, old_sleep = drive.labels, drive.nodes, drive.sp.run, drive.time.sleep

    def fake_nodes():
        return [next_screen] if state["tapped"] else [visible if state["scrolled"] else offscreen]

    def fake_run(args, **_kwargs):
        calls.append(args)
        if "swipe" in args:
            state["scrolled"] = True
        if "tap" in args:
            state["tapped"] = True
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    try:
        drive.nodes = fake_nodes
        drive.labels = lambda: {node[4] for node in fake_nodes()}
        drive.sp.run, drive.time.sleep = fake_run, lambda _seconds: None
        REAL_TAP(offscreen, 0)
        tap_call = next(args for args in calls if "tap" in args)
        assert tap_call[-2:] == [str(visible[0] + visible[2] // 2), str(visible[1] + visible[3] // 2)]
        assert any("swipe" in args for args in calls)
    finally:
        drive.labels, drive.nodes = old_labels, old_nodes
        drive.sp.run, drive.time.sleep = old_run, old_sleep


def assert_reveal_progress_is_verified() -> None:
    hidden = (17, 420, 368, 280, "Time Value of Money. Not revealed yet.", "AXButton", "")
    revealed = (17, 420, 368, 280, "Time Value of Money. Definition shown.", "AXButton", "")
    state = {"revealed": False}
    old_nodes, old_run, old_sleep = drive.nodes, drive.sp.run, drive.time.sleep

    def fake_nodes():
        return [revealed] if state["revealed"] else [hidden]

    def successful_run(args, **_kwargs):
        if "tap" in args:
            state["revealed"] = True
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    try:
        drive.nodes = fake_nodes
        drive.sp.run, drive.time.sleep = successful_run, lambda _seconds: None
        assert drive.reveal_hidden_cards() == (1, 0)

        state["revealed"] = False
        drive.sp.run = lambda *_args, **_kwargs: SimpleNamespace(returncode=0, stdout="", stderr="")
        assert drive.reveal_hidden_cards() == (0, 1), "a swallowed tap was counted as progress"
    finally:
        drive.nodes = old_nodes
        drive.sp.run, drive.time.sleep = old_run, old_sleep


if __name__ == "__main__":
    assert_answer_metadata()
    solve.demo()
    assert_button_label_priority()
    assert_no_blind_guess()
    assert_lesson_loop_disables_guessing()
    assert_route_escape_is_explicit()
    assert_authored_step_parser()
    assert_graph_evidence_contract()
    assert_slider_track_must_be_visible()
    assert_sequential_true_false_contract()
    assert_standard_graph_metadata_contract()
    assert_exact_warmup_sequence()
    assert_offscreen_reveal_uses_transformed_target()
    assert_reveal_progress_is_verified()
    print("native driver regression: PASS — exact warmup, numeric/tree metadata, no blind guessing, IF1 graph evidence 11/11")
