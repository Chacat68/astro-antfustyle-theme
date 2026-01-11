---
title: "Getting Started with Isometric Tilemaps in Godot: A Quick Guide"
pubDate: 2025-03-22 22:43:00
lastModDate: 2025-03-22 22:43:00
description: 'This article introduces the concept of isometric projection and its application in games, and provides a detailed explanation of how to configure and use isometric tilemaps in the Godot engine. It covers basic setup of tilemap nodes, Y-sorting, tile size configuration, creating multi-tile objects, and advanced features like using tilemap layers.'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501170818848.png?imageSlim'
tags: [Game Development, Godot Engine, Isometric Projection, Tilemaps, 2D Games]
category: 'Learning from Others'
draft: false
lang: en
---

Isometric games originated in the late 1970s and early 1980s. Since then, they have been used in various game genres such as strategy games, simulation games, role-playing games, and puzzle games. Today, isometric games are still developed by indie developers and AAA studios alike. Isometric games offer a unique visual style and gameplay possibilities.

In this article, I will briefly introduce isometric projection and isometric games, and then we will dive into how to create stunning isometric games using Godot's TileMap node. Let's get started!

## What is Isometric Projection?

Isometric projection is a method of projecting a 3D world onto a 2D space, like a piece of paper or a computer monitor. It falls under the category of orthographic camera projections. In isometric projection, objects may lose some depth and appear flatter than the natural 3D world we see. This is because isometric objects have no vanishing point; instead, each axis of the object runs parallel to the world axes.

In an isometric environment, objects appear the same size regardless of their distance from the viewer or camera. In contrast, perspective projection makes distant objects appear smaller and closer objects appear larger.

For a more detailed explanation of isometric projection, check out the article *Best Examples of Isometric Games and How They Work*.

**Camera Projection Types**

### Examples of Games with Isometric Projection

There are many examples of isometric games across various genres, such as strategy games, city builders, and RPGs. Some notable classic isometric games include *Red Alert 2*, *Warcraft 2*, *StarCraft 1*, the *Age of Empires* series, the *SimCity* series, the *Tropico* series, *Baldur's Gate 1*, *Baldur's Gate 2*, and more.

If you revisit any of these games (or watch gameplay videos), you'll notice that the camera always maintains the same angle, and objects appear the same size whether they are near or far.

### Other Types of Camera Projections Used in Video Games

Over the years, video game developers have used various projection types. All these projections offer different ways to project a 3D world onto a 2D screen. Here are some of the most popular ones:

- **Perspective Projection**: This camera projection mimics human vision, providing a 3D view. It is commonly used in first-person shooters, third-person shooters, role-playing games, adventure games, as well as sports and racing games.
- **Top-Down Projection**: Also known as a bird's-eye view, this projection places the camera directly above the world, looking down. Classic games like the original *Grand Theft Auto* used this technique.
- **Dimetric / Trimetric Projection**: The orthographic projection group includes several types distinguished by the camera angle. The camera angle defines the ratio of an object's width to its height.

---

---

## How to Develop Isometric Games in Godot

Godot provides an excellent framework for developing isometric games. The TileMap node in Godot allows you to slice a sprite sheet into sprite images and project them onto the screen using your chosen camera projection. When dealing with isometric projection for the TileMap node, several options are available. In this article, the focus will be on the most commonly used type of isometric projection.

Creating a TileMap node with an isometric view is relatively straightforward. To do this, follow these steps:

1. Prepare a sprite sheet containing the desired tiles as a single image file (usually a png file with an alpha channel) and import it into your Godot project.
2. Create a new TileMap node in the scene and select it.
3. In the Inspector panel, generate a new TileSet resource.
4. Select the "Isometric" projection in the "Tile Shape" property, and leave the "Tile Layout" and "Tile Offset Axis" properties at their default values.
5. Go to the TileSet tab at the bottom of the screen and attach the imported sprite sheet image.
6. Configure the TileSet so that all tiles are ready. If you have complex objects that require multiple tiles to be pieced together, keep reading. I address this later.

**TileSet Properties**

## Configuring Isometric Camera Projection for the TileMap Node in Godot

Besides specifying the camera projection for the tilemap, you also need to adjust several parameters to ensure tiles are drawn and behave correctly. The first step is to enable Y-sorting, and the second is to define the tile size for the TileSet as well as for the TileMap node.

### What is Y-Sorting and How to Sort Tiles Correctly

Y-sorting is the process of arranging the drawing order of visible objects on the screen. In the case of an isometric tilemap, each tile is drawn in its specified order. Incorrect Y-sorting can lead to visual issues. Typically, tiles lower on the tilemap are drawn before those above them. Drawing in this order creates the illusion of a 3D camera while actually operating in 2D space.

Once you create a TileMap node in Godot and configure it for isometric projection, you'll see a warning next to the TileMap node indicating that the TileMap node and all internal layers should have Y-sorting enabled. Ignoring this warning may result in tiles being drawn in the wrong order, leading to visual inconsistencies.

To resolve these issues, follow these steps:

1. Enable the "Enable Y-Sort" property for the TileMap node (Inspector -> CanvasItem -> Sorting).
2. Enable the "Enable Y-Sort" property for each layer within the TileMap node (Inspector -> TileMap -> Layers).

**TileMap Sorting Properties**

### The Difference Between Tile Size in TileSet and Tile Size in TileMap

Godot distinguishes between tile size defined in the TileSet and tile size defined in the TileMap. Understanding these differences is crucial, as it can save you a lot of headaches as your tilemap evolves.

- **Tile Size in TileSet**: Specifies the size of the tile images in the sprite sheet. It includes the actual image pixels that will be drawn on the screen.
- **Tile Size in TileMap**: Specifies the surface size of the tile. Each tile has a Z component that defines the height of the object within the tile. Since tiles are drawn partially overlapping, the tile size defined in the TileMap includes only the surface portion, not accounting for the depth of the object. This information helps the TileMap node understand the precise occlusion of each object within the tile.

**Tile Size Illustration**

## Advanced Features of the TileMap Node in Godot

In most cases, you'll need to leverage more advanced features of the tilemap, such as multi-tile objects or using layers to stack tiles on top of each other. These features enable you to generate tilemaps with diversity and complexity in your games. Let's explore these features one by one.

### Creating Multi-Tile Objects and Aligning Them to the Isometric Grid

Multi-tile objects are combinations of multiple tiles defined in the TileSet. For example, the tile size in the TileSet might be set to a 64×32 rectangle, but a tall object spanning 3 tiles might require a 64×96 tile. Godot allows you to combine tiles and create complex objects.

#### **How to Define Multi-Tile Objects in the TileSet in Godot**

Defining multi-tile objects in Godot is relatively easy. Open the TileSet editor tab and follow these steps:

1. Click the "Settings" button to enable atlas setup mode.
2. Hold down the Shift key on your keyboard.
3. In the tile area, hold down the left mouse button and drag to select all the tiles you want to combine.
4. Release the mouse button and the keyboard key to create the complex object.

Once the object is created, you'll see a larger tile containing all the selected tiles. You can now place this large tile on the map via the TileMap editor tab.

**Multi-Tile Object**

#### **Using the "Texture Origin" Property to Align Multi-Tile Objects to the Isometric Grid**

If you followed the steps above to create a multi-tile object and try to place it on the map, you might notice that the tile isn't placed exactly where your mouse cursor is. This is because the origin of the complex tile is still at its center. If this works for you—great! If not—you might need to change the origin point of the object. For me, the most intuitive location for a tile's origin is at the bottom-left corner of the tile.

To change the origin point of a tile, open the TileSet editor tab and follow these steps:

1. Click the "Select" button to enable tile selection mode.
2. Select the large tile you want to modify.
3. In the "Base Tile" menu that appears on the left, open the "Rendering" section.
4. Change the "Texture Origin" vector to offset the actual origin point of the tile.

As you change the origin values, you'll notice a diamond marker appear on the tile indicating the new origin point location. Note that if the position is outside the tile's bounds, text with the new input offset will be displayed.

**Texture Origin Settings**

### Using TileMap Layers to Stack Tiles on Top of Each Other

TileMap layers allow you to place tiles on top of each other without overwriting tiles already present on the map.

For example, the floor of a castle could be the bottommost layer of the tilemap, walls, chairs, tables, doors, and other decorations could be placed on a second layer, and chandeliers could be placed on a third layer.

Layer stacking ensures that the drawing order remains consistent no matter what happens in the game, meaning tables, chairs, and decorations will always be drawn above the floor, and chandeliers will always be drawn above the decorations. After all, it wouldn't make sense for tables and chairs to be under the floor, right?

**TileMap Layer List**

#### **How to Use TileMap Layers to Stack Multiple Tiles on Top of Each Other**

To create multiple TileMap layers, open the Inspector panel for the TileMap node and follow these steps:

1. Click the "Add Element" button in the TileMap layer list (Inspector -> TileMap -> Layers).
2. Give the new layer an appropriate name and enable the "Enable Y-Sort" checkbox.
3. Update the "Z Index" field to represent the new layer. Lower values are rendered behind, while higher values are rendered in front (closer to the camera).
4. Go to the TileMap editor tab and select the current target layer (top-right corner of the tab).
5. Select a tile and start placing it on the map.

You'll notice that when you switch layers, all other layers except the selected one become dimmed so you can clearly see the current layer. If you'd like to learn more about TileMap layers, check out the article *Godot 4 TileMap Layers: Everything You Need to Know*.

#### **Rearranging TileMap Layers to Draw Tiles Correctly**

The order of layers in the TileMap layer list does not determine the drawing order; instead, the "Z Index" field does. While the order in the layer list changes the drawing order of tiles when all layers have the same Z-index, tiles from different layers can still mix and cause visual issues. The most effective way to determine the drawing order of layers in a tilemap is to define a Z-index for each layer. Layers are drawn from low Z-index to high Z-index.

---

---

## My Thoughts on Isometric Tilemaps in Godot

Godot offers a wealth of features for isometric games. The user interface isn't always intuitive, but once you understand the concepts, things go relatively smoothly. For a deeper dive into the TileMap node and its capabilities, you can continue reading the official Godot TileMap documentation: https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html.

If you'd like to learn more about Godot and game development, explore the Night Quest Games blog. You'll find many articles that can help you on your game development journey. Good luck!

If this article was helpful to you, please consider supporting this blog with a donation. Your contributions are greatly appreciated and allow me to continue maintaining and developing this blog. Thank you!

---

**Reference Address**  
Original link: https://www.nightquestgames.com/introducing-isometric-tilemaps-in-godot/

> The site's RSS address has been updated. Please resubscribe, dear readers!

---

> 💡 Thank you for reading! Feel free to share this article or write to me to exchange ideas.