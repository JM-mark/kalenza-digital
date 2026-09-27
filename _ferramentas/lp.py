import os

LONG = chr(92) * 2 + '?' + chr(92)  # the \\?\ prefix


def lp(p):
    """Windows long-path form (this workspace sits past MAX_PATH)."""
    r = os.path.realpath(p)
    return r if r.startswith(LONG) else LONG + r
