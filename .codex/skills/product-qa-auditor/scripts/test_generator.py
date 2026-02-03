#!/usr/bin/env python3
"""
Test Generator for Product QA Auditor

Converts exploration findings and PRD requirements into structured test cases.
Generates regression suites and QA progression checklists.
"""

import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class TestType(Enum):
    FUNCTIONAL = "functional"
    UX = "ux"
    INTEGRATION = "integration"
    E2E = "e2e"
    UNIT = "unit"


class Priority(Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class TestCase:
    """Structured test case representation"""
    id: str
    description: str
    test_type: TestType
    priority: Priority
    preconditions: List[str]
    steps: List[str]
    expected_results: List[str]
    tags: List[str]
    estimated_duration: str
    automation_feasible: bool


@dataclass
class TestSuite:
    """Collection of related test cases"""
    name: str
    description: str
    test_cases: List[TestCase]
    coverage_areas: List[str]
    execution_order: List[str]


@dataclass
class QAProgressChecklist:
    """QA implementation progress tracking"""
    identify_what_to_test: bool = False
    select_test_type: bool = False
    write_tests: bool = False
    run_tests: bool = False
    coverage_check: bool = False
    fix_tests: bool = False


class TestGenerator:
    """Generates structured test cases from exploration data and PRD requirements"""
    
    def __init__(self):
        self.test_counter = 1
        self.generated_suites = []
    
    def generate_test_from_screen(self, screen_data: Dict[str, Any], prd_requirements: List[str] = None) -> List[TestCase]:
        """Generate test cases from a single screen exploration"""
        test_cases = []
        url = screen_data.get("url", "")
        elements = screen_data.get("interactive_elements", [])
        errors = screen_data.get("errors_detected", [])
        ux_issues = screen_data.get("ux_observations", [])
        
        # Generate functional tests for interactive elements
        for element in elements:
            if element.get("type") == "button":
                test_case = self._create_button_test(element, url)
                test_cases.append(test_case)
            elif element.get("type") == "input":
                test_case = self._create_input_test(element, url)
                test_cases.append(test_case)
        
        # Generate error handling tests
        for error in errors:
            test_case = self._create_error_test(error, url)
            test_cases.append(test_case)
        
        # Generate UX tests
        for ux_issue in ux_issues:
            test_case = self._create_ux_test(ux_issue, url)
            test_cases.append(test_case)
        
        return test_cases
    
    def _create_button_test(self, element: Dict[str, Any], url: str) -> TestCase:
        """Create test case for button interaction"""
        button_label = element.get("label", "Unknown Button")
        test_id = f"TC-BTN-{self.test_counter:03d}"
        self.test_counter += 1
        
        return TestCase(
            id=test_id,
            description=f"Verify {button_label} button functionality",
            test_type=TestType.FUNCTIONAL,
            priority=Priority.HIGH if "submit" in button_label.lower() or "login" in button_label.lower() else Priority.MEDIUM,
            preconditions=[f"Navigate to {url}", "Ensure page is fully loaded"],
            steps=[
                f"Locate the '{button_label}' button",
                "Verify button is visible and enabled",
                "Click the button",
                "Observe the result"
            ],
            expected_results=[
                "Button should be clickable",
                "Appropriate action should occur (navigation, form submission, etc.)",
                "No error messages should appear"
            ],
            tags=["button", "interaction", "functional"],
            estimated_duration="2 minutes",
            automation_feasible=True
        )
    
    def _create_input_test(self, element: Dict[str, Any], url: str) -> TestCase:
        """Create test case for input field"""
        field_label = element.get("label", "Input Field")
        test_id = f"TC-INPUT-{self.test_counter:03d}"
        self.test_counter += 1
        
        return TestCase(
            id=test_id,
            description=f"Verify {field_label} input field validation",
            test_type=TestType.FUNCTIONAL,
            priority=Priority.HIGH if element.get("required") else Priority.MEDIUM,
            preconditions=[f"Navigate to {url}"],
            steps=[
                f"Locate the '{field_label}' input field",
                "Enter valid data",
                "Enter invalid data (if applicable)",
                "Verify validation behavior"
            ],
            expected_results=[
                "Field should accept valid input",
                "Field should reject invalid input with clear error message",
                "Required field validation should work correctly"
            ],
            tags=["input", "validation", "functional"],
            estimated_duration="3 minutes",
            automation_feasible=True
        )
    
    def _create_error_test(self, error: str, url: str) -> TestCase:
        """Create test case for error condition"""
        test_id = f"TC-ERROR-{self.test_counter:03d}"
        self.test_counter += 1
        
        return TestCase(
            id=test_id,
            description=f"Investigate and resolve: {error}",
            test_type=TestType.FUNCTIONAL,
            priority=Priority.HIGH,
            preconditions=[f"Navigate to {url}"],
            steps=[
                "Reproduce the error condition",
                "Document the exact error message",
                "Identify the root cause",
                "Verify error handling is appropriate"
            ],
            expected_results=[
                "Error should be handled gracefully",
                "User should receive clear feedback",
                "System should remain stable"
            ],
            tags=["error", "bug", "critical"],
            estimated_duration="10 minutes",
            automation_feasible=False
        )
    
    def _create_ux_test(self, ux_issue: str, url: str) -> TestCase:
        """Create test case for UX issue"""
        test_id = f"TC-UX-{self.test_counter:03d}"
        self.test_counter += 1
        
        return TestCase(
            id=test_id,
            description=f"UX Issue: {ux_issue}",
            test_type=TestType.UX,
            priority=Priority.MEDIUM,
            preconditions=[f"Navigate to {url}"],
            steps=[
                "Evaluate the user experience issue",
                "Test with different user scenarios",
                "Assess impact on user workflow",
                "Document improvement recommendations"
            ],
            expected_results=[
                "UX issue should be clearly documented",
                "Impact assessment should be complete",
                "Recommendations should be actionable"
            ],
            tags=["ux", "usability", "improvement"],
            estimated_duration="15 minutes",
            automation_feasible=False
        )
    
    def create_regression_suite(self, test_cases: List[TestCase], suite_name: str) -> TestSuite:
        """Create a regression test suite from test cases"""
        high_priority_cases = [tc for tc in test_cases if tc.priority == Priority.HIGH]
        
        return TestSuite(
            name=suite_name,
            description=f"Regression test suite with {len(test_cases)} test cases",
            test_cases=test_cases,
            coverage_areas=list(set([tag for tc in test_cases for tag in tc.tags])),
            execution_order=[tc.id for tc in high_priority_cases] + [tc.id for tc in test_cases if tc.priority != Priority.HIGH]
        )
    
    def generate_qa_checklist(self, test_suites: List[TestSuite]) -> QAProgressChecklist:
        """Generate QA progression checklist"""
        # For demonstration, mark first two steps as complete
        return QAProgressChecklist(
            identify_what_to_test=True,
            select_test_type=True,
            write_tests=len(test_suites) > 0,
            run_tests=False,
            coverage_check=False,
            fix_tests=False
        )
    
    def export_test_artifacts(self, test_suites: List[TestSuite], checklist: QAProgressChecklist) -> Dict[str, Any]:
        """Export all test artifacts in structured format"""
        return {
            "test_suites": [
                {
                    "name": suite.name,
                    "description": suite.description,
                    "test_cases": [asdict(tc) for tc in suite.test_cases],
                    "coverage_areas": suite.coverage_areas,
                    "execution_order": suite.execution_order
                }
                for suite in test_suites
            ],
            "qa_progress": asdict(checklist),
            "summary": {
                "total_suites": len(test_suites),
                "total_test_cases": sum(len(suite.test_cases) for suite in test_suites),
                "high_priority_tests": sum(
                    len([tc for tc in suite.test_cases if tc.priority == Priority.HIGH])
                    for suite in test_suites
                ),
                "automation_ready": sum(
                    len([tc for tc in suite.test_cases if tc.automation_feasible])
                    for suite in test_suites
                )
            }
        }


def main():
    """Example usage of the test generator"""
    # Mock exploration data
    screen_data = {
        "url": "https://example.com/login",
        "interactive_elements": [
            {"id": "e1", "type": "input", "label": "Email", "required": True},
            {"id": "e2", "type": "input", "label": "Password", "required": True},
            {"id": "e3", "type": "button", "label": "Login", "enabled": True}
        ],
        "errors_detected": ["Login button disabled after correct inputs"],
        "ux_observations": ["Password field missing placeholder text"]
    }
    
    generator = TestGenerator()
    test_cases = generator.generate_test_from_screen(screen_data)
    suite = generator.create_regression_suite(test_cases, "Login Flow Regression")
    checklist = generator.generate_qa_checklist([suite])
    
    artifacts = generator.export_test_artifacts([suite], checklist)
    
    print("Generated Test Artifacts:")
    print(json.dumps(artifacts, indent=2, default=str))


if __name__ == "__main__":
    main()