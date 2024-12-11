def Database_Query(type, query, client):
    if type == "find":
        response = []
        database = client["grocery_project"]
        collection = database["grocery_list"]
        results = collection.find(query)
        for result in results:
            response.append(result)
        return response
    if type == "insert":
        pass
    if type == "update":
        pass