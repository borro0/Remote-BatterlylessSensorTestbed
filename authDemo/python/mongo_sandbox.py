from pymongo import MongoClient
from bson.objectid import ObjectId
import pprint

client = MongoClient()
db = client.auth_demo
collection = db.users


#myquery = {"local": {"testRuns": {"$elemMatch": {"_id": ObjectId("5c6c119e5724c9272ca7266d")}}}}
#myquery = {"local": {"testRuns": {"date": "20190219"}}}
#myquery = {"local": {"testRuns": { "$elemMatch": {"date": "20190219"}}}}

#myquery = {"local.testRuns.date" : "20190219"}

#5c6d70ce5e0ee62337b47db3,

#myquery = {"local.email" : "borisblokland@gmail.com"}
myquery = {"local.testRuns._id" : ObjectId('5c6d70ce5e0ee62337b47db3')}
newvalues = { "$set": { "local.testRuns.$.status": "done" } }

collection.update_one(myquery, newvalues)
document = collection.find_one(myquery)

print(document)
#print(document["local"]["testRuns"][0])