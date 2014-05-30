import re

"""
Normalizes a street name with more formal street suffixes and directionals.

Caveats: 
    Intended for just the street name itself, not the street plus surrounding text.
    Intended for US addresses.
    For example, the "suffixes" regexes will strip the period off the end of 'St.' and
    replace it with 'Street', even if it's at the end of a sentence.
    This doesn't work with addresses either. For address number/street splitting,
    see: https://gist.github.com/fitnr/5818825
"""

suffixes = [
    # Full Street Extension
    # See below for Street and Drive and Lane
    (r'ave?n?u?e?', 'Avenue'),
    (r'rd', 'Road'),
    (r'sq(r?e?|u)', 'Square'),
    (r't(r?n?pke?|urnpk)', 'Turnpike'),
    (r'all?(ee|y)', 'Alley'),
    (r's/?r', 'Service Road'),  # The post office has apparently never heard of service roads
    (r'(bl(vd)|boulv?)', 'Boulevard'),
    (r'(brg|brdge)', 'Bridge'),
    (r'(circ?|ci?rcle?)', 'Circle'),
    (r'h(wa?y?|iwy|ighwy)', 'Highway'),
    (r'hl', 'Hill'),
    (r'j(ction|ctn?|uncto?n)', 'Junction'),
    (r'ovl', 'Oval'),
    (r'pr?k', 'Park'),
    (r'p(arkw|kwa|kw?)y', 'Parkway'),
    (r'pkwys', 'Parkways'),
    (r'pl', 'Place'),
    (r'plza?', 'Plaza'),

    (r'an(ne)?x', 'Annex'),
    (r'arc', 'Arcade'),
    (r'bayou', 'Bayoo'),
    (r'bch', 'Beach'),
    (r'bnd', 'Bend'),
    (r'blu?f', 'Bluff'),
    (r'b(ot|tm|bottm)', 'Bottom'),
    (r'br(nch)?', 'Branch'),
    (r'brk', 'Brook'),
    (r'by(pas?|ps)', 'Bypass'),
    (r'cm?p', 'Camp'),
    (r'c(an|n?)yn', 'Canyon'),
    (r'cpe', 'Cape'),
    (r'c(sw|auswa)y', 'Causeway'),
    (r'c(ent?r?|entre|ntr|tr)', 'Center'),
    (r'clf', 'Cliff'),
    (r'clfs', 'Cliffs'),
    (r'clb', 'Club'),
    (r'cor', 'Corner'),
    (r'cors', 'Corners'),
    (r'crse', 'Course'),
    (r'cr?t', 'Court'),
    (r'ct', 'Courts'),
    (r'cv', 'Cove'),
    (r'cr?k?', 'Creek'),
    (r'cr(e(c|s)ent|es|snt)', 'Crescent'),
    (r'crssi?ng', 'Crossing'),
    (r'dl', 'Dale'),
    (r'dm', 'Dam'),
    (r'di?vd?', 'Divide'),
    # Special rule for Drive because of "Doctor"
    (r'est', 'Estate'),
    (r'ests', 'Estates'),
    (r'exp(r|y|ress|w)?', 'Expressway'),
    # Special rule for Ext
    (r'exts', 'Extensions'),
    (r'fls', 'Falls'),
    (r'frr?y', 'Ferry'),
    (r'fld', 'Field'),
    (r'flds', 'Fields'),
    (r'flt', 'Flat'),
    (r'flts', 'Flats'),
    (r'frd', 'Ford'),
    (r'(frst|forests)', 'Forest'),
    (r'fo?rg', 'Forge'),
    (r'frk', 'Fork'),
    (r'frks', 'Forks'),
    (r'f((ree)?wy|rwa?y)', 'Freeway'),
    (r'g(ard|rde|r?d)n', 'Garden'),
    (r'gr?dns', 'Gardens'),
    (r'g(atew|atwa|twa?)y', 'Gateway'),
    (r'gln', 'Glen'),
    (r'grn', 'Green'),
    (r'gro?v', 'Grove'),
    (r'h(arbr?|br|rbor)', 'Harbor'),
    (r'ha?vn', 'Haven'),
    (r'h(eigt|gts|ts?)', 'Heights'),
    (r'hls', 'Hills'),
    (r'h(llw|ollows|olws?)', 'Hollow'),
    (r'inlt', 'Inlet'),
    (r'is(lnd)?(s?)', r'Island\2'),
    (r'isles', 'Isle'),
    (r'jctn?s', 'Junctions'),
    (r'ky', 'Key'),
    (r'kys', 'Keys'),
    (r'kno?l', 'Knoll'),
    (r'knls', 'Knolls'),
    (r'lk', 'Lake'),
    (r'lks', 'Lakes'),
    (r'lndn?g', 'Landing'),
    # Special rule for Lane because of La- prefix
    (r'lgt', 'Light'),
    (r'lf', 'Loaf'),
    (r'lck', 'Lock'),
    (r'lcks', 'Locks'),
    (r'l(dge?|odg)', 'Lodge'),
    (r'(lp|loops)', 'Loop'),
    (r'mnr', 'Manor'),
    (r'mnrs', 'Manors'),
    (r'mdw', 'Meadow'),
    (r'm(dws|edow)s', 'Meadows'),
    (r'ml', 'Mill'),
    (r'mls', 'Mills'),
    (r'm(issn|ss?n)', 'Mission'),
    (r'mn?t', 'Mount'),
    (r'm(nt(ai)?|ounti|ti?)n', 'Mountain'),
    (r'mntns', 'Mountains'),
    (r'nck', 'Neck'),
    (r'orch(rd)?', 'Orchard'),
    (r'paths', 'Path'),
    (r'pikes', 'Pike'),
    (r'pnes', 'Pines'),
    (r'pln', 'Plain'),
    (r'plns', 'Plains'),
    (r'pt', 'Point'),
    (r'pts', 'Points'),
    (r'prt', 'Port'),
    (r'prts', 'Ports'),
    (r'pr(arie|r)?', 'Prairie'),
    (r'rad(l|iel)?', 'Radial'),
    (r'rnchs?', 'Ranch'),
    (r'rpd', 'Rapid'),
    (r'rpds', 'Rapids'),
    (r'rst', 'Rest'),
    (r'rdg', 'Ridge'),
    (r'rdgs', 'Ridges'),
    (r'ri?vr?', 'River'),
    (r'rds', 'Roads'),
    (r'shl', 'Shoal'),
    (r'shls', 'Shoals'),
    (r'shr|shoar', 'Shore'),
    (r'shrs', 'Shores'),
    (r'spr?n?g', 'Spring'),
    (r'spr?n?gs', 'Springs'),
    (r'sqrs', 'Squares'),
    (r'st(at)?n', 'Station'),
    (r'str(a|a?ve?n?|vnue)', 'Stravenue'),  # Only in Tucson
    (r'str(m|eme)', 'Stream'),

    # Special rule for Street because of "Saint"
    (r's(m|umi|umit)t', 'Summit'),
    (r'te?rr?', 'Terrace'),
    (r'trce', 'Trace'),
    (r'tra?c?k', 'Track'),
    (r'trfy', 'Trafficway'),
    (r'trl?s?', 'Trail'),
    (r'tun(e?l|ls|nels|nnl)', 'Tunnel'),

    (r'un', 'Union'),
    (r'v(all|l?l)y', 'Valley'),
    (r'vlys', 'Valleys'),
    (r'v(dct|ia|iadct)', 'Viaduct'),
    (r'vw', 'View'),
    (r'vws', 'Views'),
    (r'v(illa?g?|illiage|lg)', 'Village'),
    (r'vlgs', 'Villages'),
    (r'vl', 'Ville'),
    (r'v(ist?|sta?)', 'Vista'),
    (r'wy', 'Way'),
    (r'wls', 'Wells'),
]

street_patterns = [
    # Directional Suffix
    # Not to match if the only thing before is "Avenue"
    (r'(?i)(?<!^Avenue) N\b[\.,]?', ' North'),
    (r'(?i)(?<!^Avenue) S\b[\.,]?', ' South'),
    (r'(?i)(?<!^Avenue) E\b[\.,]?', ' East'),
    (r'(?i)(?<!^Avenue) W\b[\.,]?', ' West'),

    # Directional
    (r'(?i)\bne\b', 'Northeast'),
    (r'(?i)\bnw\b', 'Northwest'),
    (r'(?i)\bsw\b', 'Southwest'),
    (r'(?i)\bse\b', 'Southeast'),

    # Special rules for street and drive, which are also abbrvs for honorifics
    # And La, which may occur in names (e.g. La Guardia Place)
    # Only replaced if at the end of the input, or followed by a directional suffix
    # e.g. "Example Dr N." => "Example Drive North"
    (r'(?i)\bst\b\.?($| North| South| West| East| NW| NE| SE| SW)', r'Street\1'),
    (r'(?i)\bdr\b\.?($| North| South| West| East| NW| NE| SE| SW)', r'Drive\1'),
    (r'(?i)\bla\b\.?($| North| South| West| East| NW| NE| SE| SW)', r'Lane\1'),

    # Directional prefix without a space for numbered streets
    # Sadly common in NYC, e.g. W42 St
    (r'(?i)^N\.?(?=\d)', 'North '),
    (r'(?i)^S\.?(?=\d)', 'South '),
    (r'(?i)^E\.?(?=\d)', 'East '),
    (r'(?i)^W\.?(?=\d)', 'West '),

    # Directional prefix
    # Washington DC exception e.g "N Street"
    (r'(?i)^N\b[\.,]?(?! Str)', 'North'),
    (r'(?i)^S\b[\.,]?(?! Str)', 'South'),
    (r'(?i)^E\b[\.,]?(?! Str)', 'East'),
    (r'(?i)^W\b[\.,]?(?! Str)', 'West'),

    # Spelling out avenues, drives, roads and boulevards
    (r'(?i)\b1(st)?(?= (Aven|Driv|Road|Boul))', 'First'),
    (r'(?i)\b2(nd)?(?= (Aven|Driv|Road|Boul))', 'Second'),
    (r'(?i)\b3(rd)?(?= (Aven|Driv|Road|Boul))', 'Third'),
    (r'(?i)\b4(th)?(?= (Aven|Driv|Road|Boul))', 'Fourth'),
    (r'(?i)\b5(th)?(?= (Aven|Driv|Road|Boul))', 'Fifth'),
    (r'(?i)\b6(th)?(?= (Aven|Driv|Road|Boul))', 'Sixth'),
    (r'(?i)\b7(th)?(?= (Aven|Driv|Road|Boul))', 'Seventh'),
    (r'(?i)\b8(th)?(?= (Aven|Driv|Road|Boul))', 'Eighth'),
    (r'(?i)\b9(th)?(?= (Aven|Driv|Road|Boul))', 'Ninth'),
    (r'(?i)\b10(th)?(?= (Aven|Driv|Road|Boul))', 'Tenth'),
    (r'(?i)\b11(th)?(?= (Aven|Driv|Road|Boul))', 'Eleventh'),
    (r'(?i)\b12(th)?(?= (Aven|Driv|Road|Boul))', 'Twelfth'),

    # Lowercase ordinals
    (r'(?<=\d)(Th|St|Nd|Rd)(?= )', lambda x: x.group(1).lower()),

    # Adding numeral suffixes to streets and places
    (r'(?<=(11|12|13))(?= (Str|Ter|Lan|Pla|Ave|Dri|Roa|Bou))', 'th'),
    (r'(?<=1)(?= (Str|Ter|Lan|Pla|Ave|Dri|Roa|Bou))', 'st'),
    (r'(?<=2)(?= (Str|Ter|Lan|Pla|Ave|Dri|Roa|Bou))', 'nd'),
    (r'(?<=3)(?= (Str|Ter|Lan|Pla|Ave|Dri|Roa|Bou))', 'rd'),
    (r'(?<=[0456789])(?= (Str|Ter|Ave|Roa|Dri|Bou|Pla|Ter|Lan))', 'th'),

    (r'(?i)\bfr?t\b\.?', 'Fort'),
    (r'Ext\b[.,]?$', 'Extension'),

    # Fix for Saint Name apostrophes
    (
        r'(?i)\bSt\.? (\w+)(\'?s?)(?= )',
        lambda x: 'St. ' + x.group(1) + x.group(2).lower()
    )
]


def formalize(street):
    'rewrite street names, extending them'

    if street == '' or street is None:
        return street

    for pattern, replace in suffixes:
        match = re.sub(r'(?i)\b' + pattern + r'\b\.?', replace, street)  # re.IGNORECASE)
        if match != street:
            street = match
            break

    for pattern, replace in street_patterns:
        street = re.sub(pattern, replace, street)  # flags=re.MULTILINE | re.IGNORECASE)

    return street


def main():
    tests = [
        ("56Th RD", "56th Road"),
        ('Wistful Vst', 'Wistful Vista'),
        ("E. 1st Pl", "East 1st Place"),
        ("St. Alban's RD.", "St. Alban's Road"),
        ('Dr. Martin Luther King, Jr. Dr', 'Dr. Martin Luther King, Jr. Drive'),
        ("DiPalma St.", "DiPalma Street"),
        ("N St.", "N Street"),
        ("Ave M", "Avenue M"),
        ("La Guardia Pl", "La Guardia Place"),
        ("W47 St", "West 47th Street"),
        ('1st Ave', 'First Avenue'),
        ('Flatbush Av Ext', "Flatbush Avenue Extension"),
        ('Main St.', 'Main Street'),
        ('Horace Harding Tpke', 'Horace Harding Turnpike'),
        ('Evergreen Terr', 'Evergreen Terrace'),
        ('9 St N', '9th Street North'),
        ('Beach 6 St', 'Beach 6th Street'),
        ('N 9 St', 'North 9th Street'),
        ('S Kelvin Stra', 'South Kelvin Stravenue'),
        ('S Howard Strvn', 'South Howard Stravenue'),
        ('Bell Blvd', 'Bell Boulevard'),
        ('Washington Sq W', 'Washington Square West'),
        ('FDR Dr SR N', 'FDR Drive Service Road North'),
        ('Ft. Greene Pl', 'Fort Greene Place'),
        ('Monhegan Is', 'Monhegan Island'),
        ('Channel Iss', 'Channel Islands'),
        ('Washington Pk', 'Washington Park'),
        ('Central Pk W', 'Central Park West'),
        ('Natchez Trce', 'Natchez Trace'),
        ('Prospect Pk SW', 'Prospect Park Southwest'),
        ('N 10 Av', 'North Tenth Avenue'),
        ('14 Ave', '14th Avenue'),
        ('Ft George Hl', 'Fort George Hill')  # Actual street in Inwood, NYC
    ]

    for before, after in tests:
        try:
            assert formalize(before) == after
        except Exception:
            print('test failed')
            print('formalized', before, 'and got', formalize(before), 'when I wanted', after)

    print('Tests OK')


if __name__ == '__main__':
    main()
