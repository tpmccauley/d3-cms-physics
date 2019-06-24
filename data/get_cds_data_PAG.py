from invenio_connector import *
import json
import string
import unicodedata
import sys
from time import gmtime, strftime

debug = False

month = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,
         'May':5,'Jun':6,'Jul':7,'Aug':8,
         'Sep':9,'Oct':10,'Nov':11,'Dec':12}

# Get time and date and output to file
dfile = open('date.json', 'w')
date = {'Y': strftime('%Y'), 'M' : strftime('%m'), 'D': strftime('%d')}
dfile.write(str(json.dumps(date,sort_keys=False)))
dfile.close()

ofile_name = 'papers.json'
ofile = open(ofile_name, 'w')
oline = '['

pags = ['QCD','EWK','HIG',
        'TOP','HIN','EXO',
        'FWD','SUS','BPH',
        'SMP', 'FSQ', 'B2G', 'PPS', 'GEN',
        'MUO', 'EGM', 'TAU', 'PRF', 'TRG',
        'JME', 'TRK', 'BTV', 'DET' ]

arxivs = []

cds_url = "http://cdsweb.cern.ch"
cds = InvenioConnector(cds_url)

total = 0

for pag in pags:
    results = cds.search(p=pag,c="CMS Papers",f="reportnumber",rg="1000")

    print 'There are', len(results), pag+' papers'
    total += len(results)

    for result in results:
        obj = {}

        if debug:
            for r in result:
                if r == '700__' or r == '8564_':
                    continue
                print r, result[r]

        if '980__' in result.keys():
            if result["980__"][0] == "DELETED":
                continue

        try:
            title = result["245__a"][0]
        except KeyError:
            for r in result:
                if r == '700__' or r == '8564_':
                    continue
                print r, result[r]
            print 'Caught KeyError --- don''t know why'
            title = "tagada"

        date = result["269__c"][0]
        url = cds_url + '/record/' + result["001__"][0]

        journal = ''

        try:
            if len(result["773__p"]) == 1: # name
                journal += result["773__p"][0] + " "

            if len(result["773__v"]) == 1: # volume
                journal += result["773__v"][0] + " "

            if len(result["773__y"]) == 1: # year
                journal += "(" + result["773__y"][0] + ") "

            if len(result["773__c"]) == 1: # pages
                journal += result["773__c"][0]
        except KeyError:
            if debug:
                print 'no journal record 773__', title

        try:
            arxiv = result["037__a"][0]

            if arxiv == 'arXiv:1005.5332':  # the cosmic-ray paper
                continue

            if arxivs.count(arxiv) == 1:
                print 'Found a duplicate!', arxiv, url
                obj['duplicate'] = 'true'
            else:
                arxivs.append(arxiv)
                obj['duplicate'] = 'false'
        except KeyError:
            if debug:
                print 'no arxiv 037__a', title
            obj['duplicate'] = 'false'

        try:
            obj['title'] = str(title)
        except UnicodeEncodeError:
            obj['title'] = unicodedata.normalize('NFKD',title)

        d = string.split(str(date))
        if len(d) == 1:
            print string
            d = date.split('-')
            print date, d, d[0], d[1], d[2]
# ghm 2/2019
        ii = 0
        jj = 2
        if int(d[0]) > 2000 :
            ii = 2
            jj = 0       
        try:
            obj['date'] = d[ii]+'-'+str(month[d[1]])+'-'+d[jj]
        except KeyError:
            print 'Caught KeyError with', d[ii]+' '+d[1]+' '+d[jj], 'but all is well!'
            obj['date'] = d[ii]+'-'+str(int(d[1]))+'-'+d[jj]
        except IndexError:
            # good grief, why is the date format not the same?
            print 'Caught IndexError with', d[ii]+' '+d[1]+' '+d[jj], 'but all is well!'
            d = string.split(str(date), '-')
            m = int(d[1])
            obj['date'] = d[ii]+'-'+str(m)+'-'+d[jj]

        obj['url'] = str(url)
        obj['type'] = str(pag)

        oline += str(json.dumps(obj,sort_keys=True))+','

print total, 'papers in total'
print len(arxivs)
print '+1 HIG paper (the Science paper)'
print '+1 TOP paper (the ATLAS+CMS paper)'

# What's this?
# Well, the Higgs Science paper does not seem to have a
# full record and is missing a proper date, PAG code, and arxiv.
# So for now, add it by-hand.
sci = {}
sci['title'] = 'A New Boson with a Mass of 125 GeV Observed with the CMS Experiment at the Large Hadron Collider'
sci['date'] = '21-12-2012'
sci['url'] = 'https://cds.cern.ch/record/1529911/'
sci['type'] = 'HIG'
sci['duplicate'] = 'false'
oline += str(json.dumps(sci,sort_keys=True))+','

sci = {}
sci['title'] = 'Combinations of single-top-quark production cross-section measurements and ${|f_{\rm LV}{V_{\mathrm{tb}}} |} $ determinations at $\sqrt{s} =$ 7 and 8 TeV with the ATLAS and CMS experiments'
sci['date'] = '15-2-2019'
sci['url'] = 'https://cds.cern.ch/record/2660214/'
sci['type'] = 'TOP'
sci['duplicate'] = 'false'
oline += str(json.dumps(sci,sort_keys=True))+','

#det = {}
#det['title'] = 'The CMS Experiment at the CERN LHC'
#det['date'] = '09-01-2008'
#det['url'] = 'https://cds.cern.ch/record/1129810'
#det['type'] = 'DET'
#det['duplicate'] = 'false'
#oline += str(json.dumps(det,sort_keys=True))+','

oline = oline[:-1]
oline += ']'
ofile.write(oline)
ofile.close()

print 'Results written to papers.json'
