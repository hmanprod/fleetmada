#!/usr/bin/env python3
"""
Exploration Engine for Product QA Auditor

Handles automated web application navigation and interaction using agent-browser.
Implements systematic exploration strategies and captures comprehensive state data.
"""

import json
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict


@dataclass
class ScreenCapture:
    """Represents a captured screen state during exploration"""
    url: str
    timestamp: str
    actions_taken: List[str]
    interactive_elements: List[Dict[str, Any]]
    errors_detected: List[str]
    ux_observations: List[str]
    screenshot_summary: str


@dataclass
class ExplorationSession:
    """Manages the overall exploration session state"""
    start_url: str
    session_id: str
    screens_visited: List[ScreenCapture]
    navigation_tree: Dict[str, Any]
    total_interactions: int
    coverage_percentage: float


class ExplorationEngine:
    """Core engine for automated web application exploration"""
    
    def __init__(self, start_url: str, max_depth: int = 5):
        self.start_url = start_url
        self.max_depth = max_depth
        self.visited_urls = set()
        self.interaction_queue = []
        self.current_session = None
        
    def initialize_session(self) -> ExplorationSession:
        """Initialize a new exploration session"""
        session_id = f"qa_audit_{int(time.time())}"
        self.current_session = ExplorationSession(
            start_url=self.start_url,
            session_id=session_id,
            screens_visited=[],
            navigation_tree={},
            total_interactions=0,
            coverage_percentage=0.0
        )
        return self.current_session
    
    def execute_agent_browser_command(self, command: str) -> Dict[str, Any]:
        """
        Execute agent-browser command and return structured result
        
        In actual implementation, this would interface with the real agent-browser system.
        For now, this provides a structured interface for command execution.
        """
        print(f"🤖 Agent-Browser Command: {command}")
        
        # Parse command type
        if command.startswith("agent-browser open"):
            url = command.split("agent-browser open ")[-1].strip()
            return {
                "status": "success", 
                "action": "page_loaded", 
                "url": url,
                "message": f"Successfully loaded {url}"
            }
        elif command.startswith("agent-browser snapshot"):
            return {
                "status": "success", 
                "action": "snapshot_taken",
                "elements": self._get_page_elements(),
                "summary": self._get_page_summary(),
                "message": "Page snapshot captured successfully"
            }
        elif command.startswith("agent-browser click"):
            element_id = command.split("@e")[-1].strip()
            return {
                "status": "success", 
                "action": "element_clicked", 
                "element_id": element_id,
                "result": self._simulate_click_result(element_id),
                "message": f"Clicked element @e{element_id}"
            }
        elif command.startswith("agent-browser fill"):
            parts = command.split("agent-browser fill ")[-1].split(" ", 1)
            element_id = parts[0].replace("@e", "").strip()
            value = parts[1].strip('"') if len(parts) > 1 else ""
            return {
                "status": "success", 
                "action": "field_filled", 
                "element_id": element_id,
                "value": value,
                "result": "value_entered",
                "message": f"Filled element @e{element_id} with '{value}'"
            }
        
        return {"status": "error", "message": f"Unknown command: {command}"}
    
    def _get_page_elements(self) -> List[Dict[str, Any]]:
        """Get interactive elements from current page (simulated)"""
        return [
            {"id": "1", "type": "input", "label": "Email", "required": True, "placeholder": "Enter your email"},
            {"id": "2", "type": "input", "label": "Password", "required": True, "placeholder": ""},
            {"id": "3", "type": "button", "label": "Login", "enabled": True, "primary": True},
            {"id": "4", "type": "link", "label": "Forgot Password", "href": "/reset"},
            {"id": "5", "type": "link", "label": "Sign Up", "href": "/register"}
        ]
    
    def _get_page_summary(self) -> str:
        """Get summary of current page content (simulated)"""
        return "Login page with email and password input fields, login button, and links for password reset and registration"
    
    def _simulate_click_result(self, element_id: str) -> str:
        """Simulate the result of clicking an element"""
        click_results = {
            "3": "navigation_occurred",  # Login button
            "4": "navigation_occurred",  # Forgot password link
            "5": "navigation_occurred",  # Sign up link
        }
        return click_results.get(element_id, "no_change")
    
    def _mock_interactive_elements(self) -> List[Dict[str, Any]]:
        """Mock interactive elements for demonstration (deprecated - use _get_page_elements)"""
        return self._get_page_elements()
    
    def explore_current_page(self, url: str) -> ScreenCapture:
        """Explore and analyze the current page"""
        print(f"🔍 Exploring page: {url}")
        
        # Take snapshot to get current page state
        snapshot_result = self.execute_agent_browser_command("agent-browser snapshot")
        
        if snapshot_result["status"] != "success":
            print(f"❌ Failed to take snapshot: {snapshot_result.get('message')}")
            return ScreenCapture(
                url=url,
                timestamp=str(int(time.time())),
                actions_taken=["snapshot_failed"],
                interactive_elements=[],
                errors_detected=[f"Snapshot failed: {snapshot_result.get('message')}"],
                ux_observations=[],
                screenshot_summary="Failed to capture page"
            )
        
        # Analyze interactive elements
        elements = snapshot_result.get("elements", [])
        print(f"📋 Found {len(elements)} interactive elements")
        
        # Detect UX issues using established heuristics
        ux_observations = self._analyze_ux_issues(elements)
        print(f"🎨 Identified {len(ux_observations)} UX observations")
        
        # Detect functional errors
        errors = self._detect_functional_errors(snapshot_result)
        print(f"🐛 Detected {len(errors)} functional errors")
        
        # Create comprehensive screen capture record
        screen = ScreenCapture(
            url=url,
            timestamp=str(int(time.time())),
            actions_taken=["snapshot"],
            interactive_elements=elements,
            errors_detected=errors,
            ux_observations=ux_observations,
            screenshot_summary=snapshot_result.get("summary", "")
        )
        
        return screen
    
    def _analyze_ux_issues(self, elements: List[Dict[str, Any]]) -> List[str]:
        """Analyze elements for UX issues"""
        issues = []
        
        for element in elements:
            # Check for missing labels
            if element.get("type") == "input" and not element.get("label"):
                issues.append(f"Input field missing label: {element.get('id')}")
            
            # Check for disabled buttons without explanation
            if element.get("type") == "button" and not element.get("enabled"):
                issues.append(f"Button disabled without clear reason: {element.get('label')}")
        
        return issues
    
    def _detect_functional_errors(self, snapshot_result: Dict[str, Any]) -> List[str]:
        """Detect functional errors from snapshot"""
        errors = []
        
        # Check for error indicators in the snapshot
        summary = snapshot_result.get("summary", "").lower()
        if "error" in summary or "failed" in summary:
            errors.append("Error message detected on page")
        
        return errors
    
    def plan_interactions(self, elements: List[Dict[str, Any]]) -> List[str]:
        """Plan interaction sequence for current page"""
        interactions = []
        
        # Fill form fields first
        for element in elements:
            if element.get("type") == "input":
                interactions.append(f"agent-browser fill @e{element['id']} \"test_value\"")
        
        # Then click buttons and links
        for element in elements:
            if element.get("type") in ["button", "link"]:
                interactions.append(f"agent-browser click @e{element['id']}")
        
        return interactions
    
    def execute_exploration(self) -> ExplorationSession:
        """Execute complete exploration workflow"""
        session = self.initialize_session()
        
        # Start exploration
        self.execute_agent_browser_command(f"agent-browser open {self.start_url}")
        
        # Explore starting page
        initial_screen = self.explore_current_page(self.start_url)
        session.screens_visited.append(initial_screen)
        
        # Plan and execute interactions
        interactions = self.plan_interactions(initial_screen.interactive_elements)
        
        for interaction in interactions[:3]:  # Limit for demo
            result = self.execute_agent_browser_command(interaction)
            session.total_interactions += 1
            
            # If navigation occurred, explore new page
            if result.get("result") == "navigation_occurred":
                new_url = f"{self.start_url}/dashboard"  # Mock new URL
                if new_url not in self.visited_urls:
                    self.visited_urls.add(new_url)
                    new_screen = self.explore_current_page(new_url)
                    session.screens_visited.append(new_screen)
        
        # Calculate coverage
        session.coverage_percentage = min(100.0, len(session.screens_visited) * 20)
        
        return session
    
    def generate_exploration_report(self, session: ExplorationSession) -> Dict[str, Any]:
        """Generate comprehensive exploration report"""
        all_anomalies = []
        all_ux_observations = []
        
        for screen in session.screens_visited:
            all_anomalies.extend(screen.errors_detected)
            all_ux_observations.extend(screen.ux_observations)
        
        return {
            "session_id": session.session_id,
            "start_url": session.start_url,
            "screens_explored": len(session.screens_visited),
            "total_interactions": session.total_interactions,
            "coverage_percentage": session.coverage_percentage,
            "screens": [asdict(screen) for screen in session.screens_visited],
            "anomalies": all_anomalies,
            "ux_observations": all_ux_observations,
            "exploration_complete": True
        }


def main():
    """Example usage of the exploration engine"""
    engine = ExplorationEngine("https://example.com/app")
    session = engine.execute_exploration()
    report = engine.generate_exploration_report(session)
    
    print("Exploration Report:")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
