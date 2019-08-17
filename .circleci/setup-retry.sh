#!/bin/bash

set -eu -o pipefail

curl -s https://raw.githubusercontent.com/kadwanev/retry/master/retry -o /usr/bin/retry
chmod +x /usr/bin/retry

