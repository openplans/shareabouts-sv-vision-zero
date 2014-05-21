#!/usr/bin/env python3

"""
Download places from a dataset and update each place with the nearest
intersection as listed in the intersection_nodes.json file. The result is
writted to standard out.
"""

import json
from urllib.request import urlopen
import math
import multiprocessing
import sys

def simple_distance(lat1, long1, lat2, long2):
    dlat = lat2 - lat1
    dlong = long2 - long1
    dist = (dlat**2 + dlong**2)**0.5
    return dist

def distance_on_unit_sphere(lat1, long1, lat2, long2):

    # Convert latitude and longitude to
    # spherical coordinates in radians.
    degrees_to_radians = math.pi/180.0

    # phi = 90 - latitude
    phi1 = (90.0 - lat1)*degrees_to_radians
    phi2 = (90.0 - lat2)*degrees_to_radians

    # theta = longitude
    theta1 = long1*degrees_to_radians
    theta2 = long2*degrees_to_radians

    # Compute spherical distance from spherical coordinates.

    # For two locations in spherical coordinates
    # (1, theta, phi) and (1, theta, phi)
    # cosine( arc length ) =
    #    sin phi sin phi' cos(theta-theta') + cos phi cos phi'
    # distance = rho * arc length

    cos = (math.sin(phi1)*math.sin(phi2)*math.cos(theta1 - theta2) +
           math.cos(phi1)*math.cos(phi2))
    arc = math.acos( cos )

    # Remember to multiply arc by the radius of the earth
    # in your favorite set of units to get length.
    return arc

def find_nearest_node(place_data, intersections_data):
    def distance_from_place(intersection_data):
        return distance_on_unit_sphere(
            place_data['geometry']['coordinates'][1],
            place_data['geometry']['coordinates'][0],
            float(intersection_data['YCOORD']),
            float(intersection_data['XCOORD']))
    closest = min(intersections_data, key=distance_from_place)
    return closest

if __name__ == '__main__':
    print('Downloading the places...', file=sys.stderr)
    with urlopen('http://data.shareabouts.org/api/v2/nycdot/datasets/vz-dev/places?page_size=5000') as places_request:
        places_data = json.loads(places_request.read().decode('utf-8'))['features']

    print('Loading the intersection data...', file=sys.stderr)
    with open('intersection_nodes.json') as nodes_file:
        intersections_data = json.load(nodes_file)

    print('Simplifying submitters...', file=sys.stderr)
    def simplify_submitter(place_data):
        if 'submitter' in place_data['properties']:
            if place_data['properties']['submitter']:
                place_data['properties']['submitter'] = place_data['properties']['submitter']['id']
        place_data['properties'].pop('submitter')
        return place_data
    places_data = map(simplify_submitter, places_data)

    places_done = 0
    def apply_nearest_node_values(place_data):
        global places_done

        print('\rFinding nearest intersection to %s...' % (place_data['properties']['url'],), end='', file=sys.stderr)

        closest = find_nearest_node(place_data, intersections_data)
        place_data['properties']['intersection_id'] = closest['NodeID_1']
        place_data['properties']['intersection_lat'] = closest['YCOORD']
        place_data['properties']['intersection_lng'] = closest['XCOORD']

        places_done += 1
        if places_done % 100 == 0:
            print('\nCorrelated %s places.' % (places_done,), file=sys.stderr)
        return place_data
    pool = multiprocessing.Pool(processes=4)
    places_data = pool.map(apply_nearest_node_values, places_data)
    print('', file=sys.stderr)

    print(json.dumps(places_data), file=sys.stdout)
