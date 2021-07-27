#!/bin/bash

wget "https://proxoid.net/api/getProxy?key=db52a5277e1d2d7f043a8894188ebcc0&countries=all&types=http,https&level=all&speed=0&count=0&download=1" -O proxynofilter.txt
python checker.py