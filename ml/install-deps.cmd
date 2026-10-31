@echo off
set URL=https://files.pythonhosted.org/packages/8f/a2/6d7e6a738e302530586d484895de2cf3fc158ad9c73b4504a670b2956dd9/tensorflow-2.21.0-cp311-cp311-win_amd64.whl
set WHEEL=D:\Project\CurhatKu V2\ml\wheels\tensorflow-2.21.0-cp311-cp311-win_amd64.whl
set EXPECT=350834005
set PY=D:\Project\CurhatKu V2\ml\.venv\Scripts\python.exe
set LOG=D:\Project\CurhatKu V2\pip.log

if not exist "D:\Project\CurhatKu V2\ml\wheels" mkdir "D:\Project\CurhatKu V2\ml\wheels"

echo === CURL DOWNLOAD TF (resume loop) === >> "%LOG%"
set /a N=0
:dl
set /a N+=1
echo --- curl attempt %N% --- >> "%LOG%"
curl.exe -L -C - --retry 5 --retry-delay 5 --connect-timeout 30 -o "%WHEEL%" "%URL%" >> "%LOG%" 2>&1
for %%F in ("%WHEEL%") do set SIZE=%%~zF
echo size=%SIZE% expected=%EXPECT% >> "%LOG%"
if "%SIZE%"=="%EXPECT%" goto dl_ok
if %N% geq 15 (echo === DOWNLOAD FAILED AFTER 15 ATTEMPTS === >> "%LOG%" & exit /b 1)
timeout /t 5 /nobreak >nul
goto dl
:dl_ok
echo === DOWNLOAD OK === >> "%LOG%"

echo === PIP INSTALL TF FROM LOCAL WHEEL === >> "%LOG%"
set /a A=0
:pi
set /a A+=1
echo --- pip attempt %A% --- >> "%LOG%"
"%PY%" -m pip install "%WHEEL%" nltk h5py six google-pasta --timeout 60 --retries 5 --no-warn-script-location --find-links "D:\Project\CurhatKu V2\ml\wheels" >> "%LOG%" 2>&1
if not errorlevel 1 goto pi_ok
if %A% geq 8 (echo === PIP INSTALL FAILED AFTER 8 ATTEMPTS === >> "%LOG%" & exit /b 1)
timeout /t 10 /nobreak >nul
goto pi
:pi_ok
echo === TF CORE OK === >> "%LOG%"

echo === INSTALL TFJS NO-DEPS === >> "%LOG%"
set /a A=0
:tj
set /a A+=1
echo --- tfjs attempt %A% --- >> "%LOG%"
"%PY%" -m pip install tensorflowjs==4.22.0 --no-deps --timeout 60 --retries 5 --no-warn-script-location >> "%LOG%" 2>&1
if not errorlevel 1 goto tj_ok
if %A% geq 8 (echo === TFJS FAILED === >> "%LOG%" & exit /b 1)
timeout /t 10 /nobreak >nul
goto tj
:tj_ok
echo === TFJS OK === >> "%LOG%"

echo === INSTALL TFJS RUNTIME DEPS === >> "%LOG%"
set /a A=0
:dp
set /a A+=1
echo --- deps attempt %A% --- >> "%LOG%"
"%PY%" -m pip install tf-keras==2.15.1 "protobuf<5" --timeout 60 --retries 5 --no-warn-script-location >> "%LOG%" 2>&1
if not errorlevel 1 goto dp_ok
if %A% geq 8 (echo === DEPS FAILED === >> "%LOG%" & exit /b 1)
timeout /t 10 /nobreak >nul
goto dp
:dp_ok
echo === ALL DEPS INSTALLED === >> "%LOG%"
exit /b 0



