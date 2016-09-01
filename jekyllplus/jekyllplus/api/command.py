import os
import sys
import select
import subprocess
from cStringIO import StringIO

PIPE = subprocess.PIPE

# http://stackoverflow.com/questions/5486717/python-select-doesnt-signal-all-input-from-pipe
class LineReader(object):
    def __init__(self, fd):
        self._fd = fd
        self._buf = ''

    def fileno(self):
        return self._fd

    def readlines(self):
        data = os.read(self._fd, 4096)
        if not data:
            # EOF
            return None
        self._buf += data
        if '\n' not in data:
            return []
        tmp = self._buf.split('\n')
        lines, self._buf = tmp[:-1], tmp[-1]
        return lines

def execute(params):
    '''
    Execute a command, Popen wrapper
    '''
    if type(params) in (str, unicode):
        params = [params]
    
    if type(params) != list:
        raise Exception('Invalid params type, need to be string or a list')

    try:
        p = subprocess.Popen(params, stdout=PIPE, stderr=PIPE)
    except OSError as e:
        return 1, '', e

    proc_stdout = LineReader(p.stdout.fileno())
    proc_stderr = LineReader(p.stderr.fileno())
    
    readable = [proc_stdout, proc_stderr]
    
    stdout = []
    stderr = []
    results = [stdout, stderr]

    while readable:
        ready = select.select(readable, [], [], 10.0)[0]
        if not ready:
            continue
        for idx, stream in enumerate(ready):
            lines = stream.readlines()
            if lines is None:
                # got EOF on this stream
                readable.remove(stream)
                continue
            results[idx].extend(lines)
            for line in lines:
                if idx == 0:
                    sys.stdout.write(line +'\n')
                else:
                    sys.stderr.write(line +'\n')

    # Wait until completion of the process
    while p.returncode == None:
        p.poll()

    # return a tuple (code, stdout, stderr)
    return p.returncode, '\n'.join(results[0]), '\n'.join(results[1])
