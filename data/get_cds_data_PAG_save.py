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
        'SMP', 'FSQ', 'B2G', 'GEN']

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

        title = result["245__a"][0]
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

        try:
            obj['date'] = d[0]+'-'+str(month[d[1]])+'-'+d[2]
        except KeyError:
            print 'Caught KeyError with', date, 'but all is well!'
            obj['date'] = d[0]+'-'+str(int(d[1]))+'-'+d[2]
        except IndexError:
            # good grief, why is the date format not the same?
            print 'Caught IndexError with', date, 'but all is well!'
            d = string.split(str(date), '-')
            m = int(d[1])
            obj['date'] = d[0]+'-'+str(m)+'-'+d[2]

        obj['url'] = str(url)
        obj['type'] = str(pag)

        oline += str(json.dumps(obj,sort_keys=True))+','

print total, 'papers in total'
print len(arxivs)
print '+1 HIG paper (the Science paper)'

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

oline = oline[:-1]
oline += ']'
ofile.write(oline)
ofile.close()

print 'Results written to papers.json'
