#!/usr/bin/env python3

import os
import json
from os.path import join as pathjoin, dirname, exists
from multiprocessing import Pool

BASEDIR = dirname(__file__)


def write_intersection_file(data):
    nodeid = data['NodeID_1']

    # # Split the files into separate folders so that there's not more than 1000
    # # or so files per folder.
    path = pathjoin(BASEDIR, *(digit for digit in nodeid[-2:]))

    try:
        os.makedirs(path)
    except FileExistsError:
        pass

    with open(pathjoin(path, nodeid + '.json'), 'w') as intersection_file:
        json.dump(data, intersection_file, indent=2)


if __name__ == '__main__':
    with open(pathjoin(BASEDIR, 'intersection_data.json')) as intersections_file:
        data = json.load(intersections_file)
        if isinstance(data, dict):
            data_iter = data.values()
        else:
            data_iter = data

    pool = Pool(processes=4)
    pool.map(write_intersection_file, data_iter)
