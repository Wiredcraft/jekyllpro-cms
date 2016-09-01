
import json
import logging

import os
import re
from uuid import uuid4

from tornado import gen
from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application, url, HTTPError
from concurrent.futures import ThreadPoolExecutor
from tornado import concurrent, ioloop

import tornado
from jekyllplus.api.command import execute

# For slugify
from unicodedata import normalize
_punct_re = re.compile(r'[\t !"#$%&\'()*\-/<=>?@\[\\\]^_`{|},.]+')

def conf_logging():
    logger = logging.getLogger('applog')
    logger.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    logger.propagate = False

    ch = logging.StreamHandler()
    ch.setFormatter(formatter)
    ch.setLevel(logging.DEBUG)

    logger.addHandler(ch)

conf_logging()
log = logging.getLogger('applog')

class BaseHandler(RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')


class AsyncRunner(object):
    __instance = None

    def __new__(cls, *args, **kwargs):
        if cls.__instance is None:
            cls.__instance = super(
                AsyncRunner, cls).__new__(cls, *args, **kwargs)
        return cls.__instance

    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.io_loop = ioloop.IOLoop.current()

    @concurrent.run_on_executor
    def run(self, command):
        
        code, stdout, stderr = execute(command)
        print 'code: %s, stdout: %s, stderr: %s' % (code, stdout, stderr)

        # pipe = Pipeline.from_yaml(pipeline_file, params={
        #     'status_file': os.path.join(folder_path, 'status.json'),
        #     'log_file': os.path.join(folder_path, 'output.log')
        # })
        return stdout

class RegisterSiteHandler(BaseHandler):
    @gen.coroutine
    def post(self):
        '''
        Provide a GH repo in the Params and get a cloning process
        '''
        log.debug('Running register')

        body = tornado.escape.json_decode(self.request.body)

        command = 'jekyllplus_register'
        url = body.get('repository')

        owner = slugify(url.split('/')[0])
        repo = slugify(url.split('/', 1)[1])

        token = body.get('token')

        self.finish()

        runner = AsyncRunner()
        yield runner.run([command, url, token, owner, repo])



class BuildSiteHandler(BaseHandler):
    @gen.coroutine
    def post(self):
        log.debug('Running build')

        body = tornado.escape.json_decode(self.request.body)

        # TODO assert the wrong types of notification
        command = 'jekyllplus_build'
        owner = slugify(body.get('repository', {}).get('owner', {}).get('name'))
        repo = slugify(body.get('repository', {}).get('name'))
        branch = body.get('ref').split('/')[2]

        print 'Gonna update repo: %s/%s - branch: %s' % (owner, repo, branch)

        self.finish()

        runner = AsyncRunner()
        yield runner.run([command, owner, repo, branch, slugify(branch)])


def slugify(text, delim=u'-'):
    """Generates an slightly worse ASCII-only slug."""
    result = []
    for word in _punct_re.split(text.lower()):
        word = normalize('NFKD', word).encode('ascii', 'ignore')
        if word:
            result.append(word)
    return unicode(delim.join(result))

def make_app():
    return Application([
        url(r"/api/register", RegisterSiteHandler),
        url(r"/api/build", BuildSiteHandler),
    ])

def main(config={}):
    app = make_app()
    app.listen(int(config.get('port', 8888)), address=config.get('host', '127.0.0.1'))
    print('Starting ioloop')
    io_loop = IOLoop.current()
    io_loop.start()

if __name__ == '__main__':
    main()
