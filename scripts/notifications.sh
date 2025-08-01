#!/bin/bash

# AI Marketplace Platform - Notification System
# Functions for macOS notifications when Claude Code completes tasks or needs approval

# Task completion notification with sound
notify_task_complete() {
    local task_name="${1:-Task}"
    local sound="${2:-Glass}"
    osascript -e "display notification \"✅ ${task_name} completed successfully!\" with title \"Claude Code - AI Marketplace\" sound name \"${sound}\""
}

# Need approval notification with sound
notify_need_approval() {
    local message="${1:-Waiting for your approval}"
    local sound="${2:-Ping}"
    osascript -e "display notification \"⚠️ ${message}\" with title \"Claude Code - Need Input\" sound name \"${sound}\""
}

# General notification with custom message
notify_custom() {
    local message="${1:-Notification}"
    local title="${2:-Claude Code}"
    local sound="${3:-Glass}"
    osascript -e "display notification \"${message}\" with title \"${title}\" sound name \"${sound}\""
}

# QA testing complete notification
notify_qa_complete() {
    local status="${1:-PASS}"
    local sound="Glass"
    if [ "$status" = "FAIL" ]; then
        sound="Sosumi"
    fi
    osascript -e "display notification \"🧪 QA Testing Complete - Status: ${status}\" with title \"Claude Code - QA Results\" sound name \"${sound}\""
}

# Phase completion notification
notify_phase_complete() {
    local phase="${1:-Phase}"
    local sound="Blow"
    osascript -e "display notification \"🎉 ${phase} completed successfully! Ready for next phase.\" with title \"Claude Code - Milestone\" sound name \"${sound}\""
}

# Error notification
notify_error() {
    local error_msg="${1:-An error occurred}"
    local sound="Sosumi"
    osascript -e "display notification \"❌ ${error_msg}\" with title \"Claude Code - Error\" sound name \"${sound}\""
}

# Available sound names for reference:
# Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink

# Test all notification types
test_notifications() {
    echo "Testing notification system..."
    notify_custom "Testing notification system" "Claude Code - Test" "Tink"
    sleep 2
    notify_task_complete "Test Task" "Glass"
    sleep 2
    notify_need_approval "Test approval request" "Ping"
    sleep 2
    notify_qa_complete "PASS" 
    sleep 2
    notify_phase_complete "Test Phase"
    echo "✅ All notifications tested!"
}

# Export functions for use in other scripts
export -f notify_task_complete
export -f notify_need_approval
export -f notify_custom
export -f notify_qa_complete
export -f notify_phase_complete
export -f notify_error