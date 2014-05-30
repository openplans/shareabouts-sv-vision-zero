Generating intersection data files
==================================

Starting from the raw intersection data file (*IntersectionsFlatData.txt*),
first add the descriptions:

    python clean_intersection_data.py

Assuming the data is in a CSV file called intersection-data.txt, to regenerate
the intersection data files, run:

    python generate_intersection_files.py
