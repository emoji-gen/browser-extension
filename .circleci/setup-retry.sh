#!/bin/bash

set -eu -o pipefail

sudo curl -s https://raw.githubusercontent.com/kadwanev/retry/master/retry -o /usr/bin/retry
sudo chmod +x /usr/bin/retry

