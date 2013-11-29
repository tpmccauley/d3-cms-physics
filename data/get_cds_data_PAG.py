from invenio_connector import *
import json
import string
import unicodedata

month = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,
         'May':5,'Jun':6,'Jul':7,'Aug':8,
         'Sep':9,'Oct':10,'Nov':11,'Dec':12}

ofile_name = 'papers.json'
ofile = open(ofile_name, 'w')
oline = '['

pags = ['QCD','EWK','HIG',
        'TOP','HIN','EXO',
        'FWD','SUS','BPH',
        'SMP', 'FSQ', 'B2G']
arxivs = []

cds_url = "http://cdsweb.cern.ch"
cds = InvenioConnector(cds_url)

total = 0

for pag in pags:
    results = cds.search(pag,c="CMS Papers",f="reportnumber",rg="100")

    print 'There are', len(results), pag+' papers'
    total += len(results)

    for result in results:
        obj = {}
        
        title = result["245__a"][0]
        date = result["269__c"][0]
        url = cds_url + '/record/' + result["001__"][0]

        journal = ""

        if result.has_key('773__'):
            if len(result["773__p"]) == 1: # name
                journal += result["773__p"][0] + " "

            if len(result["773__v"]) == 1: # volume
                journal += result["773__v"][0] + " "            
            
            if len(result["773__y"]) == 1: # year
                journal += "(" + result["773__y"][0] + ") "

            if len(result["773__c"]) == 1: # pages
                journal += result["773__c"][0]
    
        arxiv = result["037__a"][0]
        
        if arxivs.count(arxiv) == 1:
            print 'Found a duplicate!', arxiv, url
            obj['duplicate'] = 'true'
        else:
            arxivs.append(arxiv)
            obj['duplicate'] = 'false'

        try:
            obj['title'] = str(title)
        except UnicodeEncodeError:
            obj['title'] = unicodedata.normalize('NFKD',title)

        d = string.split(str(date))

        obj['date'] = d[0]+'-'+str(month[d[1]])+'-'+d[2]
        obj['url'] = str(url)
        obj['type'] = str(pag)

        oline += str(json.dumps(obj,sort_keys=True))+','

print total, 'papers in total'
print len(arxivs) 

oline = oline[:-1]
oline += ']'
ofile.write(oline)
ofile.close()

print 'Results written to papers.json'
