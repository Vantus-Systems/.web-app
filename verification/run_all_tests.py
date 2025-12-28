#!/usr/bin/env python3
"""
Master Test Runner for Mary Esther Bingo Verification Suite

Executes all verification scripts sequentially with comprehensive reporting.
Provides summary of pass/fail status and generates a verification report.

Usage: python3 run_all_tests.py
"""

import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Tuple, List

SCRIPT_DIR = Path(__file__).parent
SCRIPTS = [
    ("capture_fortune10000_screenshots.py", "Screenshot Capture Suite"),
    ("verify_admin_progressives.py", "Admin Progressives Verification"),
    ("verify_admin.py", "Admin Users Management"),
    ("verify_pricing_and_nav.py", "Pricing & Navigation"),
    ("verify_w2g_signature.py", "W-2G Signature Form"),
]

class TestRunner:
    def __init__(self):
        self.start_time = datetime.now()
        self.results = []
        self.total_passed = 0
        self.total_failed = 0

    def run_script(self, script_path: str, script_name: str) -> Tuple[bool, str]:
        """Run a single verification script."""
        full_path = SCRIPT_DIR / script_path
        
        if not full_path.exists():
            return False, f"Script not found: {full_path}"
        
        try:
            print(f"\n{'=' * 70}")
            print(f"▶️  Running: {script_name}")
            print(f"   Script: {script_path}")
            print(f"{'=' * 70}\n")
            
            # Run script
            result = subprocess.run(
                ["python3", str(full_path)],
                cwd=str(SCRIPT_DIR),
                capture_output=False,
                text=True,
                timeout=300  # 5 minute timeout per script
            )
            
            success = result.returncode == 0
            message = f"Exit code: {result.returncode}"
            
            return success, message
            
        except subprocess.TimeoutExpired:
            return False, "Script execution timed out (5 minutes)"
        except Exception as e:
            return False, f"Error running script: {str(e)}"

    def run_all(self) -> int:
        """Run all verification scripts."""
        print("\n")
        print("╔" + "=" * 68 + "╗")
        print("║" + " " * 68 + "║")
        print("║" + "MARY ESTHER BINGO - VERIFICATION TEST SUITE".center(68) + "║")
        print("║" + "Fortune-1000 Production Ready".center(68) + "║")
        print("║" + " " * 68 + "║")
        print("╚" + "=" * 68 + "╝")
        print(f"\nStart Time: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Test Environment: http://localhost:3001")
        print(f"Python Version: {sys.version.split()[0]}")
        
        # Run all scripts
        for script_path, script_name in SCRIPTS:
            success, message = self.run_script(script_path, script_name)
            
            if success:
                self.total_passed += 1
                status = "✅ PASSED"
            else:
                self.total_failed += 1
                status = "❌ FAILED"
            
            self.results.append({
                "name": script_name,
                "path": script_path,
                "success": success,
                "message": message
            })
        
        # Print summary
        self.print_summary()
        
        # Return exit code
        return 0 if self.total_failed == 0 else 1

    def print_summary(self):
        """Print comprehensive test summary."""
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        print("\n")
        print("╔" + "=" * 68 + "╗")
        print("║" + " " * 68 + "║")
        print("║" + "TEST EXECUTION SUMMARY".center(68) + "║")
        print("║" + " " * 68 + "║")
        print("╚" + "=" * 68 + "╝")
        
        # Results table
        print("\n📊 Test Results:\n")
        for result in self.results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"{status} | {result['name']}")
            if not result["success"]:
                print(f"         {result['message']}")
        
        # Statistics
        print("\n" + "=" * 70)
        print("📈 STATISTICS")
        print("=" * 70)
        print(f"Total Tests: {len(self.results)}")
        print(f"✅ Passed:   {self.total_passed}")
        print(f"❌ Failed:   {self.total_failed}")
        print(f"Duration:   {duration:.1f} seconds")
        print(f"End Time:   {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Final status
        print("\n" + "=" * 70)
        if self.total_failed == 0:
            print("✅ ALL TESTS PASSED - READY FOR CLIENT DELIVERY")
        else:
            print(f"❌ {self.total_failed} TEST(S) FAILED - REVIEW REQUIRED")
        print("=" * 70)
        
        # Instructions
        print("\n📋 Next Steps:")
        if self.total_failed == 0:
            print("  1. Review all screenshots in verification/ directory")
            print("  2. Archive screenshots for client delivery")
            print("  3. Include README.md with deliverables")
            print("  4. Prepare deployment package")
        else:
            print("  1. Review failed test output above")
            print("  2. Check screenshots for rendering issues")
            print("  3. Verify dev server is running (http://localhost:3001)")
            print("  4. Fix issues and re-run tests")
        
        print("\n")

if __name__ == "__main__":
    runner = TestRunner()
    exit_code = runner.run_all()
    sys.exit(exit_code)
