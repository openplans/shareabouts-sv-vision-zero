#!/usr/bin/env python3

"""
Read a list of places encoded in JSON from standard in and upload them to the
dataset configured below.
"""

import json
import sys
import requests
import itertools

###
# Configuration

owner = 'demo-user'
dataset = 'demo-data'
key = 'NTNhODE3Y2IzODlmZGZjMWU4NmU3NDhj'

# -- End Configuration
###

def chunks(iterable, n, fillvalue=None):
    "Collect data into fixed-length chunks or blocks"
    # grouper('ABCDEFG', 3, 'x') --> ABC DEF Gxx"
    args = [iter(iterable)] * n
    return itertools.zip_longest(*args, fillvalue=fillvalue)

if __name__ == '__main__':
    url = 'http://data.shareabouts.org/api/v2/%s/datasets/%s/places' % (owner, dataset)

    print('Loading the places...', file=sys.stderr)
    places_data = json.load(sys.stdin)

    page_num = 0
    print('Uploading the places...', file=sys.stderr)
    for places_data_subset in chunks(places_data, 100):
        page_num += 1
        success = False
        error_count = 0

        while not success:
            response = requests.put(url,
                data=json.dumps([d for d in places_data_subset if d is not None]),
                headers={'Content-type': 'application/json', 'X-Shareabouts-Key': key, 'X-Shareabouts-Silent': True})

            if response.status_code == 200:
                print('\rSuccessfully uploaded page %s.                              ' % (page_num,), file=sys.stderr)
                success = True
            else:
                error_count += 1
                print('\rError #%s: There was an error uploading page %s. Retrying...' % (error_count, page_num), end='', file=sys.stderr)