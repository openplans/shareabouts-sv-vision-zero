"""
Adapted from https://gist.github.com/fitnr/ef8c05e9e5a854bb7fba

This script only does part of what the above does. This will transform
the intersection and borough fields into human readable values. For the
other parts of the above script, see
https://github.com/openplans/shareabouts-sv-vision-zero/blob/master/app/scripts/handlebars-helpers.js
"""

from __future__ import print_function

import csv
import sys
from formalize import formalize

fields = ["NodeID_1", "BORO", "STREET1", "STREET2", "STREET3", "STREET4", "P_Inj", "B_Inj", "M_Inj", "P_Sev", "B_Sev", "M_Sev", "P_Fat", "B_Fat", "M_Fat", "P_KSI", "B_KSI", "MV_KSI", "P_HCC_CLASS", "P_HCC_STREETNAME", "X", "Y"]

boroughs = {
    "1": "Manhattan",
    "2": "the Bronx",
    "3": "Brooklyn",
    "4": "Queens",
    "5": "Staten Island"
}


# mainstreet: string
# streets: list
def set_intersection_name(mainstreet, streets):
    if len(streets) == 0:
        intersection = mainstreet
    elif len(streets) == 1:
        intersection = mainstreet + " and " + streets.pop()
    elif len(streets) > 1:
        intersection = mainstreet + " at " + ' '.join([x + ',' for x in streets[:-1]])
        # No oxford comma
        intersection = intersection[:-1] + " and " + streets[-1]

    return intersection


def format_intersection_data(row):
    streets, keys = [], ['STREET1', 'STREET2', 'STREET3', 'STREET4']

    # Formalize street names
    # see https://gist.github.com/fitnr/b0192170cd4ed90a00f0
    for x in keys:
        row[x] = formalize(row[x].title())
        streets.append(row[x])

    # Remove blank streets
    streets = [x for x in streets if (x != '' and x != ' ')]

    # One street is the "primary" in the intersection
    # We remove it from the list of streets
    if row['P_HCC_STREETNAME'] != '':
        mainstreet = formalize(row['P_HCC_STREETNAME'].title())
    else:
        mainstreet = streets[0]

    # Clean up to remove ugly text from some street names
    mainstreet = mainstreet.replace(' (Nb)', '')
    mainstreet = mainstreet.replace(' Eb', '')

    row['P_HCC_STREETNAME'] = mainstreet

    try:
        streets.remove(mainstreet)
    except Exception, e:
        # print ("NodeID_1", row['NodeID_1'], "Streets dont contain", mainstreet)
        pass

    # Set intersection name
    row['intersection'] = set_intersection_name(mainstreet, streets)

    # Set the human-readable borough name
    try:
        row['borough'] = boroughs[row['BORO']]
    except KeyError:
        row['borough'] = '$borough'

    return row


def main():
    FILENAME = 'IntersectionsFlatData.txt'
    OUTFILE = 'intersection-data.txt'

    with open(FILENAME, 'rb') as f:
        reader = csv.DictReader(f, delimiter=',', lineterminator='\n')

        with open(OUTFILE, 'wb') as out:
            newfields = fields + ['intersection', 'borough']
            csv.register_dialect('ksi', quoting=csv.QUOTE_NONNUMERIC, delimiter=',',  lineterminator='\n')
            writer = csv.DictWriter(out, newfields, 'ksi')
            writer.writeheader()

            count = 0
            for r in reader:
                r = format_intersection_data(r)
                writer.writerow(r)

                count += 1
                print('\rWrote %s rows to the csv file.' % (count,), end='', file=sys.stderr)
            print('', file=sys.stderr)


if __name__ == '__main__':
    main()
