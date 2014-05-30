#!/usr/bin/env python

"""
This script expects a file named instersection_data.json. The file should
contain a JSON list with objects with a NodeID_1 attribute.
"""

import os
import csv
import json
from os.path import join as pathjoin, dirname, exists
from multiprocessing import Pool

BASEDIR = dirname(__file__)


def write_intersection_file(data):
    nodeid = data['NodeID_1']
    exclude_keys = {'BORO', 'STREET1', 'STREET2', 'STREET3', 'STREET4', 'X', 'Y'}

    # Split the files into separate folders so that there's not more than 1000
    # or so files per folder.
    path = pathjoin(BASEDIR, *(digit for digit in nodeid[-2:]))

    try:
        os.makedirs(path)
    except OSError:
        pass

    for key in list(data.keys()):
        if key in exclude_keys:
            del data[key]

    with open(pathjoin(path, nodeid + '.json'), 'w') as intersection_file:
        json.dump(data, intersection_file, indent=2, sort_keys=True)


if __name__ == '__main__':
    intersections = {}

    # Load the intersection names CSV file
    with open(pathjoin(BASEDIR, 'intersection-names.txt')) as intersection_names:
        reader = csv.DictReader(intersection_names)
        for row in reader:
            key = row['NodeID_1']
            intersections[key] = row

    # Update the intersection data with the crash data json file
    with open(pathjoin(BASEDIR, 'intersection-data.txt')) as intersections_file:
        reader = csv.DictReader(intersections_file)
        for row in reader:
            key = row['NodeID_1']
            intersections[key].update(row)

    # Write the intersection files
    pool = Pool(processes=4)
    pool.map(write_intersection_file, intersections.values())
