#NextMuni implementation with NextBus API and Leaflet.js#



Hosted app: [http://cs.ucsb.edu/~esterkin/nextmuni](http://cs.ucsb.edu/esterkin/nextmuni)

App repo: [http://github.com/esterkin/nextmuni](http://github.com/esterkin/nextmuni)



##Implementation##


**Technical track:** Mostly front-end

**Reasoning:** 

Data required for the app is readily available in an easy to use API. As NextBus does not provide an API for nearest stops, I created [sfnextmuni.herokuapp.com](sfnextmuni.herokuapp.com) which is based off of [SugaBus](https://github.com/rf/sugabus) and [runextbus.herokuapp.com](runextbus.herokuapp.com). This web app uses the NextBusJS API to find nearest bus stops.

***Bugs***

*closestStops()* in [https://github.com/rf/nextbusjs/blob/master/lib/index.js]( https://github.com/rf/nextbusjs/blob/master/lib/index.js) does not work as expected 

***Future work***

Fix bugs found in the NextBusJS API to improve the nearest stops feature. 
Work on a more mobile-friendly user interface. 

**Resources** 

Mapping library: [Leaflet.js](http://leaflet.js)  

Bus data: [NextBus API]( http://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf) 

Nearest stops feature: [NextBusJS](https://github.com/rf/nextbusjs) 



***


###[esterkin’s](http://github.com/esterkin) other location-based apps:###



Web apps: [Isla Vista Alert Map]( http://ivalertmap.appspot.con)


Android apps:

[Transponder](https://play.google.com/store/apps/details?id=com.transponderapp)

[SBLink](https://play.google.com/store/apps/details?id=sblink.app) 





