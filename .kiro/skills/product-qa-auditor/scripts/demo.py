#!/usr/bin/env python3
"""
Product QA Auditor Demo

Demonstrates the complete QA audit workflow using agent-browser integration.
This shows how all components work together to audit a web application.
"""

import json
from exploration_engine import ExplorationEngine
from ux_analyzer import UXAnalyzer
from test_generator import TestGenerator
from report_formatter import ReportFormatter, QAProgressStatus


def run_complete_qa_audit(start_url: str) -> None:
    """Run a complete QA audit demonstration"""
    print("🚀 Starting Product QA Audit Demo")
    print(f"📍 Target URL: {start_url}")
    print("=" * 60)
    
    # Step 1: Initialize exploration engine
    print("\n📋 Step 1: Initializing Exploration Engine")
    engine = ExplorationEngine(start_url, max_depth=3)
    
    # Step 2: Execute exploration
    print("\n🔍 Step 2: Executing Application Exploration")
    session = engine.execute_exploration()
    exploration_report = engine.generate_exploration_report(session)
    
    print(f"✅ Exploration Complete:")
    print(f"   - Screens explored: {exploration_report['screens_explored']}")
    print(f"   - Total interactions: {exploration_report['total_interactions']}")
    print(f"   - Coverage: {exploration_report['coverage_percentage']:.1f}%")
    print(f"   - Anomalies found: {len(exploration_report['anomalies'])}")
    
    # Step 3: UX Analysis
    print("\n🎨 Step 3: Conducting UX Analysis")
    ux_analyzer = UXAnalyzer()
    all_ux_issues = []
    
    for screen in exploration_report['screens']:
        screen_issues = ux_analyzer.analyze_screen(screen)
        all_ux_issues.extend(screen_issues)
    
    # Calculate UX metrics
    if exploration_report['screens']:
        ux_metrics = ux_analyzer.calculate_ux_metrics(exploration_report['screens'][0])
        ux_report = ux_analyzer.generate_ux_report(all_ux_issues, ux_metrics)
        
        print(f"✅ UX Analysis Complete:")
        print(f"   - Total UX issues: {len(all_ux_issues)}")
        print(f"   - Critical issues: {ux_report['ux_analysis_summary']['critical_issues']}")
        print(f"   - Label coverage: {ux_metrics.label_coverage_percentage:.1f}%")
    else:
        ux_report = {"ux_analysis_summary": {"total_issues": 0, "critical_issues": 0}}
    
    # Step 4: Test Case Generation
    print("\n📝 Step 4: Generating Test Cases")
    test_generator = TestGenerator()
    
    # Generate tests from exploration findings
    test_cases = []
    for screen in exploration_report['screens']:
        screen_tests = test_generator.generate_tests_from_screen(screen)
        test_cases.extend(screen_tests)
    
    # Generate tests from UX issues
    for issue in all_ux_issues:
        ux_test = test_generator.generate_ux_test_case(issue)
        if ux_test:
            test_cases.append(ux_test)
    
    print(f"✅ Test Generation Complete:")
    print(f"   - Test cases generated: {len(test_cases)}")
    print(f"   - Functional tests: {len([t for t in test_cases if t.get('test_type') == 'functional'])}")
    print(f"   - UX tests: {len([t for t in test_cases if t.get('test_type') == 'ux'])}")
    
    # Step 5: QA Progress Tracking
    print("\n📊 Step 5: QA Progress Assessment")
    qa_progress = QAProgressStatus(
        identify_what_to_test=True,  # We identified tests from exploration
        select_test_type=True,       # We categorized tests by type
        write_tests=True,            # We generated structured test cases
        run_tests=False,             # Tests not executed yet
        coverage_check=False,        # Coverage not validated yet
        fix_tests=False              # No test fixes needed yet
    )
    
    print(f"✅ QA Progress Status:")
    print(f"   - Overall progress: {qa_progress.completion_percentage():.1f}%")
    print(f"   - Tests identified: ✅")
    print(f"   - Test types selected: ✅")
    print(f"   - Tests written: ✅")
    print(f"   - Tests executed: ❌ (Next step)")
    print(f"   - Coverage validated: ❌ (Next step)")
    print(f"   - Tests fixed: ❌ (Next step)")
    
    # Step 6: Generate Reports
    print("\n📄 Step 6: Generating QA Reports")
    formatter = ReportFormatter()
    
    # Generate comprehensive JSON report
    json_report = formatter.generate_json_report(
        exploration_report, ux_report, test_cases, qa_progress
    )
    
    # Generate Markdown report
    markdown_report = formatter.generate_markdown_report(
        exploration_report, ux_report, test_cases, qa_progress
    )
    
    print(f"✅ Report Generation Complete:")
    print(f"   - JSON report: {len(json.dumps(json_report))} characters")
    print(f"   - Markdown report: {len(markdown_report)} characters")
    print(f"   - HTML report: Available")
    
    # Step 7: Summary and Next Steps
    print("\n🎯 Step 7: Audit Summary and Recommendations")
    print("=" * 60)
    
    total_issues = len(exploration_report['anomalies']) + len(all_ux_issues)
    critical_issues = ux_report['ux_analysis_summary']['critical_issues']
    
    print(f"📊 AUDIT RESULTS SUMMARY:")
    print(f"   🔍 Application Coverage: {exploration_report['coverage_percentage']:.1f}%")
    print(f"   🐛 Total Issues Found: {total_issues}")
    print(f"   🚨 Critical Issues: {critical_issues}")
    print(f"   📝 Test Cases Generated: {len(test_cases)}")
    print(f"   📈 QA Progress: {qa_progress.completion_percentage():.1f}%")
    
    print(f"\n🎯 IMMEDIATE ACTIONS REQUIRED:")
    if critical_issues > 0:
        print(f"   ⚠️  Fix {critical_issues} critical UX issues")
    if exploration_report['anomalies']:
        print(f"   🐛 Investigate {len(exploration_report['anomalies'])} functional anomalies")
    print(f"   🧪 Execute {len(test_cases)} generated test cases")
    print(f"   📊 Validate test coverage meets targets")
    
    print(f"\n📋 NEXT STEPS:")
    print(f"   1. Review and prioritize identified issues")
    print(f"   2. Execute generated test cases")
    print(f"   3. Fix failing tests and critical issues")
    print(f"   4. Validate coverage meets quality gates")
    print(f"   5. Obtain stakeholder sign-off")
    
    print("\n✅ QA Audit Demo Complete!")
    print("📁 All reports and test cases are ready for team review.")
    
    return {
        "exploration_report": exploration_report,
        "ux_report": ux_report,
        "test_cases": test_cases,
        "qa_progress": qa_progress,
        "json_report": json_report,
        "markdown_report": markdown_report
    }


def main():
    """Run the demo with example URL"""
    demo_url = "https://staging.example.com/app"
    
    print("🎭 Product QA Auditor - Complete Workflow Demo")
    print("This demo shows how the skill audits web applications using agent-browser")
    print()
    
    try:
        results = run_complete_qa_audit(demo_url)
        
        # Show sample test case
        if results["test_cases"]:
            print("\n📋 SAMPLE GENERATED TEST CASE:")
            print("-" * 40)
            sample_test = results["test_cases"][0]
            print(f"ID: {sample_test.get('id')}")
            print(f"Description: {sample_test.get('description')}")
            print(f"Type: {sample_test.get('test_type')}")
            print(f"Priority: {sample_test.get('priority')}")
            print(f"Steps: {len(sample_test.get('steps', []))} steps")
            print(f"Expected Results: {len(sample_test.get('expected_results', []))} outcomes")
        
        # Show sample UX issue
        if results["ux_report"].get("issues_by_severity", {}).get("high"):
            print("\n🎨 SAMPLE UX ISSUE FOUND:")
            print("-" * 40)
            sample_issue = results["ux_report"]["issues_by_severity"]["high"][0]
            print(f"Title: {sample_issue.get('title')}")
            print(f"Description: {sample_issue.get('description')}")
            print(f"Recommendation: {sample_issue.get('recommendation')}")
            print(f"Impact: {sample_issue.get('impact_assessment')}")
        
    except Exception as e:
        print(f"❌ Demo failed: {str(e)}")
        print("This is expected in demo mode - real agent-browser integration required")


if __name__ == "__main__":
    main()