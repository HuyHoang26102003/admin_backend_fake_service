@echo off
echo Starting FlashFood Database Population...
echo ===============================================
echo.
echo Phase 1: Testing current database state...
node test-structured-approach.js
echo.
echo Phase 2: Running structured population...
node structured-database-populator.js
pause 