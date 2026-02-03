#!/usr/bin/env python3
"""
UX Analyzer for Product QA Auditor

Evaluates user experience using established heuristics and accessibility guidelines.
Provides structured UX audit reports and improvement recommendations.
"""

import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class UXSeverity(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class UXCategory(Enum):
    USABILITY = "usability"
    ACCESSIBILITY = "accessibility"
    CONSISTENCY = "consistency"
    FEEDBACK = "feedback"
    EFFICIENCY = "efficiency"
    ERROR_PREVENTION = "error_prevention"


@dataclass
class UXIssue:
    """Represents a UX issue found during analysis"""
    id: str
    category: UXCategory
    severity: UXSeverity
    title: str
    description: str
    location: str
    heuristic_violated: str
    recommendation: str
    impact_assessment: str
    fix_effort: str


@dataclass
class UXMetrics:
    """Quantitative UX metrics"""
    total_clicks_to_goal: int
    form_completion_complexity: int
    error_message_clarity_score: float
    label_coverage_percentage: float
    accessibility_compliance_score: float
    workflow_efficiency_score: float


class UXAnalyzer:
    """Analyzes user experience based on established heuristics"""
    
    def __init__(self):
        self.issue_counter = 1
        self.heuristics = self._load_ux_heuristics()
    
    def _load_ux_heuristics(self) -> Dict[str, str]:
        """Load UX heuristics for evaluation"""
        return {
            "visibility": "System status should be visible to users",
            "match_real_world": "System should match real-world conventions",
            "user_control": "Users should have control and freedom",
            "consistency": "Maintain consistency and standards",
            "error_prevention": "Prevent errors before they occur",
            "recognition": "Recognition rather than recall",
            "flexibility": "Flexibility and efficiency of use",
            "aesthetic": "Aesthetic and minimalist design",
            "error_recovery": "Help users recognize and recover from errors",
            "help_documentation": "Provide help and documentation"
        }
    
    def analyze_screen(self, screen_data: Dict[str, Any]) -> List[UXIssue]:
        """Analyze a single screen for UX issues"""
        issues = []
        url = screen_data.get("url", "")
        elements = screen_data.get("interactive_elements", [])
        summary = screen_data.get("screenshot_summary", "")
        
        # Analyze form elements
        issues.extend(self._analyze_form_elements(elements, url))
        
        # Analyze navigation and workflow
        issues.extend(self._analyze_navigation(elements, url))
        
        # Analyze feedback mechanisms
        issues.extend(self._analyze_feedback(elements, summary, url))
        
        # Analyze accessibility
        issues.extend(self._analyze_accessibility(elements, url))
        
        # Analyze consistency
        issues.extend(self._analyze_consistency(elements, url))
        
        return issues
    
    def _analyze_form_elements(self, elements: List[Dict[str, Any]], url: str) -> List[UXIssue]:
        """Analyze form elements for UX issues"""
        issues = []
        
        for element in elements:
            if element.get("type") == "input":
                # Check for missing labels
                if not element.get("label"):
                    issues.append(UXIssue(
                        id=f"UX-{self.issue_counter:03d}",
                        category=UXCategory.ACCESSIBILITY,
                        severity=UXSeverity.HIGH,
                        title="Missing Input Label",
                        description=f"Input field {element.get('id')} lacks a descriptive label",
                        location=url,
                        heuristic_violated=self.heuristics["recognition"],
                        recommendation="Add clear, descriptive label for the input field",
                        impact_assessment="Users may not understand the field's purpose",
                        fix_effort="Low - Add label element"
                    ))
                    self.issue_counter += 1
                
                # Check for missing placeholder text
                if not element.get("placeholder") and element.get("required"):
                    issues.append(UXIssue(
                        id=f"UX-{self.issue_counter:03d}",
                        category=UXCategory.USABILITY,
                        severity=UXSeverity.MEDIUM,
                        title="Missing Placeholder Text",
                        description=f"Required field {element.get('label', 'Unknown')} lacks placeholder text",
                        location=url,
                        heuristic_violated=self.heuristics["error_prevention"],
                        recommendation="Add helpful placeholder text to guide user input",
                        impact_assessment="Users may enter incorrect format or leave field empty",
                        fix_effort="Low - Add placeholder attribute"
                    ))
                    self.issue_counter += 1
        
        return issues
    
    def _analyze_navigation(self, elements: List[Dict[str, Any]], url: str) -> List[UXIssue]:
        """Analyze navigation elements for UX issues"""
        issues = []
        
        buttons = [e for e in elements if e.get("type") == "button"]
        links = [e for e in elements if e.get("type") == "link"]
        
        # Check for disabled buttons without explanation
        for button in buttons:
            if not button.get("enabled") and not button.get("disabled_reason"):
                issues.append(UXIssue(
                    id=f"UX-{self.issue_counter:03d}",
                    category=UXCategory.FEEDBACK,
                    severity=UXSeverity.MEDIUM,
                    title="Disabled Button Without Explanation",
                    description=f"Button '{button.get('label')}' is disabled without clear reason",
                    location=url,
                    heuristic_violated=self.heuristics["visibility"],
                    recommendation="Provide tooltip or message explaining why button is disabled",
                    impact_assessment="Users may be confused about why they cannot proceed",
                    fix_effort="Medium - Add explanatory text or tooltip"
                ))
                self.issue_counter += 1
        
        # Check for ambiguous link text
        for link in links:
            label = link.get("label", "").lower()
            if label in ["click here", "read more", "link"]:
                issues.append(UXIssue(
                    id=f"UX-{self.issue_counter:03d}",
                    category=UXCategory.ACCESSIBILITY,
                    severity=UXSeverity.MEDIUM,
                    title="Ambiguous Link Text",
                    description=f"Link text '{link.get('label')}' is not descriptive",
                    location=url,
                    heuristic_violated=self.heuristics["recognition"],
                    recommendation="Use descriptive link text that explains the destination",
                    impact_assessment="Screen readers and users may not understand link purpose",
                    fix_effort="Low - Update link text"
                ))
                self.issue_counter += 1
        
        return issues
    
    def _analyze_feedback(self, elements: List[Dict[str, Any]], summary: str, url: str) -> List[UXIssue]:
        """Analyze feedback mechanisms"""
        issues = []
        
        # Check for error messages in summary
        if "error" in summary.lower() and "clear" not in summary.lower():
            issues.append(UXIssue(
                id=f"UX-{self.issue_counter:03d}",
                category=UXCategory.FEEDBACK,
                severity=UXSeverity.HIGH,
                title="Unclear Error Message",
                description="Error message detected but may not be clear to users",
                location=url,
                heuristic_violated=self.heuristics["error_recovery"],
                recommendation="Ensure error messages are specific and actionable",
                impact_assessment="Users may not understand how to fix the error",
                fix_effort="Medium - Improve error message content"
            ))
            self.issue_counter += 1
        
        return issues
    
    def _analyze_accessibility(self, elements: List[Dict[str, Any]], url: str) -> List[UXIssue]:
        """Analyze accessibility compliance"""
        issues = []
        
        # Check for form elements without labels (accessibility issue)
        unlabeled_inputs = [e for e in elements if e.get("type") == "input" and not e.get("label")]
        
        if unlabeled_inputs:
            issues.append(UXIssue(
                id=f"UX-{self.issue_counter:03d}",
                category=UXCategory.ACCESSIBILITY,
                severity=UXSeverity.CRITICAL,
                title="WCAG Violation: Unlabeled Form Controls",
                description=f"{len(unlabeled_inputs)} form controls lack proper labels",
                location=url,
                heuristic_violated="WCAG 2.1 - Labels or Instructions",
                recommendation="Associate labels with form controls using for/id attributes",
                impact_assessment="Screen readers cannot identify form fields",
                fix_effort="Medium - Add proper label associations"
            ))
            self.issue_counter += 1
        
        return issues
    
    def _analyze_consistency(self, elements: List[Dict[str, Any]], url: str) -> List[UXIssue]:
        """Analyze consistency across elements"""
        issues = []
        
        # Check button labeling consistency
        buttons = [e for e in elements if e.get("type") == "button"]
        button_labels = [b.get("label", "").lower() for b in buttons]
        
        # Look for inconsistent action words
        if "submit" in button_labels and "send" in button_labels:
            issues.append(UXIssue(
                id=f"UX-{self.issue_counter:03d}",
                category=UXCategory.CONSISTENCY,
                severity=UXSeverity.LOW,
                title="Inconsistent Button Labeling",
                description="Mixed use of 'Submit' and 'Send' for similar actions",
                location=url,
                heuristic_violated=self.heuristics["consistency"],
                recommendation="Use consistent terminology for similar actions",
                impact_assessment="Users may be confused by inconsistent language",
                fix_effort="Low - Standardize button labels"
            ))
            self.issue_counter += 1
        
        return issues
    
    def calculate_ux_metrics(self, screen_data: Dict[str, Any], workflow_data: Dict[str, Any] = None) -> UXMetrics:
        """Calculate quantitative UX metrics"""
        elements = screen_data.get("interactive_elements", [])
        
        # Calculate label coverage
        total_inputs = len([e for e in elements if e.get("type") == "input"])
        labeled_inputs = len([e for e in elements if e.get("type") == "input" and e.get("label")])
        label_coverage = (labeled_inputs / total_inputs * 100) if total_inputs > 0 else 100
        
        # Mock other metrics for demonstration
        return UXMetrics(
            total_clicks_to_goal=workflow_data.get("clicks", 3) if workflow_data else 3,
            form_completion_complexity=total_inputs,
            error_message_clarity_score=7.5,  # Mock score
            label_coverage_percentage=label_coverage,
            accessibility_compliance_score=85.0,  # Mock score
            workflow_efficiency_score=8.2  # Mock score
        )
    
    def generate_ux_report(self, issues: List[UXIssue], metrics: UXMetrics) -> Dict[str, Any]:
        """Generate comprehensive UX analysis report"""
        # Group issues by category and severity
        issues_by_category = {}
        issues_by_severity = {}
        
        for issue in issues:
            category = issue.category.value
            severity = issue.severity.value
            
            if category not in issues_by_category:
                issues_by_category[category] = []
            issues_by_category[category].append(asdict(issue))
            
            if severity not in issues_by_severity:
                issues_by_severity[severity] = []
            issues_by_severity[severity].append(asdict(issue))
        
        return {
            "ux_analysis_summary": {
                "total_issues": len(issues),
                "critical_issues": len([i for i in issues if i.severity == UXSeverity.CRITICAL]),
                "high_priority_issues": len([i for i in issues if i.severity == UXSeverity.HIGH]),
                "categories_affected": list(issues_by_category.keys())
            },
            "issues_by_category": issues_by_category,
            "issues_by_severity": issues_by_severity,
            "ux_metrics": asdict(metrics),
            "recommendations": {
                "immediate_fixes": [
                    issue.recommendation for issue in issues 
                    if issue.severity in [UXSeverity.CRITICAL, UXSeverity.HIGH]
                ],
                "improvement_opportunities": [
                    issue.recommendation for issue in issues 
                    if issue.severity in [UXSeverity.MEDIUM, UXSeverity.LOW]
                ]
            }
        }


def main():
    """Example usage of the UX analyzer"""
    # Mock screen data
    screen_data = {
        "url": "https://example.com/login",
        "interactive_elements": [
            {"id": "e1", "type": "input", "required": True},  # Missing label
            {"id": "e2", "type": "input", "label": "Password", "required": True},
            {"id": "e3", "type": "button", "label": "Login", "enabled": False},  # Disabled without reason
            {"id": "e4", "type": "link", "label": "Click here"}  # Ambiguous link text
        ],
        "screenshot_summary": "Login page with error message displayed"
    }
    
    analyzer = UXAnalyzer()
    issues = analyzer.analyze_screen(screen_data)
    metrics = analyzer.calculate_ux_metrics(screen_data)
    report = analyzer.generate_ux_report(issues, metrics)
    
    print("UX Analysis Report:")
    print(json.dumps(report, indent=2, default=str))


if __name__ == "__main__":
    main()