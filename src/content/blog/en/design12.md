---
title: "Infinite Zoom: An Analysis of Camera Design in SLG Games"
pubDate: 2021-11-18
lastModDate: 2021-11-18
description: 'Discusses the application of infinite zoom design in games, including design approaches and solutions for zoom levels, information layering, and resource management queues.'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501174459433.png?imageSlim'
tags: [Game Design, Infinite Zoom, Resource Management, Information Layering, Strategy Games]
category: 'Design Thinking'
draft: false
lang: en
---

# Discussing the Design of Infinite Zoom

## 1. What is Infinite Zoom?

Infinite zoom is a camera movement mechanism that gained widespread recognition through its application in the mobile game *Rise of Kingdoms*. Players can drag their fingers to seamlessly transition the camera from a micro perspective all the way up to a macro perspective. For strategy games, this is a design mechanism that adds significant value.

Games employing infinite zoom design allow players to experience seamless camera transitions. The cameras are all set within a single scene, and switching between them involves no loading animations, ensuring an uninterrupted player experience.

However, implementing infinite zoom also imposes constraints on the design, requiring considerable effort in areas such as data processing, scene management, and interaction optimization.

- \*PS:\*\* The following examples use industry-classic SLG mobile games like *Rise of Kingdoms* and *Three Kingdoms Tactics*. The parameters mentioned are for illustrative purposes and do not represent actual game data.

## 2. Zoom

Let's start with zoom itself. The ability to zoom the camera up and down means designers need to plan for multiple levels of units and information display, and establish a set of management rules in conjunction with scene objects and world unit controls.

Taking *Rise of Kingdoms* as an example, roughly three levels are defined, from the player's city → the world → the global map.

- Player's City

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/JF0xnb.png)

- The World

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/1CYNSn.png)

- The Global Map

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/uJvjeg.png)

Based on these levels, designers need to specify which units (including UI, effects, etc.) can appear at each level.

City: Displays the content of the player's main city.

World: Displays content in the open world.

Global Map: Displays content from the open world in an iconized form.

Put yourself in the camera's perspective and assign height values for the infinite zoom movement, e.g., 0~1000. Define segments for each level, for example:

City Level: 0~100

World Level: 101~500

Global Map Level: 501~1000

Then allocate the planned content to these camera levels and design a resource management queue mechanism based on levels (this mechanism should fully consider the suggestions of Technical Artists and artists, requiring input from team members with professional expertise).

During infinite zoom, the camera can stop at any height, so performance at every camera position must be considered. *Rise of Kingdoms* implements many effects to ensure transitions feel smooth and not abrupt.

1.  When the player is at the lowest camera level and drags the camera away from the city area, a rising camera animation is played to mitigate issues with map precision at different camera heights.
2.  During the transition from the player's city back to the world, a switching animation is applied. The player's city and resource plots undergo morphological changes. For example, farmland transitions from a full field shrinking down to a single plot.
3.  *Rise of Kingdoms* uses a unified rule for its transition animation: buildings around the main building's collision area disappear. Ultimately, when returning to the world level, only the main hall building is displayed. This effect is applied between the city and world levels for the player's city, buildings, forests, wild monsters, etc. From a more microscopic angle, more details can be presented.

## 3. Information

Next, let's discuss information. With infinite zoom implemented, the player's focus shifts from themselves, to the surrounding area, to the state/province, and finally to the global scope. Designers need to control information display, referencing the resource management queue to establish rules for UI display in the open world scene.

For instance, *Rise of Kingdoms* plans for multiple levels, with building effects and UI display rules set for each level.

### 3.1 Setting the Default Level

What is the default level? The standard is the default camera height when the player enters the game, set as the default level. This camera height needs to be communicated to other departments as the baseline design standard.

Once the default level is determined, establish display rules for all units in the world at this level. These rules can be divided into several dimensions:

1.  Buildings with logical functions, including display rules for different logical states.
2.  Scene objects, which may have detailed rules regarding collision, transparency, etc.
3.  Rules for displaying UI, effects, and state changes on world units.

Level designers and artists also plan based on the default height to ensure the player sees the richest effects at this default view.

### 3.2 Map Layering and LOD

With infinite zoom design, the camera moves in height, meaning the number of objects within the frame increases. This necessitates a technical and management strategy to control rendering, ensuring the presented visuals meet expectations.

LOD (Level of Detail) is one solution to this problem. It allows an object to display different models based on the camera's distance, thereby saving performance overhead.

> LOD stands for Level Of Detail. In computer graphics, LOD is used to reduce the rendering complexity of 3D models when objects are far from the observer, or based on factors like importance, position, speed, or view-dependent parameters.

Further reading: [Exploring LOD Technology in Games](https://zhuanlan.zhihu.com/p/51944864)

By layering the scene with LOD and pre-setting the quality and precision of scene objects, a balance can be achieved between scene quality and performance cost.

### 3.3 Information Layering

Designers also need to control the displayed information (scene objects, units, and UI) for each level, following the LOD layering concept.

As the camera moves upward, the observed content increases. Based on the level, different display rules need to be formulated to handle models and UI, controlling the unit information the player sees on screen.

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/1P42qR.png)

Then, list the behaviors for each unit and establish display rules for each behavior. This rule set needs to consider generality and management cost, maintaining consistency and minimizing special cases to avoid high maintenance costs later.

## 4. Management Tools

### 4.1 Resource Management Queue

In large-scale world game projects, the volume of art assets and data in the world scene is massive. Therefore, rules need to be established so that art assets and data can be presented in a structured manner.

Scene management can reference the LOD layering approach, allocating scene resources across LOD1~4 levels. Create a resource management table and synchronize it with artists and TAs. Based on this table, determine rendering levels and queues.

Designers can then list objects based on different LOD levels and establish display priorities.

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/Vjuhv6.png)

Assign a level and height to each object, and further detail sub-elements on the object, such as UI, effects, etc. Collaborate with TAs (programmers) and artists to establish rules for the rendering queue, dividing levels and allocating heights.

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/T9SPBO.png)

List all objects in the open world. Define the display level and height for single objects. For gameplay units that may have multiple attached objects (e.g., troops, UI, effects), if the global management strategy is insufficient, specific display rules may need to be created for individual units.

After setting the level display rules, assign a priority to each object. Objects with higher priority will be displayed first during loading, ensuring the overall visual presentation meets expectations.

## 5. Summary

This article briefly outlines the design considerations after implementing infinite zoom in a project and lists my proposed solutions to encountered problems. A follow-up article will discuss the pressures on art style selection and performance after adopting this design.

> 💡 Thank you for reading! Feel free to share the article or contact me to exchange ideas.

> The RSS feed address for this site has been updated. Please resubscribe, dear readers!