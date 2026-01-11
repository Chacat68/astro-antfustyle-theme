---
title: Methodology for Strategy Game Map System Design
pubDate: 2025-02-03
lastModDate: 2025-02-03
description: 'Exploring the core elements of strategy game map system design, including key technical solutions for tile selection, data management, information display, and more.'
image: 'https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250501174533830.png?imageSlim'
tags: [Game Development, Map System, Strategy Games, Technical Solutions]
category: 'Design Thinking'
draft: false
lang: en
---

![](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/20250203120229500.png?imageSlim)

## Preface

This article stems from my long-term experience and reflections accumulated in strategy game projects. As a developer passionate about strategy games, I have drawn much inspiration from classics like *Civilization*, *Age of Empires*, and *Stellaris*. Here, I will systematically share my insights on strategy game map design, hoping to provide some reference value for industry peers.

This article will discuss the topic from the following dimensions:
- Map Design and Planning: Including core elements such as tile selection, foundational settings, area planning, and information display.
- Data Management: Exploring solutions for data input, visualization, and output.
- Production Efficiency: Introducing technical means like procedural generation to enhance efficiency.

## Map Design and Planning

### Tile Selection

In games requiring the construction of massive-scale scenes, such as strategy games, open-world games, or MMORPGs, the Tile Map System is a classic and efficient technical solution. This technology divides the map into regular grid units (tiles), enabling modular management of scenes. It not only simplifies the map design and implementation process but also effectively improves rendering performance and memory utilization.

In mainstream games, common tile shapes mainly include the following:
- **Square Tiles**: The most basic grid form, represented by games like *Norland*.
- **Hexagonal Tiles**: The mainstream choice for turn-based tactical games, such as *Civilization VI* and *Romance of the Three Kingdoms XIV*.
- **Isometric (45-degree) Squares**: A common scheme for isometric perspective, used in games like *Rise of Kingdoms* and *Age of Empires II*.
- **Staggered Squares**: A compromise balancing visual effects and implementation difficulty, seen in games like *Three Kingdoms: Tactics* and *Romance of the Three Kingdoms XI*.

When selecting a tile type, the following key factors need to be considered comprehensively:

- **Space Utilization**: Under a fixed resolution (e.g., 1000×1000 pixels), the effective coverage of different tile shapes varies. For example, hexagonal tiles create irregular areas at map edges, resulting in a lower actual number of usable cells compared to square tiles.

- **Coordinate System Complexity**: Square tiles use a linearly increasing coordinate system, which is simple and intuitive to implement. Hexagonal tiles require axial or offset coordinate systems, increasing development and maintenance complexity.

- **Visual Presentation**: Hexagonal tiles handle terrain transitions more naturally and offer richer adjacency relationships. Square tiles are better suited for scenes with strong regularity, like building layouts.

- **Pathfinding System**: Square tiles can directly use the classic A* algorithm, while hexagonal tiles require special pathfinding algorithm adaptations, such as a modified Dijkstra's algorithm.

- **Performance Overhead**: Square tiles have simple data structures, offering high rendering and update efficiency. Hexagonal tiles require more complex data structures and collision detection logic.

In actual projects, the choice of tile type should be based on gameplay needs. For example, games emphasizing tactical gameplay might choose hexagonal tiles for more precise unit control, while games focusing on construction and management might opt for square tiles to simplify building layouts and resource planning.

### Foundational Settings

In another article of mine, [*A Brief Overview of the Game Map Creation Process*](https://www.chawfoo.com/article/design6), I discussed the methodology for game map planning in detail. Based on years of project experience, I summarize the map creation process into the following three core steps:

1.  **Definition of Basic Rules**: Systematically plan the core mechanics of the map, including foundational elements like tile shape design, terrain height systems, and collision/exclusion rules (e.g., handling conflicts between buildings and terrain obstacles).

2.  **Construction of Attribute Systems**: Based on the established rules, build a complete tile attribute system. This includes dimensions like terrain types, building classifications, area divisions, and event triggers, and defines detailed behavioral rules for each attribute type (e.g., mountains block movement, water restricts passage).

3.  **Design of Hierarchical Systems**: Systematically group attributes based on their relationships to establish a clear hierarchical structure. This layered management not only optimizes collaboration efficiency within the development team but also provides clear data access paths for programming implementation and art production.

### Area Planning

After completing the foundational settings, it's necessary to systematically plan scene elements based on the game's world view and background story. These core elements include terrain and landforms, building facilities, area divisions, and transportation networks.

Taking a mobile strategy game set in the Three Kingdoms period as an example, we adopted a "historical restoration" design philosophy. The entire game world was based on the geographical environment of the late Eastern Han Dynasty, strictly adhering to physical laws and accurately restoring the historical territory, including important cities, strategic passes, water transport docks, and courier road systems.

In terms of artistic presentation, we reserved ample creative space for scene design. The architectural style was primarily based on traditional, square-shaped mansions. The geographical features of each province and commandery aimed to restore historical characteristics: from the vast deserts of the northwest, to the snowy landscapes of the northeast, and the lush jungles of the southern Yue region. Each area was meticulously planned to highlight its regional characteristics.

This systematic planning and design was primarily based on the following three considerations:

1.  **Precise Quantification**: Converting all design elements (such as building dimensions, terrain ranges) into standardized tile units, providing the team with clear spatial reference standards.

2.  **Network Optimization**: Through reasonable road network planning, providing a foundation for subsequent pathfinding system development. Implementing differentiated pathfinding strategy optimizations based on travel distance (short, medium, long).

3.  **Scene Collaboration**: Providing the art team with clear guidelines for scene atmosphere design, facilitating the gradual enrichment of scene details during later iterative development, and ensuring that Technical Artists (TAs) could precisely control the production direction.

After completing this foundational planning, we further refined specific interaction rules, such as: dock facilities must be built adjacent to water, mountain terrain cannot be traversed, and water areas are restricted to ship navigation. Through these detailed settings, we ultimately constructed a logically rigorous and distinctive strategic map system.

### Information Planning

After completing area planning, it's necessary to build a complete information display system. This system must ensure players can intuitively understand map information while balancing the rationality of information hierarchy, interface aesthetics, and interactive experience. The following are the core design points:

**1. Information Layering Architecture**

Based on the importance and frequency of use, we divided map information into three levels:

•   *Level 1 Information (Persistently Displayed)*: Includes core strategic information such as city names, strategic points, resource nodes, and main roads. This information needs to be continuously presented to provide players with basic decision-making basis.

•   *Level 2 Information (Interaction-Triggered)*: Includes tactical information such as terrain features, building attributes, and resource production rates. Displayed on-demand through interactions like hovering or clicking to avoid information overload.

•   *Level 3 Information (Scene-Associated)*: Includes in-depth content like historical anecdotes, geographical records, and cultural background. This type of information is naturally revealed through specific scenes or plot points, enhancing the game's immersion.

**2. Interaction Design Paradigms**

•   *Static Identification System*: Using a unified visual language to design unique icon identifiers for core elements (e.g., cities, passes, ports). Ensuring icon style consistency with the overall art style to improve recognition.

•   *Dynamic Feedback Mechanism*: Implementing an intelligent interactive response system that promptly displays relevant detailed information (e.g., resource output, defense values, building functions) when players interact with map elements.

•   *Layer Management System*: Providing flexible layer display control, allowing players to freely switch between different types of information layers (e.g., resource distribution map, military deployment map) based on their needs, optimizing information acquisition efficiency.

**3. Visualization System Design**

•   *Visual Encoding System*: Building a systematic color and icon language, such as using warm colors for military facilities and cool colors for economic buildings, ensuring consistency and intuitiveness in information communication. Simultaneously, designing a modular icon system that highlights the functional characteristics of different building types while maintaining style unity.

•   *Dynamic Feedback System*: Designing layered visual feedback mechanisms, including:
    - State Changes: Using effects like gradients and flashes to highlight important events.
    - Interactive Response: Designing clear selected and highlighted states.
    - Transition Animations: Providing smooth animation effects when switching between different views.

•   *Multi-Level Rendering Strategy*: Based on the LOD (Level of Detail) principle, implementing an intelligent information display mechanism:
    - Strategic View (Farthest): Displays regional outlines, major cities, and resource points.
    - Tactical View (Medium Distance): Presents building clusters, terrain features, and road networks.
    - Detail View (Closest): Shows individual buildings, decorative objects, and environmental effects.

> Taking *Rise of Kingdoms* as an example, its infinite zoom system achieves smooth transitions from individual buildings to city clusters at different observation distances through LOD technology, ensuring visual effects while optimizing performance.

**4. Information Aggregation and Interaction**

•   *Hierarchical Information Panels*: Designing modular information display interfaces, dividing city data into three levels: core information (level, population), strategic information (military, economy), and background information (history, culture), facilitating players' quick access to needed information.

•   *Intelligent Hint System*: Dynamically adjusting the content depth and display timing of tooltips based on game context and player behavior, such as prioritizing military-related information during wartime and highlighting economic data during peacetime.

**5. Interactive Experience Optimization**

•   *Intelligent Filtering Mechanism*: Automatically adjusting the priority of information display based on the player's current tasks and game stage to avoid information interference. For example, automatically highlighting military facilities and strategic points during conquest phases.

•   *Scene Adaptation System*: Providing multiple specialized view modes (e.g., default view, strategic map view) and automatically switching to the most suitable display mode in different scenarios.

Through this systematic information display solution, we not only improved the game's usability and aesthetics but, more importantly, enhanced players' decision-making efficiency and immersive experience, making the complex information systems of strategy games clear and understandable.

## Data Management

### Input

The data management system is the core infrastructure for map development and requires systematic design based on a layered architecture. The following is a complete data management framework:

### Data Input System

Based on the principle of separation of duties, we divide the data hierarchy into three core modules:

1.  **Terrain Foundation Layer**
    - Height Data: Terrain height maps, contour line information.
    - Area Division: Administrative divisions, climate zones, ecosystems.
    - Resource Distribution: Strategic resource points, economic resource nodes, special resource areas.

2.  **Functional Construction Layer**
    - Building System: City layouts, pass facilities, special building clusters.
    - Transportation Network: Land route systems, waterway routes.
    - Military Facilities: Military fortresses, defensive works, supply stations.

3.  **Gameplay Logic Layer**
    - Quest System: Main storyline points, side quest triggers, dynamic events.
    - Event Management: Random event pools, special event chains, environmental events.
    - Character Distribution: Important NPC nodes, trade systems, faction distributions.

### Visualization Engine

As the key link connecting design concepts with final presentation, the visualization system is divided into three dimensions:

1.  **Development Environment Visualization**
    - Professional Editing Tools: Integration of industry-standard tools like Tiled.
    - Multi-Layer Management: Real-time preview support for complex layer systems.
    - Instant Validation: WYSIWYG (What You See Is What You Get) editing feedback mechanism.

2.  **Runtime Visualization**
    - Dynamic Rendering System: LOD optimization based on viewing distance.
    - Layered Display Control: Intelligent layer switching mechanism.
    - Performance Monitoring: Real-time resource usage analysis.

3.  **Debugging Toolset**
    - Grid Analyzer: Real-time display of collision grids.
    - Path Planner: Visualized pathfinding algorithms.
    - Performance Profiler: Hotspot area identification.

### Data Serialization

In engineering practice, we adopt a standardized XML schema as the data serialization solution, primarily considering the following factors:

1.  **Cross-Platform Compatibility**
    - Engine Adaptation: Supports direct import by mainstream game engines.
    - Toolchain Integration: Seamless connection with productivity tools like Excel.
    - Version Control: Supports incremental updates and diff comparisons.

2.  **Data Structure Design**

Adopting a layered XML schema design to achieve modular data management:

```xml
<map version="1.0" xmlns="http://www.chawfoo.com/schema/map">
  <properties>
    <!-- Basic map properties -->
    <property name="width" value="1000"/>
    <property name="height" value="1000"/>
    <property name="tileSize" value="64"/>
    <property name="mapType" value="strategy"/>
  </properties>
  
  <layers>
    <!-- Terrain layer: Contains basic landform information -->
    <layer name="terrain" visible="true" opacity="1.0">
      <properties>
        <property name="heightMap" value="terrain_height.raw"/>
        <property name="textureMap" value="terrain_texture.png"/>
      </properties>
      <data encoding="base64" compression="gzip">
        <!-- Compressed terrain data -->
      </data>
    </layer>

    <!-- Building layer: Records all building information -->
    <layer name="building" visible="true" opacity="1.0">
      <properties>
        <property name="collisionMap" value="building_collision.dat"/>
      </properties>
      <objects>
        <object id="1" name="castle" type="military" x="100" y="100">
          <properties>
            <property name="level" value="5"/>
            <property name="owner" value="player1"/>
          </properties>
        </object>
      </objects>
    </layer>
  </layers>
</map>
```

### Practical Case

In a 2D mobile strategy game project I was responsible for, we adopted a unified XML-based data exchange standard, achieving standardization of map data. The specific practice included two key phases:

**Data Standardization Phase**:
We first constructed a unified XML-based data exchange standard. This standard not only supported cross-departmental collaboration among planning, programming, and art teams but also reserved extension interfaces for subsequent procedural generation technology. Through the unified data model, we significantly improved toolchain integration efficiency, achieving seamless connection between planning configurations, art assets, and program logic.

**Technology Iteration Phase**:
After solving the data standardization issue, we introduced rule-based Procedural Content Generation (PCG) technology. By establishing a multi-level data management system, we not only addressed the problem of map data bloat but also achieved dynamic balancing of game content. This solution ensured game playability while greatly improving development efficiency.

## Summary

The map system of a strategy game is a complex engineering project requiring multi-dimensional collaboration. From map design and planning to data management, from production efficiency to technical implementation, each link requires systematic thinking and professional solutions. The methodological framework proposed in this article aims to provide developers with a practical, extensible guide.

With the rapid iteration of technology, cutting-edge technologies like AI-generated content (Procedural Content Generation) and real-time global illumination are reshaping the development paradigms of map systems. It is recommended that developers, while adhering to traditional methodologies, explore the opportunities and challenges brought by new technologies to create more innovative and competitive game works.

## References

- Open-source Map Editor: [Tiledmap](https://www.mapeditor.org/)

- [Hexagonal Grids Guide](https://www.redblobgames.com/grids/hexagons/)
- [Introduction to A* Pathfinding Algorithm](https://www.redblobgames.com/pathfinding/a-star/introduction.html)
- [Polygon Map Generator](https://www.redblobgames.com/maps/mapgen2/)
- [Open World Map Design Series](https://www.gcores.com/articles/162620)
- [How to Design Open World Maps? ①: The 3-6-1 Rule](https://www.gcores.com/articles/162620)
- [How to Design Open World Maps? ② — The Tangram Rule](https://www.gcores.com/articles/167209)
- [Polygonal Game Map Generation](https://indienova.com/indie-game-development/polygonal-map-generation-for-games-1/)

> The RSS address of this site has been updated. Please resubscribe, dear readers!

---

> 💡 Thank you for reading! Feel free to share the article or write to me for discussion.