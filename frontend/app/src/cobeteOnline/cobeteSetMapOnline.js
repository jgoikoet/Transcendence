'use strict'

let rectangleList = [];

export function createMap(map)
{
    const keys = Object.keys(map);
    rectangleList = []

    for (let i = 1; i < keys.length; i++)
    {
        let rectangle = {
            x: map[keys[i]][0],
            y: map[keys[i]][1],
            width: map[keys[i]][2],
            height: map[keys[i]][3],
            color: map[keys[i]][4]
        }
        rectangleList.push(rectangle);
    }
    return rectangleList;
}
