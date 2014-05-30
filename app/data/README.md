Generating intersection data files
==================================

Starting from the raw intersection data file (*IntersectionsFlatData.txt*),
first clean up and make human-readable the street names and boroughs:

    python clean_intersection_data.py

Assuming the data is in a CSV file called intersection-data.txt (which it
will be after running the above script), to regenerate the intersection data
files, run:

    python generate_intersection_files.py
