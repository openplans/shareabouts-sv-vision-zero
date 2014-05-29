Generating intersection data files
==================================

Assuming the data is in a CSV file calledTo regenerate the intersection data files, run:

    # Get rid of unneeded columns, and convert to a big JSON file
    csvcut --not-columns BORO,STREET1,STREET2,STREET3,STREET3,X,Y \
        intersection_data.txt | csvjson > intersection_data.json
    # Split into many tiny JSON files
    ./generate_intersection_files.py
