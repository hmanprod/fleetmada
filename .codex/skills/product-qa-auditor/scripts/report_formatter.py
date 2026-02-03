#!/usr/bin/env python3
"""
Report Formatter for Product QA Auditor

Generates structured reports in multiple formats (JSON, Markdown, HTML) 
for QA teams, developers, and stakeholders.
"""

import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass


@dataclass
class QAProgressStatus:
    """Tracks QA implementation progress"""
    identify_what_to_test: bool = False
    select_test_type: bool = False
    write_tests: bool = False
    run_tests: bool = False
    coverage_check: bool = False
    fix_tests: bool = False
    
    def to_dict(self) -> Dict[str, bool]:
        return {
            "identifyWhatToTest": self.identify_what_to_test,
            "selectTestType": self.select_test_type,
            "writeTests": self.write_tests,
            "runTests": self.run_tests,
            "coverageCheck": self.coverage_check,
            "fixTests": self.fix_tests
        }
    
    def completion_percentage(self) -> float:
        completed = sum([
            self.identify_what_to_test,
            self.select_test_type,
            self.write_tests,
            self.run_tests,
            self.coverage_check,
            self.fix_tests
        ])
        return (completed / 6) * 100


class ReportFormatter:
    """Formats QA audit results into various output formats"""
    
    def __init__(self):
        self.timestamp = datetime.now().isoformat()
    
    def generate_json_report(self, 
                           exploration_data: Dict[str, Any],
                           ux_analysis: Dict[str, Any],
                           test_cases: List[Dict[str, Any]],
                           qa_progress: QAProgressStatus) -> Dict[str, Any]:
        """Generate comprehensive JSON report"""
        
        return {
            "report_metadata": {
                "generated_at": self.timestamp,
                "report_type": "qa_audit",
                "version": "1.0"
            },
            "exploration_summary": {
                "start_url": exploration_data.get("start_url"),
                "screens_explored": exploration_data.get("screens_explored", 0),
                "total_interactions": exploration_data.get("total_interactions", 0),
                "coverage_percentage": exploration_data.get("coverage_percentage", 0.0)
            },
            "screens": exploration_data.get("screens", []),
            "anomalies": exploration_data.get("anomalies", []),
            "ux_analysis": ux_analysis,
            "test_cases_generated": test_cases,
            "qa_progress": qa_progress.to_dict(),
            "summary_statistics": {
                "total_issues_found": len(exploration_data.get("anomalies", [])) + 
                                    ux_analysis.get("ux_analysis_summary", {}).get("total_issues", 0),
                "critical_issues": ux_analysis.get("ux_analysis_summary", {}).get("critical_issues", 0),
                "test_cases_generated": len(test_cases),
                "qa_progress_percentage": qa_progress.completion_percentage()
            }
        }
    
    def generate_markdown_report(self, 
                               exploration_data: Dict[str, Any],
                               ux_analysis: Dict[str, Any],
                               test_cases: List[Dict[str, Any]],
                               qa_progress: QAProgressStatus) -> str:
        """Generate Markdown report for documentation"""
        
        md_content = f"""# QA Audit Report

**Generated:** {self.timestamp}
**Application:** {exploration_data.get('start_url', 'Unknown')}

## Executive Summary

- **Screens Explored:** {exploration_data.get('screens_explored', 0)}
- **Total Interactions:** {exploration_data.get('total_interactions', 0)}
- **Coverage:** {exploration_data.get('coverage_percentage', 0.0):.1f}%
- **Issues Found:** {len(exploration_data.get('anomalies', [])) + ux_analysis.get('ux_analysis_summary', {}).get('total_issues', 0)}
- **Test Cases Generated:** {len(test_cases)}

## QA Progress Status

"""
        
        # Add progress checklist
        progress_items = [
            ("Identify what to test", qa_progress.identify_what_to_test),
            ("Select appropriate test type", qa_progress.select_test_type),
            ("Write tests following templates", qa_progress.write_tests),
            ("Run tests and verify passing", qa_progress.run_tests),
            ("Check coverage meets targets", qa_progress.coverage_check),
            ("Fix any failing tests", qa_progress.fix_tests)
        ]
        
        for item, completed in progress_items:
            status = "✅" if completed else "❌"
            md_content += f"- {status} {item}\n"
        
        md_content += f"\n**Overall Progress:** {qa_progress.completion_percentage():.1f}%\n\n"
        
        # Add functional anomalies
        anomalies = exploration_data.get('anomalies', [])
        if anomalies:
            md_content += "## Functional Anomalies\n\n"
            for i, anomaly in enumerate(anomalies, 1):
                md_content += f"{i}. {anomaly}\n"
            md_content += "\n"
        
        # Add UX issues
        ux_summary = ux_analysis.get('ux_analysis_summary', {})
        if ux_summary.get('total_issues', 0) > 0:
            md_content += "## UX Issues Summary\n\n"
            md_content += f"- **Total Issues:** {ux_summary.get('total_issues', 0)}\n"
            md_content += f"- **Critical Issues:** {ux_summary.get('critical_issues', 0)}\n"
            md_content += f"- **High Priority Issues:** {ux_summary.get('high_priority_issues', 0)}\n"
            md_content += f"- **Categories Affected:** {', '.join(ux_summary.get('categories_affected', []))}\n\n"
            
            # Add immediate fixes
            immediate_fixes = ux_analysis.get('recommendations', {}).get('immediate_fixes', [])
            if immediate_fixes:
                md_content += "### Immediate Fixes Required\n\n"
                for fix in immediate_fixes:
                    md_content += f"- {fix}\n"
                md_content += "\n"
        
        # Add test cases
        if test_cases:
            md_content += "## Generated Test Cases\n\n"
            for test_case in test_cases:
                md_content += f"### {test_case.get('id', 'Unknown ID')}: {test_case.get('description', 'No description')}\n\n"
                md_content += f"**Priority:** {test_case.get('priority', 'Medium')}\n"
                md_content += f"**Type:** {test_case.get('type', 'Functional')}\n\n"
                
                if test_case.get('preconditions'):
                    md_content += f"**Preconditions:** {test_case['preconditions']}\n\n"
                
                steps = test_case.get('steps', [])
                if steps:
                    md_content += "**Steps:**\n"
                    for i, step in enumerate(steps, 1):
                        md_content += f"{i}. {step}\n"
                    md_content += "\n"
                
                expected_results = test_case.get('expected_results', [])
                if expected_results:
                    md_content += "**Expected Results:**\n"
                    for result in expected_results:
                        md_content += f"- {result}\n"
                    md_content += "\n"
                
                md_content += "---\n\n"
        
        # Add exploration details
        screens = exploration_data.get('screens', [])
        if screens:
            md_content += "## Screen Exploration Details\n\n"
            for screen in screens:
                md_content += f"### {screen.get('url', 'Unknown URL')}\n\n"
                
                actions = screen.get('actions_taken', [])
                if actions:
                    md_content += f"**Actions:** {', '.join(actions)}\n"
                
                errors = screen.get('errors_detected', [])
                if errors:
                    md_content += f"**Errors:** {', '.join(errors)}\n"
                
                ux_obs = screen.get('ux_observations', [])
                if ux_obs:
                    md_content += f"**UX Observations:** {', '.join(ux_obs)}\n"
                
                md_content += "\n"
        
        return md_content
    
    def generate_html_report(self, json_report: Dict[str, Any]) -> str:
        """Generate HTML report for stakeholder presentation"""
        
        html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Audit Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
        .header {{ background: #f4f4f4; padding: 20px; border-radius: 5px; }}
        .summary {{ display: flex; justify-content: space-between; margin: 20px 0; }}
        .metric {{ text-align: center; padding: 15px; background: #e9e9e9; border-radius: 5px; }}
        .metric h3 {{ margin: 0; color: #333; }}
        .metric p {{ margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #007cba; }}
        .section {{ margin: 30px 0; }}
        .issue {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0; }}
        .critical {{ border-left-color: #dc3545; background: #f8d7da; }}
        .test-case {{ background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 15px 0; }}
        .progress {{ background: #d4edda; padding: 15px; border-radius: 5px; }}
        .progress-bar {{ background: #28a745; height: 20px; border-radius: 10px; }}
        .progress-fill {{ background: #007cba; height: 100%; border-radius: 10px; transition: width 0.3s; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>QA Audit Report</h1>
        <p><strong>Generated:</strong> {json_report['report_metadata']['generated_at']}</p>
        <p><strong>Application:</strong> {json_report['exploration_summary']['start_url']}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Screens Explored</h3>
            <p>{json_report['exploration_summary']['screens_explored']}</p>
        </div>
        <div class="metric">
            <h3>Coverage</h3>
            <p>{json_report['exploration_summary']['coverage_percentage']:.1f}%</p>
        </div>
        <div class="metric">
            <h3>Issues Found</h3>
            <p>{json_report['summary_statistics']['total_issues_found']}</p>
        </div>
        <div class="metric">
            <h3>Test Cases</h3>
            <p>{json_report['summary_statistics']['test_cases_generated']}</p>
        </div>
    </div>
    
    <div class="section">
        <h2>QA Progress</h2>
        <div class="progress">
            <p><strong>Overall Progress: {json_report['summary_statistics']['qa_progress_percentage']:.1f}%</strong></p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: {json_report['summary_statistics']['qa_progress_percentage']:.1f}%"></div>
            </div>
        </div>
    </div>
"""
        
        # Add issues section
        if json_report.get('anomalies') or json_report.get('ux_analysis', {}).get('ux_analysis_summary', {}).get('total_issues', 0) > 0:
            html_template += """
    <div class="section">
        <h2>Issues Found</h2>
"""
            
            # Add functional anomalies
            for anomaly in json_report.get('anomalies', []):
                html_template += f'        <div class="issue">{anomaly}</div>\n'
            
            # Add critical UX issues
            ux_issues = json_report.get('ux_analysis', {}).get('issues_by_severity', {})
            for critical_issue in ux_issues.get('critical', []):
                html_template += f'        <div class="issue critical"><strong>{critical_issue["title"]}</strong>: {critical_issue["description"]}</div>\n'
            
            html_template += "    </div>\n"
        
        # Add test cases section
        if json_report.get('test_cases_generated'):
            html_template += """
    <div class="section">
        <h2>Generated Test Cases</h2>
"""
            for test_case in json_report['test_cases_generated']:
                html_template += f"""        <div class="test-case">
            <h3>{test_case.get('id', 'Unknown')}: {test_case.get('description', 'No description')}</h3>
            <p><strong>Priority:</strong> {test_case.get('priority', 'Medium')} | <strong>Type:</strong> {test_case.get('type', 'Functional')}</p>
        </div>
"""
            html_template += "    </div>\n"
        
        html_template += """
</body>
</html>"""
        
        return html_template
    
    def save_reports(self, 
                    exploration_data: Dict[str, Any],
                    ux_analysis: Dict[str, Any],
                    test_cases: List[Dict[str, Any]],
                    qa_progress: QAProgressStatus,
                    output_dir: str = ".") -> Dict[str, str]:
        """Save all report formats to files"""
        
        # Generate reports
        json_report = self.generate_json_report(exploration_data, ux_analysis, test_cases, qa_progress)
        markdown_report = self.generate_markdown_report(exploration_data, ux_analysis, test_cases, qa_progress)
        html_report = self.generate_html_report(json_report)
        
        # Save files
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        json_path = f"{output_dir}/qa_audit_report_{timestamp_str}.json"
        md_path = f"{output_dir}/qa_audit_report_{timestamp_str}.md"
        html_path = f"{output_dir}/qa_audit_report_{timestamp_str}.html"
        
        with open(json_path, 'w') as f:
            json.dump(json_report, f, indent=2)
        
        with open(md_path, 'w') as f:
            f.write(markdown_report)
        
        with open(html_path, 'w') as f:
            f.write(html_report)
        
        return {
            "json": json_path,
            "markdown": md_path,
            "html": html_path
        }


def main():
    """Example usage of the report formatter"""
    # Mock data for demonstration
    exploration_data = {
        "start_url": "https://example.com/app",
        "screens_explored": 5,
        "total_interactions": 12,
        "coverage_percentage": 85.0,
        "screens": [
            {
                "url": "https://example.com/login",
                "actions_taken": ["snapshot", "fill email", "fill password", "click login"],
                "errors_detected": [],
                "ux_observations": ["Missing placeholder text on password field"]
            }
        ],
        "anomalies": ["Login button disabled after correct inputs (unexpected)"]
    }
    
    ux_analysis = {
        "ux_analysis_summary": {
            "total_issues": 3,
            "critical_issues": 1,
            "high_priority_issues": 1,
            "categories_affected": ["accessibility", "usability"]
        },
        "recommendations": {
            "immediate_fixes": ["Add proper labels to form fields", "Fix disabled button state"]
        }
    }
    
    test_cases = [
        {
            "id": "TC-LOGIN-001",
            "description": "Valid login flow",
            "priority": "High",
            "type": "Functional",
            "steps": ["Navigate to login page", "Enter valid credentials", "Click login button"],
            "expected_results": ["User successfully logged in", "Redirected to dashboard"]
        }
    ]
    
    qa_progress = QAProgressStatus(
        identify_what_to_test=True,
        select_test_type=True,
        write_tests=True,
        run_tests=False,
        coverage_check=False,
        fix_tests=False
    )
    
    formatter = ReportFormatter()
    
    # Generate and print JSON report
    json_report = formatter.generate_json_report(exploration_data, ux_analysis, test_cases, qa_progress)
    print("JSON Report:")
    print(json.dumps(json_report, indent=2))
    
    print("\n" + "="*50 + "\n")
    
    # Generate and print Markdown report
    md_report = formatter.generate_markdown_report(exploration_data, ux_analysis, test_cases, qa_progress)
    print("Markdown Report:")
    print(md_report)


if __name__ == "__main__":
    main()