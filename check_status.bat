@echo off
git status > git_status.txt 2>&1
git branch -a >> git_status.txt 2>&1
echo Done >> git_status.txt
