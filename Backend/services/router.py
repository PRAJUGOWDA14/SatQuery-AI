def route_query(query: str) -> str:
    q = query.lower().strip()

    if any(word in q for word in [
        "change",
        "changed",
        "difference",
        "before and after",
        "compare"
    ]):
        return "change_detection"

    if any(word in q for word in [
        "area",
        "acres",
        "hectares",
        "size",
        "how much land"
    ]):
        return "area_analysis"

    if any(word in q for word in [
        "water",
        "lake",
        "river",
        "pond"
    ]):
        return "water_analysis"

    if any(word in q for word in [
        "forest",
        "vegetation",
        "greenery",
        "trees"
    ]):
        return "vegetation_analysis"

    if any(word in q for word in [
        "building",
        "buildings",
        "urban",
        "city",
        "road"
    ]):
        return "builtup_analysis"

    return "general_analysis"