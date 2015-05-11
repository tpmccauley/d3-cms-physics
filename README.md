d3-cms-physics
==============

A d3 visualization of physics papers published by the CMS experiment at the LHC.

How?

* First one must fetch the paper data from the CERN Document Server using ./data/get_cds_data_PAG.py
(which uses invenio_connector.py): "python get_cds_data_PAG.py" 
* The paper data are output to papers.json
* This data are then read in and rendered using d3

Links:
* http://cern.ch/cms
* http://cds.cern.ch
* http://github.com/inveniosoftware/invenio
* http://d3js.org

Author:
thomas.mccauley@cern.ch




