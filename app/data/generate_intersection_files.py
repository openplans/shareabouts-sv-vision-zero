#!/usr/bin/env python3

import os
import csv
import json
from os.path import join as pathjoin, dirname, exists
from multiprocessing import Pool

BASEDIR = dirname(__file__)


def write_intersection_file(data):
    nodeid = data['NodeID_1']

    # Split the files into separate folders so that there's not more than 1000
    # or so files per folder.
    path = pathjoin(BASEDIR, *(digit for digit in nodeid[-2:]))

    try:
        os.makedirs(path)
    except FileExistsError:
        pass

    with open(pathjoin(path, nodeid + '.json'), 'w') as intersection_file:
        json.dump(data, intersection_file, indent=2, sort_keys=True)


if __name__ == '__main__':
    intersections = {}

    # Load the intersection names CSV file
    with open(pathjoin(BASEDIR, 'intersection-names.txt')) as intersection_names:
        reader = csv.reader(intersection_names)
        header = None
        for row in reader:
            if header is None:
                header = row
                continue

            key = row[0]
            intersections[key] = dict(zip(header, row))

    # Update the intersection data with the crash data json file
    with open(pathjoin(BASEDIR, 'intersection_data.json')) as intersections_file:
        data = json.load(intersections_file)
        if isinstance(data, dict):
            data_iter = data.values()
        else:
            data_iter = data

        for elem in data_iter:
            key = elem['NodeID_1']
            intersections[key].update(elem)

    # Write the intersection files
    pool = Pool(processes=4)
    pool.map(write_intersection_file, intersections.values())
