---
title: A Brief Overview of Game Map Creation Process
pubDate: 2020-12-21
lastModDate: 2020-12-21
description: 'Introduces the map design methodology for strategy games, including prototype construction, terrain detailing, and flow line design. Through practical examples, it helps readers understand how to design reasonable and engaging game maps.'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501175457785.png?imageSlim'
tags: [Game Design, Map Creation, Strategy Games, Terrain Design, Three Kingdoms, Design Methodology]
category: 'Design Thinking'
draft: false
lang: en
---

😀 Using a Three Kingdoms map as an example, let me introduce the map design methodology for strategy games, mainly covering prototype construction, terrain detailing, and flow line design.

# 📝 Prototype Construction

## Basic Rules

> First, clarify the basic map rules:
>
- The map is composed of tiles, each with terrain attributes. Military units can move on the map.
- Calculate movement pixels per second, set a base speed, then fine-tune the speed of each unit type based on this base speed.
- Mountain terrain is impassable; water terrain requires vehicles.
- Buildings will be placed on the map, each belonging to a faction, with a friend-or-foe judgment mechanism based on faction.
- The map is divided into multiple regions, with some game rules defined according to these regions.

## Map Layering

> Based on the above basic rules, we can decompose and refine the map into three components: terrain, buildings, and regions.
>

These three basic elements define three layers:

- Terrain Types: Plains, Forests, Grasslands, Swamps, Mountains
- Buildings: Cities, Passes, Docks, Forts, Watchtowers
- Regions: Marked using region IDs

## Layer Rules

The building layer is displayed above the terrain layer. Buildings have attribute parameters and collision ranges, which affect the AI pathfinding logic of units on the map.

Units move on terrain, with speed attributes set (including terrain and unit speed parameter tables). Mountains are designed as impassable and can be treated as collision bodies. Water is designed to be traversable only by boats; units without boats are considered unable to pass. Docks are entry points to water bodies. Initially, docks do not belong to the player's faction.

Using a map editor, set the overall map size (using an N*x*N format), define the size of each region, and set the general environment and ecology, such as the deserts of Tibet.

## Terrain Detailing

Refine the elements of each region based on references, including mountains, water bodies (rivers, lakes), plains, forests, etc. As shown below:

![Terrain Detailing 1](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20201221133145.jpg)

Consider the distance between cities and ports, the route distance between ports on opposite banks of a river, and whether it's reasonable. I used AI units to measure normal walking movement.

![Terrain Detailing 2](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20201221133203.jpg)

Based on the terrain, resource distribution design can be extended. For example: Near the city of Jianye, which belongs to the Eastern Wu region, there are large forest areas with abundant wood resources, little open land, and scarce food resources.
Based on the design bias of each region, trade gameplay can be derived later to address resource inequality.

## Flow Line Design

![Flow Line Design 1](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20201221133215.jpg)

Flow line design determines how many routes connect a city to adjacent regions. Taking Xuchang and Luoyang as examples, Xuchang is well-connected in all directions with 4 flow lines connecting to Wan, Runan, etc. Luoyang has only two flow lines, leading only to Hulao Pass and Xinfeng Port.

I would design Xuchang as a plains city, placing mountains and forests in the area between the two flow lines to create a reasonable ecology, as shown below:

![Flow Line Design 2](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20201221133241.jpg)

Place elements like cities, farmlands, forests, lumber mills, etc., to enrich the map's composition.

# 🤗 Summary

This article introduced the map design methodology for strategy games, including prototype construction, terrain detailing, and flow line design. The map is divided into three layers: terrain, buildings, and regions, with basic rules and layer rules defined. Flow line design determines the routes connecting cities to adjacent regions, allowing for biased resource distribution and ecological creation based on design. Reference resources include "Guan Cang Hai" and "All History."

# 📎 References

- "Guan Cang Hai" is a map website containing map data from various Chinese dynasties, which can be used as a reference.
- "All History" is an encyclopedia of Chinese history where you can search for clues about dynasties, providing references for details.

Cited by [gameres](https://www.gameres.com/888647.html)

> 💡 Thank you for reading! Feel free to share the article or contact me to exchange ideas.

> The site's RSS address has been updated. Please resubscribe, dear readers!