#!/usr/bin/env python3

################################################################################
# GitHub Actions to GCP Integration - GitHub Variables Setup
################################################################################
# This script adds the GCP configuration to GitHub Repository Variables
# Requires: PyGithub library and GitHub Personal Access Token
# Usage: ./setup_github_vars.py <github-token> <gcp-project-id> \
#        <workload-identity-provider> <service-account-email>
################################################################################

import sys
import os
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed."""
    try:
        import github
        return True
    except ImportError:
        print("ERROR: PyGithub is not installed")
        print("Install it with: pip install PyGithub")
        return False

def setup_github_variables(token, project_id, wif_provider, service_account):
    """Setup GitHub repository variables using REST API."""
    import subprocess
    
    repo_owner = "jhderojasUVa"
    repo_name = "randomfuckwork"
    
    print("\n" + "="*50)
    print("Setting up GitHub Repository Variables")
    print("="*50)
    
    variables = {
        "GCP_PROJECT_ID": project_id,
        "GCP_WORKLOAD_IDENTITY_PROVIDER": wif_provider,
        "GCP_SERVICE_ACCOUNT_EMAIL": service_account
    }
    
    print(f"\nRepository: {repo_owner}/{repo_name}\n")
    
    for var_name, var_value in variables.items():
        print(f"Setting {var_name}...")
        
        # Use GitHub CLI if available
        try:
            result = subprocess.run(
                ["gh", "variable", "set", var_name, "-b", var_value, 
                 "-R", f"{repo_owner}/{repo_name}"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                print(f"✓ Successfully set {var_name}")
            else:
                print(f"✗ Failed to set {var_name}")
                print(f"  Error: {result.stderr}")
                return False
        except FileNotFoundError:
            print("⚠ GitHub CLI (gh) not found. Using alternative method...")
            print("  Install GitHub CLI from: https://cli.github.com/")
            return False
    
    print("\n" + "="*50)
    print("✓ All variables set successfully!")
    print("="*50)
    return True

def main():
    """Main entry point."""
    if len(sys.argv) < 5:
        print("Usage: ./setup_github_vars.py <gcp-project-id> \\")
        print("       <workload-identity-provider> <service-account-email>")
        print("")
        print("Example:")
        print("  ./setup_github_vars.py my-project-123 \\")
        print("    'projects/123456/locations/global/workloadIdentityPools/github-pool/providers/github-provider' \\")
        print("    'github-actions-sa@my-project-123.iam.gserviceaccount.com'")
        sys.exit(1)
    
    project_id = sys.argv[1]
    wif_provider = sys.argv[2]
    service_account = sys.argv[3]
    
    if not check_dependencies():
        print("\nYou can set variables manually at:")
        print("  GitHub: Settings → Secrets and variables → Actions → Variables")
        sys.exit(1)
    
    success = setup_github_variables(None, project_id, wif_provider, service_account)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
