#!/usr/bin/env python
# Lint as: python3
"""Test utilities for working with time."""
import sys
import time


def Step() -> None:
  """Ensures passage of time.

  Some tests need to ensure that some amount of time has passed. However, on
  some platforms (Windows in particular) Python has a terribly low system clock
  resolution, in which case two consecutive time checks can return the same
  value.

  This utility waits (by sleeping the minimum amount of time possible), until
  the time actually made a step. Which is not perfect, as unit tests in general
  should not wait, but in this case this time is minimal possible.
  """
  start = time.time()
  while start == time.time():
    time.sleep(sys.float_info.epsilon)
