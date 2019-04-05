@echo off
net.exe session 1>NUL 2>NUL || (Echo This script requires elevated rights. & pause & Exit /b 1)
pushd "%~dp0"
vagrant up
vagrant ssh
vagrant halt
pause